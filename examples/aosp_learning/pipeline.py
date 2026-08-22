"""
Shared pipeline logic for AOSP code+wiki unified learning.

Import this from each platform file (e.g. ``aw_h618.py``, ``mtk_h618.py``).
Platform files define their own ``ModuleConfig`` instances, paths, and App
definitions — this module contains only reusable pipeline functions.
"""

from __future__ import annotations

import asyncio
import bisect
import concurrent.futures
import fnmatch
import logging
import os
import pathlib
import re
import threading
from dataclasses import dataclass
from typing import Any, AsyncIterator, Literal, Sequence

_logger = logging.getLogger(__name__)

# Limit concurrent file processing to keep the GPU embedding queue
# well-fed without overwhelming it. 1024 concurrency caused 366 threads
# sleeping on GPU contention → 6.9 files/sec. 16 concurrency → 9.4 files/sec.
# With the spawn_blocking fix in place, LMDB is no longer the bottleneck.
_MAX_CONCURRENT_FILES = 64
_file_semaphore = asyncio.Semaphore(_MAX_CONCURRENT_FILES)

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from qdrant_client.http.models import Datatype

import cocoindex as coco
from cocoindex.connectorkits.target import ManagedBy
from cocoindex.connectors import localfs, qdrant
from cocoindex.ops.sentence_transformers import SentenceTransformerEmbedder
from cocoindex.ops.text import RecursiveSplitter
from cocoindex.resources.chunk import Chunk, TextPosition
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

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
TOP_K = 10
EMBED_MODEL = "BAAI/bge-m3"
VEC_DIM = 1024
_DEFAULT_CONFIG = pathlib.Path(__file__).resolve().parent / "platforms.yaml"

# Use HF mirror if not set (needed for model download in China)
os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")


def collection_name(project: str) -> str:
    """Qdrant collection 名 = project 名(带平台类型前缀)。

    - qcm4490 (AOSP/Android)        → ``aosp_qcm4490``
    - seahorse_wear_base (RTOS)      → ``rtos_seahorse_wear_base``
    前缀约定: aosp_=Android, rtos_=RTOS/嵌入式固件; 新平台在映射表追加。
    """
    return {
        "qcm4490": "aosp_qcm4490",
        "seahorse_wear_base": "rtos_seahorse_wear_base",
    }.get(project, project)


def load_platforms(config_path: pathlib.Path | None = None) -> dict[str, Any]:
    """Load platform configurations from YAML.

    Returns a dict mapping project name → platform config with keys:
    ``aosp_root``, ``wiki_root``, ``modules`` (list of ModuleConfig dicts).
    """
    import yaml

    path = config_path or _DEFAULT_CONFIG
    with open(path) as f:
        data = yaml.safe_load(f)
    return data["platforms"]


def make_app(
    project: str,
    aosp_root: pathlib.Path,
    wiki_root: pathlib.Path,
    module: ModuleConfig,
) -> coco.App:
    """Create a CocoIndex App for a single module.

    Each module gets an independent LMDB via ``AppConfig(name=...)``.
    """
    return coco.App(
        coco.AppConfig(
            name=f"{project}_{module.name.lower()}",
        ),
        app_main,
        aosp_root=aosp_root,
        wiki_root=wiki_root,
        project=project,
        module=module,
    )


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
_CODE_EXCLUDES = ["**/.*", "**/out", "**/__pycache__", "**/build",
                  "**/prebuilts", "**/prebuilts/**",
                  "**/prebuilts-master", "**/prebuilts-master/**"]

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
    """Extract base dirs from module code_globs for targeted directory walking.

    Supports multi-level paths: ``target/kernel_platform/**`` → ``aosp_root/target/kernel_platform``.
    Only the first glob segment with ``**`` or ``*`` stops path extraction;
    everything before it is treated as a literal directory chain.
    """
    roots: list[pathlib.Path] = []
    seen: set[str] = set()
    for pattern in mod.code_globs:
        parts = pattern.strip("/").split("/")
        dir_parts: list[str] = []
        for p in parts:
            if p in ("**", "*"):
                break
            if p:
                dir_parts.append(p)
        if not dir_parts:
            continue
        key = "/".join(dir_parts)
        if key in seen:
            continue
        d = aosp_root.joinpath(*dir_parts)
        if d.is_dir():
            roots.append(d)
            seen.add(key)
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
    # timeout=30: Qdrant optimizer 合并 segment 时会暂时拖慢 upsert,
    # 默认 httpx 5s 超时太紧,会误报组件失败(进而触发 LMDB 清理死锁路径)。
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=False, timeout=30)
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


def _symbol_patterns(language: str) -> list[re.Pattern]:
    """Return the ordered symbol patterns for a language (priority = list order)."""
    patterns = [_FUNC_LINE, _CTOR_LINE, _STRUCT_LINE, _MACRO_LINE]
    if language in ('c', 'cpp'):
        patterns = [_FUNC_LINE, _STRUCT_LINE, _MACRO_LINE]
    elif language == 'java':
        patterns = [_FUNC_LINE, _CLASS_LINE]
    elif language == 'dts':
        patterns = [_DTS_NODE_LINE, _MACRO_LINE]
    return patterns


def _build_symbol_index(source_text: str, language: str) -> list[tuple[int, str]]:
    """Scan the file ONCE and return [(line_start_byte, symbol_name)] sorted by offset.

    Semantics are identical to the old per-chunk scan in ``_find_enclosing_symbol``:
    for every line, try the language's patterns in priority order and record the
    first match's symbol name with the line's start byte offset. Per-chunk queries
    then binary-search this index instead of re-scanning the whole prefix, turning
    the O(N^2) cost (a 26MB file took ~164 min) into O(N + C log M) (~ms).
    """
    patterns = _symbol_patterns(language)
    index: list[tuple[int, str]] = []
    line_start = 0
    for line in source_text.split('\n'):
        for pat in patterns:
            m = pat.search(line)
            if m:
                index.append((line_start, m.group(1)))
                break
        line_start += len(line) + 1
    return index


def _find_enclosing_symbol(symbol_index: list[tuple[int, str]], offset: int) -> str | None:
    """Return the symbol name of the nearest declaration line at or before *offset*."""
    if not symbol_index or offset <= 0:
        return None
    # bisect_left: only lines whose start byte is strictly before offset are
    # visible to the old logic (source_text[:offset] excludes the byte at offset).
    i = bisect.bisect_left(symbol_index, (offset,)) - 1
    return symbol_index[i][1] if i >= 0 else None


def _build_heading_index(source_text: str) -> list[tuple[int, str]]:
    """One-pass scan for markdown headings -> [(line_start, heading_text)]."""
    index: list[tuple[int, str]] = []
    line_start = 0
    for line in source_text.split('\n'):
        m = re.match(r'^#{1,6}\s+(.*)', line)
        if m:
            index.append((line_start, m.group(1).strip()))
        line_start += len(line) + 1
    return index


def _find_enclosing_heading(heading_index: list[tuple[int, str]], offset: int) -> str | None:
    """Return the nearest heading at or before *offset*."""
    if not heading_index or offset <= 0:
        return None
    i = bisect.bisect_left(heading_index, (offset,)) - 1
    return heading_index[i][1] if i >= 0 else None


def _build_embed_text(chunk_text: str, chunk_type: str, fpath: str, module: str) -> str:
    if chunk_type == 'code':
        prefix = f'// File: {fpath}\n// Module: {module}\n'
    else:
        prefix = f'# Wiki: {fpath}\n# Module: {module}\n'
    return prefix + chunk_text


# ── Shared chunk writer ─────────────────────────────────────────────────
# GitHub 原版语义: coco.map 并发执行 chunk,官方文档明确"不创建组件",
# 不会产生 per-chunk LMDB 提交,不会触发持锁死锁。

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
    symbol_index: list[tuple[int, str]],
    heading_index: list[tuple[int, str]],
) -> None:
    embed_text = _build_embed_text(chunk.text, chunk_type, str(file_path), module)
    embedding = await coco.use_context(EMBEDDER).embed(embed_text)

    tokenizer = coco.use_context(SPARSE_TOKENIZER)
    sparse_indices, sparse_values = _tokenize_to_sparse(
        chunk.text, chunk_type, str(file_path), module, tokenizer,
    )

    function_name: str | None = None
    if chunk_type == "code":
        function_name = _find_enclosing_symbol(symbol_index, chunk.start.byte_offset)
    else:
        function_name = _find_enclosing_heading(heading_index, chunk.start.byte_offset)

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
    async with _file_semaphore:
        await _process_code_file_impl(
            file, module, project, target, file_rel_path,
        )


# ── DTS 节点级切分 (tree-sitter-devicetree, 方案A) ─────────────────────
# cocoindex 的 RecursiveSplitter 无 dts grammar → 默认正则切分(无节点边界、
# function_name 全 None)。这里用 tree-sitter-devicetree 解析成真 AST,
# 按节点聚合切块(自适应粒度: 节点≤chunk/2 整块, 大节点深入子节点)。
# symbol_index 用 start-1 兼容 _find_enclosing_symbol 的 bisect_left-1 语义,
# 使每个 chunk 的 function_name = 块内首个节点 (如 'pm6150_pon: pon@800')。

_DTS_PARSER: Any = None
_DTS_PARSER_LOCK = threading.Lock()


def _dts_parser() -> Any:
    global _DTS_PARSER
    with _DTS_PARSER_LOCK:
        if _DTS_PARSER is None:
            from tree_sitter import Language, Parser
            import tree_sitter_devicetree
            _DTS_PARSER = Parser(Language(tree_sitter_devicetree.language()))
        return _DTS_PARSER


def _dts_node_display(text: str, n: Any) -> str:
    """节点显示名: 'label: name@addr' / 'name@addr' / '&ref' / '/'"""
    head = text[n.start_byte:n.end_byte].split("{", 1)[0].strip()
    return head[:80]


def _dts_collect_nodes(root: Any, chunk_size: int) -> list[Any]:
    """自适应粒度: 节点 ≤ chunk_size//2 整块; 更大则深入子节点。返回不重叠链。"""
    out: list[Any] = []
    threshold = chunk_size // 2

    def walk(n: Any) -> None:
        if n.type == "node":
            if n.end_byte - n.start_byte <= threshold:
                out.append(n)
            else:
                for c in n.named_children:
                    walk(c)
        else:
            for c in n.named_children:
                walk(c)
    walk(root)
    out.sort(key=lambda n: (n.start_byte, n.end_byte))
    return out


def _dts_make_chunk(text: str, s: int, e: int) -> Chunk:
    return Chunk(
        text=text[s:e],
        start=TextPosition(byte_offset=s, char_offset=len(text[:s]),
                           line=text.count("\n", 0, s) + 1,
                           column=s - (text.rfind("\n", 0, s) + 1) + 1),
        end=TextPosition(byte_offset=e, char_offset=len(text[:e]),
                         line=text.count("\n", 0, e) + 1,
                         column=e - (text.rfind("\n", 0, e) + 1) + 1),
    )


def _split_dts(text: str, chunk_size: int = 1000) -> tuple[list[Chunk], list[tuple[int, str]]]:
    """tree-sitter-devicetree 节点级切分 → (chunks, symbol_index)。
    块 = 连续节点区间 [node_i.start, node_{i+1}.start), 节点间空隙并入块内, 100% 覆盖。
    """
    parser = _dts_parser()
    tree = parser.parse(text.encode("utf-8"))
    root = tree.root_node
    nodes = _dts_collect_nodes(root, chunk_size)
    symbol_index = [(n.start_byte - 1, _dts_node_display(text, n)) for n in nodes]

    chunks: list[Chunk] = []
    if nodes and nodes[0].start_byte > 0:
        chunks.append(_dts_make_chunk(text, 0, nodes[0].start_byte))  # 文件头(注释/#include)
    block_start: int | None = None
    for i, n in enumerate(nodes):
        nxt = nodes[i + 1].start_byte if i + 1 < len(nodes) else len(text)
        if block_start is None:
            block_start = n.start_byte
        elif nxt - block_start > chunk_size + 200:
            chunks.append(_dts_make_chunk(text, block_start, n.start_byte))
            block_start = n.start_byte
    if block_start is not None:
        chunks.append(_dts_make_chunk(text, block_start, len(text)))
    return chunks, symbol_index


async def _process_code_file_impl(
    file: FileLike,
    module: str,
    project: str,
    target: qdrant.CollectionTarget,
    file_rel_path: pathlib.PurePath,
) -> None:
    fname = str(file_rel_path.name)
    fpath = file_rel_path
    text = await file.read_text()
    language = _guess_language(fname)

    if language == "dts":
        # 方案A: tree-sitter-devicetree 节点级切分; 解析失败回退默认正则切分
        try:
            chunks, symbol_index = _split_dts(text)
        except Exception as e:
            _logger.warning(
                "dts node split failed (%d B, %s): %s, falling back to default split",
                len(text), fpath, e,
            )
            chunks = await asyncio.wait_for(
                asyncio.to_thread(
                    _code_splitter.split,
                    text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
                    language="dts",
                ),
                timeout=300,
            )
            symbol_index = _build_symbol_index(text, "dts")
    else:
        try:
            chunks = await asyncio.wait_for(
                asyncio.to_thread(
                    _code_splitter.split,
                    text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
                    language=language,
                ),
                timeout=300,
            )
        except asyncio.TimeoutError:
            _logger.warning(
                "tree-sitter split timed out (%d B, lang=%s), falling back to plain-text: %s",
                len(text), language, fpath,
            )
            chunks = _code_splitter.split(
                text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
                language=None,
            )
        symbol_index = _build_symbol_index(text, language or "text")
    id_gen = IdGenerator()
    await coco.map(
        write_chunk,
        chunks, module, project, "code", fpath, language or "text", fname, text,
        id_gen, target, symbol_index, [],
    )


# ── Wiki file processing ────────────────────────────────────────────────

@coco.fn(memo=True)
async def process_wiki_file(
    file: FileLike,
    module: str,
    project: str,
    target: qdrant.CollectionTarget,
) -> None:
    async with _file_semaphore:
        await _process_wiki_file_impl(file, module, project, target)


async def _process_wiki_file_impl(
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
    heading_index = _build_heading_index(text)
    await coco.map(
        write_chunk,
        chunks, module, project, "wiki", fpath, wiki_lang, fname, text,
        id_gen, target, [], heading_index,
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
    loop.set_default_executor(concurrent.futures.ThreadPoolExecutor(max_workers=256))

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
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=False, timeout=30)
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
