"""
Shared pipeline logic for AOSP code+wiki unified learning.

Import this from each platform file (e.g. ``aw_h618.py``, ``mtk_h618.py``).
Platform files define their own ``ModuleConfig`` instances, paths, and App
definitions — this module contains only reusable pipeline functions.
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import fnmatch
import logging
import os
import pathlib
import re
import threading
from dataclasses import dataclass
from typing import AsyncIterator, Literal, Sequence

_logger = logging.getLogger(__name__)

import numpy as np
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


# ── Data models ──────────────────────────────────────────────────────────

CHUNK_TYPES = Literal["code", "wiki"]


@dataclass(frozen=True, slots=True)
class ModuleConfig:
    """Defines a learning module — a conceptual scope that spans many directories.

    Example — BSP 模块::

        ModuleConfig(
            name="BSP",
            code_globs=["**/hardware/**", "**/device/**", "**/longan/**"],
            wiki_dir="bsp",
        )
    """

    name: str
    code_globs: list[str]
    wiki_dir: str
    description: str = ""


# ── Configuration ───────────────────────────────────────────────────────

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6334")
TOP_K = 10
EMBED_MODEL = "BAAI/bge-m3"
VEC_DIM = 1024


def collection_name(project: str) -> str:
    return f"aosp_{project}"


# ── Context keys ────────────────────────────────────────────────────────

QDRANT_DB = coco.ContextKey[QdrantClient]("qdrant")
EMBEDDER = coco.ContextKey[SentenceTransformerEmbedder]("embedder", detect_change=True)
SPARSE_TOKENIZER = coco.ContextKey["_SparseTokenizer"]("sparse_tokenizer")


# ── Splitters ───────────────────────────────────────────────────────────

_code_splitter = RecursiveSplitter()
_wiki_splitter = RecursiveSplitter()


# ── Code file globs ─────────────────────────────────────────────────────

_CODE_GLOBS = [
    "**/*.c", "**/*.h", "**/*.cpp", "**/*.cc", "**/*.hpp",
    "**/*.java",
    "**/*.dts", "**/*.dtsi",
]
_CODE_EXCLUDES = ["**/.*", "**/out", "**/__pycache__", "**/build"]

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


def _module_code_roots(mod: ModuleConfig, aosp_root: pathlib.Path) -> list[pathlib.Path]:
    """Extract base dirs from module code_globs for targeted directory walking."""
    roots: list[pathlib.Path] = []
    seen: set[str] = set()
    for pattern in mod.code_globs:
        parts = pattern.strip("/").split("/")
        for p in parts:
            if p not in ("**", "*", ""):
                if p not in seen:
                    d = aosp_root / p
                    if d.is_dir():
                        roots.append(d)
                        seen.add(p)
                break
    return roots


# ── Guard: prevent accidental module removal ────────────────────────────


def guard_module_removal(
    client: QdrantClient,
    collection_name: str,
    active: Sequence[ModuleConfig],
    all_modules: Sequence[ModuleConfig],
) -> None:
    """Refuse to run if an already-indexed module is missing from this run.

    CocoIndex is declarative: modules absent from the current run are
    treated as removed.  Aborting prevents accidental data loss.
    Set ``COCOINDEX_ALLOW_MODULE_REMOVAL=1`` to confirm intentional removal.
    """
    if os.environ.get("COCOINDEX_ALLOW_MODULE_REMOVAL") == "1":
        return
    if not client.collection_exists(collection_name):
        return
    active_names = {m.name for m in active}
    missing: list[tuple[str, int]] = []
    for mod in all_modules:
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
            f"已索引模块未在本次运行中声明: {detail}。"
            f"继续运行会删除这些模块的全部向量！"
            f"请确保模块已声明（需要保留 {keep_all}），"
            f"或不限制模块索引全部；确认要删除请设 "
            f"COCOINDEX_ALLOW_MODULE_REMOVAL=1。"
        )


# ── FP16 embedder ───────────────────────────────────────────────────────


class FP16Embedder(SentenceTransformerEmbedder):
    """SentenceTransformerEmbedder with fp16 model weights (~1.1 GB VRAM)."""

    def _get_model(self):
        if self._model is None:
            model = super()._get_model()
            model.half()
        return self._model


# ── Sparse tokenizer (CPU-only) ─────────────────────────────────────────


class _SparseTokenizer:
    """Wraps a SentencePiece tokenizer for sparse vector generation (CPU)."""

    def __init__(self, model_name: str = EMBED_MODEL) -> None:
        from transformers import AutoTokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(model_name)

    def tokenize(self, text: str, max_tokens: int = 8192) -> tuple[list[int], list[float]]:
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
    full_text = f"{chunk_type} {module} {file_path} {text}"
    return tokenizer.tokenize(full_text)


# ── Lifespan ────────────────────────────────────────────────────────────

@coco.lifespan
async def coco_lifespan(builder: coco.EnvironmentBuilder) -> AsyncIterator[None]:
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=True)
    builder.provide(QDRANT_DB, client)
    embedder = FP16Embedder(EMBED_MODEL, device="cuda")
    builder.provide(EMBEDDER, embedder)
    with _sparse_tokenizer_lock:
        sparse_tok = _SparseTokenizer(EMBED_MODEL)
    builder.provide(SPARSE_TOKENIZER, sparse_tok)
    yield


def _ensure_collection(client: QdrantClient, name: str) -> None:
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
                index=qdrant_models.SparseIndexParams(on_disk=True),
                modifier="idf",
            ),
        },
    )
    print(f"[qdrant] Created collection '{name}' (dense fp16 + sparse idf)")


# ── Enclosing symbol extraction ─────────────────────────────────────────

_FUNC_LINE = re.compile(
    r'^\s*(?:static\s+|inline\s+|const\s+|extern\s+|virtual\s+|'
    r'final\s+|abstract\s+|synchronized\s+|public\s+|private\s+|'
    r'protected\s+|__\w+\s+)*'
    r'[\w\s*&<>,:\[\]]+\s+'
    r'(\w+)\s*\(',
    re.MULTILINE,
)
_CTOR_LINE = re.compile(r'^\s*(\w+)\s*\([^)]*\)\s*:\s*\w+\(', re.MULTILINE)
_STRUCT_LINE = re.compile(r'^\s*(?:typedef\s+)?struct\s+(\w+)', re.MULTILINE)
_CLASS_LINE = re.compile(r'^\s*(?:public\s+|private\s+|protected\s+)?class\s+(\w+)', re.MULTILINE)
_DTS_NODE_LINE = re.compile(r'^\s*(\w[\w-]*)\s*\{', re.MULTILINE)
_MACRO_LINE = re.compile(r'^\s*#define\s+(\w+)', re.MULTILINE)


def _find_enclosing_symbol(source_text: str, offset: int, language: str) -> str | None:
    if not source_text or offset <= 0:
        return None
    before = source_text[:offset]
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


def _find_enclosing_heading(source_text: str, offset: int) -> str | None:
    if not source_text or offset <= 0:
        return None
    before = source_text[:offset]
    for line in reversed(before.split('\n')):
        m = re.match(r'^#{1,6}\s+(.*)', line)
        if m:
            return m.group(1).strip()
    return None


def _build_embed_text(chunk_text: str, chunk_type: str, fpath: str, module: str) -> str:
    if chunk_type == 'code':
        prefix = f'// File: {fpath}\n// Module: {module}\n'
    else:
        prefix = f'# Wiki: {fpath}\n# Module: {module}\n'
    return prefix + chunk_text


# ── Shared chunk writer ─────────────────────────────────────────────────

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
    embed_text = _build_embed_text(chunk.text, chunk_type, str(file_path), module)
    embedding = await coco.use_context(EMBEDDER).embed(embed_text)

    tokenizer = coco.use_context(SPARSE_TOKENIZER)
    sparse_indices, sparse_values = _tokenize_to_sparse(
        chunk.text, chunk_type, str(file_path), module, tokenizer,
    )

    function_name: str | None = None
    if chunk_type == "code":
        function_name = _find_enclosing_symbol(source_text, chunk.start.byte_offset, language)
    else:
        function_name = _find_enclosing_heading(source_text, chunk.start.byte_offset)

    point = qdrant_models.PointStruct(
        id=await id_gen.next_id(chunk.text),
        vector={
            "dense": embedding.tolist(),
            "sparse": qdrant_models.SparseVector(
                indices=sparse_indices, values=sparse_values,
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


# ── Code file processing ────────────────────────────────────────────────

@coco.fn(memo=True)
async def process_code_file(
    file: FileLike,
    module: str,
    project: str,
    target: qdrant.CollectionTarget,
    file_rel_path: pathlib.PurePath,
) -> None:
    text = await file.read_text()
    fname = str(file_rel_path.name)
    fpath = file_rel_path
    language = _guess_language(fname)

    try:
        chunks = await asyncio.wait_for(
            asyncio.to_thread(
                _code_splitter.split,
                text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
                language=language,
            ),
            timeout=60,
        )
    except asyncio.TimeoutError:
        _logger.warning(
            "tree-sitter split timed out (%d B, lang=%s), falling back to plain-text: %s",
            len(text), language, fpath,
        )
        chunks = await asyncio.to_thread(
            _code_splitter.split,
            text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
            language=None,
        )
    id_gen = IdGenerator()
    await coco.map(
        write_chunk,
        chunks, module, project, "code", fpath, language or "text", fname, text, id_gen, target,
    )


# ── Wiki file processing ────────────────────────────────────────────────

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


# ── App main（单模块版）─────────────────────────────────────────────────

@coco.fn
async def app_main(
    aosp_root: pathlib.Path,
    wiki_root: pathlib.Path,
    project: str,
    module: ModuleConfig,
) -> None:
    loop = asyncio.get_running_loop()
    loop.set_default_executor(concurrent.futures.ThreadPoolExecutor(max_workers=64))

    cn = collection_name(project)
    _ensure_collection(coco.use_context(QDRANT_DB), cn)

    target = await qdrant.mount_collection_target(
        QDRANT_DB,
        collection_name=cn,
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

    aosp_root = aosp_root.resolve()
    wiki_root = wiki_root.resolve()

    # ── Code ──
    code_roots = _module_code_roots(module, aosp_root)
    if not code_roots:
        print(f"[{module.name}] ⚠ No matching directories found, skipping code")
        return
    for code_root in code_roots:
        code_files = localfs.walk_dir(
            code_root,
            recursive=True,
            path_matcher=PatternFilePathMatcher(
                included_patterns=_CODE_GLOBS,
                excluded_patterns=_CODE_EXCLUDES,
            ),
        )
        async for path_key, f in code_files.items():
            file_full_path = pathlib.PurePath(code_root.name) / path_key
            await coco.mount(
                coco.component_subpath("code", module.name, str(file_full_path)),
                process_code_file,
                f,
                module.name,
                project,
                target,
                file_full_path,
            )

    # ── Wiki ──
    mod_wiki_dir = wiki_root / module.wiki_dir
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
                coco.component_subpath("wiki", module.name, path_key),
                process_wiki_file,
                f,
                module.name,
                project,
                target,
            )


# ── Query / search ──────────────────────────────────────────────────────


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
            qdrant_models.Prefetch(query=query_vector, using="dense", limit=limit * 3),
            qdrant_models.Prefetch(
                query=qdrant_models.SparseVector(indices=sparse_indices, values=sparse_values),
                using="sparse", limit=limit * 3,
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
        client, collection_name(project),
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


async def query(project: str) -> None:
    """Interactive hybrid search for a project."""
    import argparse
    parser = argparse.ArgumentParser(description="Search AOSP code+wiki index")
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--module", "-m", default=None,
                        help="Scope to module (BSP/APP/FRAMEWORK)")
    args = parser.parse_args()

    embedder = FP16Embedder(EMBED_MODEL, device="cuda")
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=True)
    sparse_tok = _SparseTokenizer(EMBED_MODEL)

    if not client.collection_exists(collection_name(project)):
        print(f"[!] 项目 '{project}' 的索引不存在 "
              f"(collection '{collection_name(project)}' 未找到）。"
              f"请先执行: cocoindex update {project}:{project}_bsp")
        return

    if args.query:
        await search_one(client, embedder, sparse_tok, args.query,
                         project=project, module=args.module)
        return

    scope = f"[{project}]" + (f"[{args.module}]" if args.module else "")
    while True:
        q = input(f"🔍 {scope} Search (Enter to quit): ").strip()
        if not q:
            break
        await search_one(client, embedder, sparse_tok, q,
                         project=project, module=args.module)
