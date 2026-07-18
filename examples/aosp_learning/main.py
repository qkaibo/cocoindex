"""
AOSP Code + Wiki Unified Learning Pipeline — Qdrant FP16, multi-project.

AOSP code is learned by **large conceptual modules** (BSP, APP, FRAMEWORK),
not by directory — because BSP code is scattered across kernel/, hardware/,
device/, vendor/. This pipeline tags every chunk with its module label and
supports module-scoped search.

Each chip/project gets its own Qdrant collection and checkpoint, so
Allwinner H618 and MTK H618 never mix.

Usage
-----
Index a project:
    cocoindex update main:aw_h618
    cocoindex update main:mtk_h618

Index only one module (declarative — modules omitted from COCOINDEX_MODULES are
treated as removed and their indexed data is cleaned up; to add APP on top of
an existing BSP index, accumulate: COCOINDEX_MODULES=BSP,APP):
    COCOINDEX_MODULES=BSP cocoindex update main:aw_h618

Search:
    python main.py --project aw_h618 "MIPI DSI lane config"
    python main.py --project aw_h618 --module BSP "gpio pinctrl"

Environment variables:
    COCOINDEX_MODULES              Comma-separated module names to index (default: all).
                                   Declarative: modules omitted are treated as removed.
                                   Always accumulate (BSP,APP). A guard aborts the
                                   pipeline if an already-indexed module is missing,
                                   unless COCOINDEX_ALLOW_MODULE_REMOVAL=1 is set.
    QDRANT_URL                     Qdrant server URL (default: http://localhost:6334)
"""

from __future__ import annotations

import asyncio
import fnmatch
import os
import pathlib
import re
import threading
from typing import AsyncIterator, Sequence

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from qdrant_client.http.models import Datatype

import cocoindex as coco
from cocoindex.connectorkits.target import ManagedBy
from cocoindex.connectors import localfs, qdrant
from cocoindex.ops.sentence_transformers import SentenceTransformerEmbedder
from cocoindex.ops.text import RecursiveSplitter
from cocoindex.resources.chunk import Chunk
from cocoindex.resources.file import FileLike, PatternFilePathMatcher
from cocoindex.resources.id import IdGenerator
from cocoindex.resources.schema import VectorSchema

from models import (
    CHUNK_TYPES,
    ModuleConfig,
    MODULES,
)

import numpy as np


# ── Configuration ───────────────────────────────────────────────────────

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6334")
TOP_K = 10

EMBED_MODEL = "BAAI/bge-m3"
# Native Chinese + English + code support. FP16 all the way: model inference
# in fp16 (1.1 GB VRAM) + Qdrant vectors in fp16 (~3.8 GB / 2M chunks).
VEC_DIM = 1024


def _collection_name(project: str) -> str:
    return f"aosp_{project}"


# ── Context keys ────────────────────────────────────────────────────────

QDRANT_DB = coco.ContextKey[QdrantClient]("qdrant")
EMBEDDER = coco.ContextKey[SentenceTransformerEmbedder]("embedder", detect_change=True)
SPARSE_TOKENIZER = coco.ContextKey["_SparseTokenizer"]("sparse_tokenizer")


# ── Splitters ───────────────────────────────────────────────────────────

_code_splitter = RecursiveSplitter()
_wiki_splitter = RecursiveSplitter()


# ── Module resolution ───────────────────────────────────────────────────

_CODE_GLOBS = [
    "**/*.c", "**/*.h", "**/*.cpp", "**/*.cc", "**/*.hpp",
    "**/*.java",
    "**/*.dts", "**/*.dtsi",
]
_CODE_EXCLUDES = ["**/.*", "**/out", "**/__pycache__", "**/build"]

# H618 is ARM Cortex-A53 (arm64); exclude source for unrelated architectures
# to keep the index lean and avoid noise from x86/mips/powerpc code.
_NON_ARM_ARCHES = [
    "alpha", "arc", "c6x", "csky", "h8300", "hexagon", "ia64",
    "m68k", "microblaze", "mips", "nds32", "nios2", "openrisc",
    "parisc", "powerpc", "riscv", "s390", "sh", "sparc", "um",
    "unicore32", "x86", "xtensa",
]
_CODE_EXCLUDES += [f"**/arch/{a}/**" for a in _NON_ARM_ARCHES]

_WIKI_GLOBS = ["**/*.md", "**/*.rst", "**/*.txt"]
_WIKI_EXCLUDES = ["**/.*"]

_CODE_LANGUAGES = {
    ".c": "c", ".h": "c",
    ".cpp": "cpp", ".cc": "cpp", ".cxx": "cpp", ".hpp": "cpp",
    ".java": "java",
    ".dts": "dts", ".dtsi": "dts",
}


def _guess_language(filename: str) -> str | None:
    ext = pathlib.PurePath(filename).suffix.lower()
    return _CODE_LANGUAGES.get(ext, None)


def _resolve_module(relative_path: str, modules: Sequence[ModuleConfig]) -> str | None:
    for mod in modules:
        for glob_pattern in mod.code_globs:
            if fnmatch.fnmatch(relative_path, glob_pattern):
                return mod.name
    return None


def _active_modules() -> list[ModuleConfig]:
    names = os.environ.get("COCOINDEX_MODULES", "")
    if names:
        wanted = {n.strip() for n in names.split(",") if n.strip()}
        return [m for m in MODULES if m.name in wanted]
    return list(MODULES)


class FP16Embedder(SentenceTransformerEmbedder):
    """SentenceTransformerEmbedder with fp16 model weights (~1.1 GB VRAM)."""

    def _get_model(self):
        if self._model is None:
            model = super()._get_model()
            model.half()
        return self._model


# ── Sparse tokenization (CPU-only, no GPU forward pass) ───────────────
# Qdrant's modifier="idf" handles IDF weighting at query time, so we only
# need to store token IDs with uniform weight=1.0. This is a lightweight
# CPU-only tokenizer call (~0.04ms/chunk) — no model forward pass needed.

class _SparseTokenizer:
    """Wraps a SentencePiece tokenizer for sparse vector generation (CPU)."""

    def __init__(self, model_name: str = EMBED_MODEL) -> None:
        from transformers import AutoTokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(model_name)

    def tokenize(self, text: str, max_tokens: int = 8192) -> tuple[list[int], list[float]]:
        """Return unique token IDs with uniform weight=1.0 for sparse vector."""
        ids = self._tokenizer.encode(text, add_special_tokens=False)
        seen: set[int] = set()
        unique: list[int] = []
        for tid in ids[:max_tokens]:
            if tid not in seen:
                seen.add(tid)
                unique.append(tid)
        return unique, [1.0] * len(unique)


_sparse_tokenizer_lock = threading.Lock()


@coco.fn
def _tokenize_to_sparse(
    text: str,
    chunk_type: str,
    file_path: str,
    module: str,
    tokenizer: _SparseTokenizer,
) -> tuple[list[int], list[float]]:
    """Tokenize chunk metadata into sparse vector (CPU-only)."""
    full_text = f"{chunk_type} {module} {file_path} {text}"
    return tokenizer.tokenize(full_text)


# ── Lifespan ─────────────────────────────────────────────────────────────

@coco.lifespan
async def coco_lifespan(builder: coco.EnvironmentBuilder) -> AsyncIterator[None]:
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=True)
    builder.provide(QDRANT_DB, client)
    # BGE-M3 fp16 via FP16Embedder (inherits batching + memo + GPU runner)
    embedder = FP16Embedder(EMBED_MODEL, device="cuda")
    builder.provide(EMBEDDER, embedder)
    # Sparse tokenizer (CPU-only, no GPU forward pass)
    with _sparse_tokenizer_lock:
        sparse_tok = _SparseTokenizer(EMBED_MODEL)
    builder.provide(SPARSE_TOKENIZER, sparse_tok)
    yield


def _ensure_collection(client: QdrantClient, name: str) -> None:
    """Create the Qdrant collection with dense + sparse hybrid vectors.

    Dense named vector for semantic search (FP16 storage). Sparse named vector
    with modifier="idf" for keyword matching — Qdrant computes IDF weights at
    query time, so we only store token IDs with uniform weight=1.0.
    """
    if client.collection_exists(name):
        return
    client.create_collection(
        collection_name=name,
        vectors_config={
            "dense": qdrant_models.VectorParams(
                size=VEC_DIM,
                distance=qdrant_models.Distance.COSINE,
                datatype=Datatype.FLOAT16,
            ),
        },
        sparse_vectors_config={
            "sparse": qdrant_models.SparseVectorParams(
                index=qdrant_models.SparseIndexParams(
                    on_disk=True,
                ),
                modifier="idf",
            ),
        },
    )
    print(f"[qdrant] Created collection '{name}' (dense fp16 + sparse idf)")


def _guard_module_removal(
    client: QdrantClient, collection_name: str, active: Sequence[ModuleConfig],
) -> None:
    """Refuse to run if an already-indexed module is missing from this run.

    CocoIndex is declarative: modules absent from the current run are
    treated as removed and their vectors get cleaned up.  Aborting here
    prevents an accidental COCOINDEX_MODULES typo from silently wiping
    millions of vectors.  Set COCOINDEX_ALLOW_MODULE_REMOVAL=1 to confirm
    an intentional removal.
    """
    if os.environ.get("COCOINDEX_ALLOW_MODULE_REMOVAL") == "1":
        return
    if not client.collection_exists(collection_name):
        return
    active_names = {m.name for m in active}
    missing: list[tuple[str, int]] = []
    for mod in MODULES:
        if mod.name in active_names:
            continue
        count = client.count(
            collection_name=collection_name,
            count_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="module",
                        match=qdrant_models.MatchValue(value=mod.name),
                    )
                ]
            ),
            exact=True,
        ).count
        if count > 0:
            missing.append((mod.name, count))
    if missing:
        detail = ", ".join(f"{name} ({count} chunks)" for name, count in missing)
        keep_all = ",".join(sorted(active_names | {n for n, _ in missing}))
        raise RuntimeError(
            f"已索引模块未在本次 COCOINDEX_MODULES 中声明: {detail}。"
            f"继续运行会删除这些模块的全部向量！"
            f"请累加声明（COCOINDEX_MODULES={keep_all}），"
            f"或不设环境变量索引全部；确认要删除请设 "
            f"COCOINDEX_ALLOW_MODULE_REMOVAL=1。"
        )


# ── Shared chunk writer ─────────────────────────────────────────────────


# Patterns for extracting enclosing symbol names (function / struct / class /
# DTS node) from source code.  Used to enrich chunk payload and embedding
# context so that search results show the logical owner of each snippet.
_FUNC_LINE = re.compile(
    r'^\s*(?:static\s+|inline\s+|const\s+|extern\s+|virtual\s+|'
    r'final\s+|abstract\s+|synchronized\s+|public\s+|private\s+|'
    r'protected\s+|__\w+\s+)*'
    r'[\w\s*&<>,:\[\]]+\s+'
    r'(\w+)\s*\(',
    re.MULTILINE,
)
_CTOR_LINE = re.compile(r'^\s*(\w+)\s*\([^)]*\)\s*:\s*\w+\(', re.MULTILINE)
_STRUCT_LINE = re.compile(
    r'^\s*(?:typedef\s+)?struct\s+(\w+)',
    re.MULTILINE,
)
_CLASS_LINE = re.compile(
    r'^\s*(?:public\s+|private\s+|protected\s+)?class\s+(\w+)',
    re.MULTILINE,
)
_DTS_NODE_LINE = re.compile(r'^\s*(\w[\w-]*)\s*\{', re.MULTILINE)
_MACRO_LINE = re.compile(r'^\s*#define\s+(\w+)', re.MULTILINE)


def _find_enclosing_symbol(source_text: str, chunk_byte_offset: int, language: str) -> str | None:
    """Return the nearest enclosing symbol name before this chunk position."""
    if not source_text or chunk_byte_offset <= 0:
        return None
    before = source_text[:chunk_byte_offset]
    lines = before.split('\n')
    patterns = [_FUNC_LINE, _CTOR_LINE, _STRUCT_LINE, _MACRO_LINE]
    if language in ('c', 'cpp'):
        patterns = [_FUNC_LINE, _STRUCT_LINE, _MACRO_LINE]
    elif language == 'java':
        patterns = [_FUNC_LINE, _CLASS_LINE]
    elif language == 'dts':
        patterns = [_DTS_NODE_LINE, _MACRO_LINE]
    for line in reversed(lines):
        for pat in patterns:
            m = pat.search(line)
            if m:
                return m.group(1)
    return None


def _find_enclosing_heading(source_text: str, chunk_byte_offset: int) -> str | None:
    """Return the nearest markdown / RST heading before this chunk position."""
    if not source_text or chunk_byte_offset <= 0:
        return None
    before = source_text[:chunk_byte_offset]
    for line in reversed(before.split('\n')):
        m = re.match(r'^#{1,6}\s+(.*)', line)
        if m:
            return m.group(1).strip()
        m = re.match(r'^[-=]{3,}$', line)
        if m:
            continue
    return None


def _build_embed_text(chunk_text: str, chunk_type: str, fpath: str, module: str) -> str:
    """Prefix chunk text with file-level context for richer embedding."""
    if chunk_type == 'code':
        prefix = f'// File: {fpath}\n// Module: {module}\n'
    else:
        prefix = f'# Wiki: {fpath}\n# Module: {module}\n'
    return prefix + chunk_text


@coco.fn
async def write_chunk(
    chunk: Chunk,
    module: str,
    project: str,
    chunk_type: CHUNK_TYPES,
    file_path: pathlib.PurePath,
    language: str,
    title: str,
    source_text: str,
    id_gen: IdGenerator,
    target: qdrant.CollectionTarget,
) -> None:
    # ── Dense semantic embedding (batched GPU, ~1.4ms/chunk, FP16) ──
    embed_text = _build_embed_text(chunk.text, chunk_type, str(file_path), module)
    embedding = await coco.use_context(EMBEDDER).embed(embed_text)

    # ── Sparse lexical vector (CPU tokenizer, ~0.04ms/chunk, no GPU) ──
    tokenizer = coco.use_context(SPARSE_TOKENIZER)
    sparse_indices, sparse_values = _tokenize_to_sparse(
        chunk.text, chunk_type, str(file_path), module, tokenizer,
    )

    # ── Extract enclosing symbol for richer payload ──
    function_name: str | None = None
    if chunk_type == "code":
        function_name = _find_enclosing_symbol(
            source_text, chunk.start.byte_offset, language,
        )
    else:
        function_name = _find_enclosing_heading(
            source_text, chunk.start.byte_offset,
        )

    point = qdrant_models.PointStruct(
        id=await id_gen.next_id(chunk.text),
        vector={
            "dense": embedding.tolist(),
            "sparse": qdrant_models.SparseVector(
                indices=sparse_indices,
                values=sparse_values,
            ),
        },
        payload={
            "project": project,
            "module": module,
            "chunk_type": chunk_type,
            "file_path": str(file_path),
            "language": language,
            "title": title,
            "content": chunk.text,
            "start_line": chunk.start.line,
            "end_line": chunk.end.line,
            **({"function_name": function_name} if function_name else {}),
        },
    )
    target.declare_point(point)


# ── Code path ────────────────────────────────────────────────────────────


@coco.fn(memo=True)
async def process_code_file(
    file: FileLike,
    module: str,
    project: str,
    target: qdrant.CollectionTarget,
) -> None:
    text = await file.read_text()
    fname = str(file.file_path.path.name)
    fpath = file.file_path.path
    language = _guess_language(fname)

    chunks = await asyncio.to_thread(
        _code_splitter.split,
        text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
        language=language,
    )
    id_gen = IdGenerator()
    await coco.map(
        write_chunk,
        chunks, module, project, "code", fpath, language or "text", fname, text, id_gen, target,
    )


# ── Wiki path ────────────────────────────────────────────────────────────

@coco.fn(memo=True)
async def process_wiki_file(
    file: FileLike,
    module: str,
    project: str,
    target: qdrant.CollectionTarget,
) -> None:
    text = await file.read_text()
    fname = str(file.file_path.path.name)
    fpath = file.file_path.path

    ext = pathlib.PurePath(fname).suffix.lower()
    wiki_lang = {"md": "markdown", "rst": "rst"}.get(ext, "text")

    chunks = await asyncio.to_thread(
        _wiki_splitter.split,
        text, chunk_size=1000, min_chunk_size=200, chunk_overlap=200,
        language=None,
    )
    id_gen = IdGenerator()
    await coco.map(
        write_chunk,
        chunks, module, project, "wiki", fpath, wiki_lang, fname, text, id_gen, target,
    )


# ── App main ─────────────────────────────────────────────────────────────


@coco.fn
async def app_main(
    aosp_root: pathlib.Path,
    wiki_root: pathlib.Path,
    project: str,
) -> None:
    collection_name = _collection_name(project)
    _ensure_collection(coco.use_context(QDRANT_DB), collection_name)

    target = await qdrant.mount_collection_target(
        QDRANT_DB,
        collection_name=collection_name,
        schema=await qdrant.CollectionSchema.create(
            vectors={
                "dense": qdrant.QdrantVectorDef(
                    schema=VectorSchema(dtype=np.float32, size=VEC_DIM),
                    distance="cosine",
                ),
                "sparse": qdrant.QdrantSparseVectorDef(modifier="idf"),
            },
        ),
        managed_by=ManagedBy.USER,
    )

    # ── Safety guard against accidental module removal ──
    modules = _active_modules()
    _guard_module_removal(coco.use_context(QDRANT_DB), collection_name, modules)

    aosp_root = aosp_root.resolve()
    wiki_root = wiki_root.resolve()

    for mod in modules:
        # ── Code ──
        code_files = localfs.walk_dir(
            aosp_root,
            recursive=True,
            path_matcher=PatternFilePathMatcher(
                included_patterns=_CODE_GLOBS,
                excluded_patterns=_CODE_EXCLUDES,
            ),
            live=True,
        )
        async for path_key, f in code_files.items():
            rel = str(f.file_path.path)
            if _resolve_module(rel, [mod]) == mod.name:
                await coco.mount(
                    coco.component_subpath("code", mod.name, path_key),
                    process_code_file,
                    f,
                    mod.name,
                    project,
                    target,
                )

        # ── Wiki ──
        mod_wiki_dir = wiki_root / mod.wiki_dir
        if mod_wiki_dir.exists():
            wiki_files = localfs.walk_dir(
                mod_wiki_dir,
                recursive=True,
                path_matcher=PatternFilePathMatcher(
                    included_patterns=_WIKI_GLOBS,
                    excluded_patterns=_WIKI_EXCLUDES,
                ),
                live=True,
            )
            async for path_key, f in wiki_files.items():
                await coco.mount(
                    coco.component_subpath("wiki", mod.name, path_key),
                    process_wiki_file,
                    f,
                    mod.name,
                    project,
                    target,
                )


# ── Project apps ─────────────────────────────────────────────────────────
# 每个项目一个 App：独立的 Qdrant collection（aosp_{project}）+ 独立的
# CocoIndex checkpoint（按 App 名区分）。新芯片/新厂商来了，照抄一份即可。

aw_h618 = coco.App(
    coco.AppConfig(name="aw_h618"),
    app_main,
    aosp_root=pathlib.Path("/CM/work/h618/android12/H618-android-20230427-v1.1"),
    wiki_root=pathlib.Path("./aosp_wiki"),      # ← Wiki 根目录（下面有 bsp/ framework/ app/ 子目录）
    project="aw_h618",
)

# 示例：MTK 的 H618 来了，加一个新 App（数据完全隔离，互不影响）：
# mtk_h618 = coco.App(
#     coco.AppConfig(name="mtk_h618"),
#     app_main,
#     aosp_root=pathlib.Path("/path/to/mtk-h618-source"),
#     wiki_root=pathlib.Path("./aosp_wiki_mtk"),
#     project="mtk_h618",
# )


# ============================================================================
# Query demo  (supports --module BSP  to scope search)
# ============================================================================


def _qdrant_hybrid_search(
    client: QdrantClient,
    collection_name: str,
    query_vector: list[float],
    sparse_indices: list[int],
    sparse_values: list[float],
    limit: int,
    *,
    module: str | None = None,
) -> list[qdrant_models.ScoredPoint]:
    """Hybrid search: dense semantic + sparse lexical via RRF fusion."""
    query_filter = None
    if module:
        query_filter = qdrant_models.Filter(
            must=[qdrant_models.FieldCondition(
                key="module",
                match=qdrant_models.MatchValue(value=module),
            )],
        )
    response = client.query_points(
        collection_name=collection_name,
        prefetch=[
            qdrant_models.Prefetch(
                query=query_vector,
                using="dense",
                limit=limit * 3,
            ),
            qdrant_models.Prefetch(
                query=qdrant_models.SparseVector(
                    indices=sparse_indices,
                    values=sparse_values,
                ),
                using="sparse",
                limit=limit * 3,
            ),
        ],
        query=qdrant_models.FusionQuery(fusion=qdrant_models.Fusion.RRF),
        query_filter=query_filter,
        limit=limit,
    )
    return response.points


async def search_one(
    client: QdrantClient,
    embedder: SentenceTransformerEmbedder,
    tokenizer: _SparseTokenizer,
    query_text: str,
    *,
    project: str,
    module: str | None = None,
    top_k: int = TOP_K,
) -> None:
    query_vec = await embedder.embed(query_text)
    sparse_indices, sparse_values = tokenizer.tokenize(query_text)
    results = _qdrant_hybrid_search(
        client, _collection_name(project),
        query_vec.tolist(), sparse_indices, sparse_values,
        limit=top_k, module=module,
    )

    type_icons = {"code": "📄", "wiki": "📖"}

    for r in results:
        payload = r.payload or {}
        icon = type_icons.get(payload.get("chunk_type", ""), "❓")
        mod_tag = f"[{payload.get('module', '?')}]"
        func = payload.get("function_name")
        header = (
            f"[{r.score:.3f}] {icon} {mod_tag} "
            f"{payload.get('file_path', '?')} "
            f"(L{payload.get('start_line', '?')}-L{payload.get('end_line', '?')})"
        )
        if func:
            header += f"  — {func}()"
        print(header)
        snippet = (payload.get("content", "") or "")[:200].replace("\n", " ").strip()
        print(f"    {snippet}...")
        print("---")


async def query() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Search AOSP code+wiki index")
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--project", "-p", default="aw_h618",
                        help="Project to search (e.g. aw_h618 / mtk_h618)")
    parser.add_argument("--module", "-m", default=None,
                        help="Scope to module (BSP/APP/FRAMEWORK)")
    args = parser.parse_args()

    embedder = FP16Embedder(EMBED_MODEL, device="cuda")
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=True)
    sparse_tok = _SparseTokenizer(EMBED_MODEL)

    if not client.collection_exists(_collection_name(args.project)):
        print(f"[!] 项目 '{args.project}' 的索引不存在（collection "
              f"'{_collection_name(args.project)}' 未找到）。"
              f"请先执行: cocoindex update main:{args.project}")
        return

    if args.query:
        await search_one(client, embedder, sparse_tok, args.query,
                         project=args.project, module=args.module)
        return

    scope = f"[{args.project}]" + (f"[{args.module}]" if args.module else "")
    while True:
        q = input(f"🔍 {scope} Search (Enter to quit): ").strip()
        if not q:
            break
        await search_one(client, embedder, sparse_tok, q,
                         project=args.project, module=args.module)


if __name__ == "__main__":
    load_dotenv()
    import asyncio
    asyncio.run(query())
