"""
AOSP Code + Wiki Unified Learning Pipeline — Qdrant + int8 quantization.

AOSP code is learned by **large conceptual modules** (BSP, APP, FRAMEWORK),
not by directory — because BSP code is scattered across kernel/, hardware/,
device/, vendor/. This pipeline tags every chunk with its module label and
supports module-scoped search.

Two processing paths feed a single Qdrant collection with int8 quantization:

  Code path:  *.c *.h *.java *.dts *.dtsi *.cpp
    → RecursiveSplitter (language-aware chunking)
    → BGE-M3 embedding (1024-dim, Chinese+English)
    → (optional) LLM entity extraction
    → Qdrant  int8 quantized  (tagged with module)

  Wiki path:  *.md *.rst *.txt
    → RecursiveSplitter (text chunking)
    → BGE-M3 embedding (1024-dim, Chinese+English)
    → (optional) LLM concept extraction
    → Qdrant  int8 quantized  (tagged with module)

Prerequisites
-------------
    docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant

Usage
-----
Index all modules:
    cocoindex update main

Index only one module:
    COCOINDEX_MODULES=BSP cocoindex update main

Search (optionally scoped to a module):
    python main.py "MIPI DSI lane config"
    python main.py --module BSP "gpio pinctrl"
    python main.py --module APP "activity lifecycle"

Environment variables:
    LLM_MODEL          LiteLLM model id for optional entity extraction
    COCOINDEX_MODULES  Comma-separated module names to index (default: all)
    QDRANT_URL         Qdrant server URL (default: http://localhost:6334)
"""

from __future__ import annotations

import fnmatch
import os
import pathlib
import sys
from typing import AsyncIterator, Sequence

import instructor
import litellm
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models

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
    CodeExtraction,
    WikiExtraction,
)

import numpy as np

litellm.drop_params = True


# ── Configuration ───────────────────────────────────────────────────────

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6334")
COLLECTION_NAME = "aosp_index"
TOP_K = 10

EMBED_MODEL = "BAAI/bge-m3"
# Native Chinese + English + code support. 1024-dim with int8 quantization
# keeps storage at ~1.9 GB for 2M chunks — smaller than MiniLM float32.
VEC_DIM = 1024


# ── Context keys ────────────────────────────────────────────────────────

QDRANT_DB = coco.ContextKey[QdrantClient]("qdrant")
EMBEDDER = coco.ContextKey[SentenceTransformerEmbedder]("embedder", detect_change=True)
LLM_MODEL_KEY = coco.ContextKey[str | None]("llm_model", detect_change=True)


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


# ── Lifespan ─────────────────────────────────────────────────────────────

@coco.lifespan
async def coco_lifespan(builder: coco.EnvironmentBuilder) -> AsyncIterator[None]:
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=True)
    builder.provide(QDRANT_DB, client)
    builder.provide(EMBEDDER, SentenceTransformerEmbedder(EMBED_MODEL, device="cuda"))
    builder.provide(LLM_MODEL_KEY, os.environ.get("LLM_MODEL", None))

    # Ensure collection exists with int8 quantization before pipeline starts.
    # ManagedBy.USER tells CocoIndex to skip collection create/drop — we own it.
    _ensure_collection(client, COLLECTION_NAME)

    yield


def _ensure_collection(client: QdrantClient, name: str) -> None:
    """Create the Qdrant collection with int8 quantization if it doesn't exist."""
    if client.collection_exists(name):
        return
    client.create_collection(
        collection_name=name,
        vectors_config=qdrant_models.VectorParams(
            size=VEC_DIM,
            distance=qdrant_models.Distance.COSINE,
        ),
        quantization_config=qdrant_models.ScalarQuantization(
            scalar=qdrant_models.ScalarQuantizationConfig(
                type=qdrant_models.ScalarType.INT8,
                always_ram=True,
            ),
        ),
    )
    print(f"[qdrant] Created collection '{name}' (int8 quantized, {VEC_DIM}-dim)")


# ── Shared chunk writer ─────────────────────────────────────────────────


@coco.fn
async def write_chunk(
    chunk: Chunk,
    module: str,
    chunk_type: CHUNK_TYPES,
    file_path: pathlib.PurePath,
    language: str,
    title: str,
    id_gen: IdGenerator,
    target: qdrant.CollectionTarget,
) -> None:
    embedding = await coco.use_context(EMBEDDER).embed(chunk.text)
    point = qdrant.PointStruct(
        id=await id_gen.next_id(chunk.text),
        vector=embedding.tolist(),
        payload={
            "module": module,
            "chunk_type": chunk_type,
            "file_path": str(file_path),
            "language": language,
            "title": title,
            "content": chunk.text,
            "start_line": chunk.start.line,
            "end_line": chunk.end.line,
        },
    )
    target.declare_point(point)


# ── Code path ────────────────────────────────────────────────────────────

CODE_EXTRACTION_PROMPT = """\
You are analyzing code from an AOSP (Android Open Source Project) codebase.
Extract the key entities: functions, structs, classes, DTS nodes, macros,
and configuration keys.

For each entity, provide:
- name: the identifier
- kind: function / struct / class / dts_node / macro / config_key
- summary: one line explaining what this does in plain language
- related_concepts: 1-3 wiki-style concept keywords (e.g. "MIPI DSI",
  "GPIO pinctrl", "panel init sequence", "charger IC", "pmic regulator")

Focus on entities relevant to hardware configuration (display, power, GPIO,
charging, audio, sensors) and their driver/ HAL glue code.
"""


async def _llm_extract_code(content: str, filename: str) -> CodeExtraction:
    client = instructor.from_litellm(litellm.acompletion, mode=instructor.Mode.JSON)
    result = await client.chat.completions.create(
        model=coco.use_context(LLM_MODEL_KEY),
        response_model=CodeExtraction,
        messages=[
            {"role": "system", "content": CODE_EXTRACTION_PROMPT},
            {"role": "user", "content": f"Filename: {filename}\n\n```\n{content[:12000]}\n```"},
        ],
    )
    return CodeExtraction.model_validate(result.model_dump())


@coco.fn(memo=True)
async def process_code_file(
    file: FileLike,
    module: str,
    target: qdrant.CollectionTarget,
) -> None:
    text = await file.read_text()
    fname = str(file.file_path.path.name)
    fpath = file.file_path.path
    language = _guess_language(fname)

    chunks = _code_splitter.split(
        text, chunk_size=1000, min_chunk_size=300, chunk_overlap=200,
        language=language,
    )
    id_gen = IdGenerator()
    await coco.map(
        write_chunk,
        chunks, module, "code", fpath, language or "text", fname, id_gen, target,
    )

    if coco.use_context(LLM_MODEL_KEY):
        await _llm_extract_code(text, str(fpath))


# ── Wiki path ────────────────────────────────────────────────────────────

WIKI_EXTRACTION_PROMPT = """\
You are analyzing technical documentation (wiki) for an AOSP
(Android Open Source Project) platform. Extract key concepts and their
relationships to the codebase.

For each concept:
- name: the concept (e.g. "MIPI DSI", "BQ27541 Fuel Gauge", "MSM GPIO TLMM")
- description: concise explanation (1-2 sentences)
- code_references: list of expected file paths or function names in the
  AOSP tree that implement/configure this concept (e.g.
  "drivers/gpu/drm/msm/dsi", "msm_dsi_host_init", "pm8953.dtsi")

Focus on hardware enablement concepts: display (MIPI DSI / HDMI), power
management (PMIC, regulator, charger), GPIO/pinctrl, audio codec, sensors,
USB, and their kernel driver / device tree / HAL layers.
"""


async def _llm_extract_wiki(content: str, filename: str) -> WikiExtraction:
    client = instructor.from_litellm(litellm.acompletion, mode=instructor.Mode.JSON)
    result = await client.chat.completions.create(
        model=coco.use_context(LLM_MODEL_KEY),
        response_model=WikiExtraction,
        messages=[
            {"role": "system", "content": WIKI_EXTRACTION_PROMPT},
            {"role": "user", "content": f"Wiki page: {filename}\n\n{content[:12000]}"},
        ],
    )
    return WikiExtraction.model_validate(result.model_dump())


@coco.fn(memo=True)
async def process_wiki_file(
    file: FileLike,
    module: str,
    target: qdrant.CollectionTarget,
) -> None:
    text = await file.read_text()
    fname = str(file.file_path.path.name)
    fpath = file.file_path.path

    ext = pathlib.PurePath(fname).suffix.lower()
    wiki_lang = {"md": "markdown", "rst": "rst"}.get(ext, "text")

    chunks = _wiki_splitter.split(
        text, chunk_size=1000, min_chunk_size=200, chunk_overlap=200,
        language=None,
    )
    id_gen = IdGenerator()
    await coco.map(
        write_chunk,
        chunks, module, "wiki", fpath, wiki_lang, fname, id_gen, target,
    )

    if coco.use_context(LLM_MODEL_KEY):
        await _llm_extract_wiki(text, str(fpath))


# ── App main ─────────────────────────────────────────────────────────────


@coco.fn
async def app_main(
    aosp_root: pathlib.Path,
    wiki_root: pathlib.Path,
) -> None:
    # ManagedBy.USER: collection already created in lifespan with quantization.
    target = await qdrant.mount_collection_target(
        QDRANT_DB,
        collection_name=COLLECTION_NAME,
        schema=await qdrant.CollectionSchema.create(
            vectors=qdrant.QdrantVectorDef(
                schema=VectorSchema(dtype=np.float32, size=VEC_DIM),
                distance="cosine",
            ),
        ),
        managed_by=ManagedBy.USER,
    )

    modules = _active_modules()
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
                    target,
                )


app = coco.App(
    coco.AppConfig(name="AospCodeWikiLearning"),
    app_main,
    aosp_root=pathlib.Path("/CM/work/h618/android12/H618-android-20230427-v1.1"),
    wiki_root=pathlib.Path("./aosp_wiki"),    # ← Wiki 根目录（下面有 bsp/ framework/ app/ 子目录）
)


# ============================================================================
# Query demo  (supports --module BSP  to scope search)
# ============================================================================


def _qdrant_search(
    client: QdrantClient,
    collection_name: str,
    query_vector: list[float],
    limit: int,
    *,
    module: str | None = None,
) -> list[qdrant_models.ScoredPoint]:
    """Search with optional module filter."""
    query_filter = None
    if module:
        query_filter = qdrant_models.Filter(
            must=[qdrant_models.FieldCondition(
                key="module",
                match=qdrant_models.MatchValue(value=module),
            )],
        )

    if hasattr(client, "search"):
        return client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit,
        )
    if hasattr(client, "query_points"):
        response = client.query_points(
            collection_name=collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=limit,
        )
        return response.points
    raise RuntimeError("Unsupported qdrant-client version.")


async def search_one(
    client: QdrantClient,
    embedder: SentenceTransformerEmbedder,
    query_text: str,
    *,
    module: str | None = None,
    top_k: int = TOP_K,
) -> None:
    query_vec = await embedder.embed(query_text)
    results = _qdrant_search(
        client, COLLECTION_NAME, query_vec.tolist(),
        limit=top_k, module=module,
    )

    type_icons = {"code": "📄", "wiki": "📖"}

    for r in results:
        payload = r.payload or {}
        icon = type_icons.get(payload.get("chunk_type", ""), "❓")
        mod_tag = f"[{payload.get('module', '?')}]"
        print(
            f"[{r.score:.3f}] {icon} {mod_tag} "
            f"{payload.get('file_path', '?')} "
            f"(L{payload.get('start_line', '?')}-L{payload.get('end_line', '?')})"
        )
        snippet = (payload.get("content", "") or "")[:200].replace("\n", " ").strip()
        print(f"    {snippet}...")
        print("---")


async def query() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Search AOSP code+wiki index")
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--module", "-m", default=None,
                        help="Scope to module (BSP/APP/FRAMEWORK)")
    args = parser.parse_args()

    embedder = SentenceTransformerEmbedder(EMBED_MODEL, device="cuda")
    client = qdrant.create_client(QDRANT_URL, prefer_grpc=True)

    if args.query:
        await search_one(client, embedder, args.query, module=args.module)
        return

    scope = f"[{args.module}] " if args.module else ""
    while True:
        q = input(f"🔍 {scope}Search (Enter to quit): ").strip()
        if not q:
            break
        await search_one(client, embedder, q, module=args.module)


if __name__ == "__main__":
    load_dotenv()
    import asyncio
    asyncio.run(query())
