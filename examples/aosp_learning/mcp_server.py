#!/usr/bin/env python3
"""
MCP Server for AOSP Code+Wiki Semantic Search.

Exposes a ``search_aosp`` tool so AI agents (Claude Code, Codex, etc.) can
query the Qdrant index directly — no CLI needed.

Usage (register in your MCP config)::

    {
        "aosp-search": {
            "command": "/CM/cocoindex-env/bin/python",
            "args": ["/CM/work/cocoindex/examples/aosp_learning/mcp_server.py"]
        }
    }

Or run standalone for testing::

    python mcp_server.py
"""

from __future__ import annotations

import os

# ── Offline mode (must be set before importing torch/transformers) ───────
# BGE-M3 is cached locally; skip HuggingFace Hub network checks that cause
# multi-second timeouts (or hangs behind a proxy).
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

# ── Configuration ───────────────────────────────────────────────────────

load_dotenv()

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6334")
EMBED_MODEL = "BAAI/bge-m3"
VEC_DIM = 1024
TOP_K_DEFAULT = 10

# ── Lazy singletons (loaded once on first query) ────────────────────────

_embedder: SentenceTransformer | None = None
_client: QdrantClient | None = None
_tokenizer: AutoTokenizer | None = None


def _get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        model = SentenceTransformer(EMBED_MODEL, device="cuda")
        model.half()  # fp16 → ~1.1 GB VRAM
        _embedder = model
    return _embedder


def _get_tokenizer() -> AutoTokenizer:
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = AutoTokenizer.from_pretrained(EMBED_MODEL)
    return _tokenizer


def _tokenize_query(query: str) -> tuple[list[int], list[float]]:
    """Tokenize query into sparse vector (CPU-only, uniform weight=1.0)."""
    tok = _get_tokenizer()
    ids = tok.encode(query, add_special_tokens=False)
    seen: set[int] = set()
    unique: list[int] = []
    for tid in ids:
        if tid not in seen:
            seen.add(tid)
            unique.append(tid)
    return unique, [1.0] * len(unique)


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        from qdrant_client import QdrantClient as QC
        _client = QC(QDRANT_URL, prefer_grpc=True, check_compatibility=False)
    return _client


def _collection_name(project: str) -> str:
    return f"aosp_{project}"


# ── MCP server ──────────────────────────────────────────────────────────

mcp = FastMCP(
    "aosp-search",
    host=os.environ.get("MCP_HOST", "127.0.0.1"),
    port=int(os.environ.get("MCP_PORT", "8000")),
)


@mcp.tool()
async def search_aosp(
    query: str,
    project: str = "aw_h618",
    module: str | None = None,
    top_k: int = TOP_K_DEFAULT,
) -> str:
    """Search AOSP code + wiki index semantically.

    Use this to find relevant code snippets and documentation for any
    AOSP-related question.  Supports module-scoped search (BSP / APP /
    FRAMEWORK) and multi-project isolation.

    Args:
        query: Natural-language search query (Chinese or English).
            Examples: "MIPI DSI lane config", "GPIO 中断处理流程",
            "bq27541 电量计驱动".
        project: Project identifier — one Qdrant collection per chip/vendor.
            Default ``"aw_h618"`` (Allwinner H618).
        module: Limit results to a single learning module.
            One of ``"BSP"``, ``"APP"``, ``"FRAMEWORK"`` (or ``None`` for all).
        top_k: Number of results to return (default 10, max 50).

    Returns:
        Formatted text with ranked results: [score] module type file_path (lines)
        followed by a content snippet.
    """
    if top_k < 1 or top_k > 50:
        return "Error: top_k must be between 1 and 50."

    client = _get_client()
    embedder = _get_embedder()
    collection_name = _collection_name(project)

    if not client.collection_exists(collection_name):
        return (
            f"Error: 项目 '{project}' 的索引不存在 "
            f"(collection '{collection_name}' 未找到)。"
            f"请先执行: cocoindex update main:{project}"
        )

    # ── Embed (dense) ──────────────────────────────────────────────
    query_vec = embedder.encode(query, convert_to_numpy=True, normalize_embeddings=True)

    # ── Tokenize (sparse) ──────────────────────────────────────────
    sparse_indices, sparse_values = _tokenize_query(query)

    # ── Filter (module scope) ───────────────────────────────────────
    query_filter = None
    if module:
        query_filter = qdrant_models.Filter(
            must=[
                qdrant_models.FieldCondition(
                    key="module",
                    match=qdrant_models.MatchValue(value=module),
                )
            ],
        )

    # ── Hybrid search (dense semantic + sparse lexical via RRF) ────────
    response = client.query_points(
        collection_name=collection_name,
        prefetch=[
            qdrant_models.Prefetch(
                query=query_vec.tolist(),
                using="dense",
                limit=top_k * 3,
            ),
            qdrant_models.Prefetch(
                query=qdrant_models.SparseVector(
                    indices=sparse_indices,
                    values=sparse_values,
                ),
                using="sparse",
                limit=top_k * 3,
            ),
        ],
        query=qdrant_models.FusionQuery(fusion=qdrant_models.Fusion.RRF),
        query_filter=query_filter,
        limit=top_k,
    )
    results = response.points

    if not results:
        scope = f"[{module}] " if module else ""
        return f"No results found for '{query}' in project '{project}' {scope}."

    # ── Format ──────────────────────────────────────────────────────
    type_icons = {"code": "📄", "wiki": "📖"}
    lines: list[str] = [
        f"Results for: **{query}**  (project={project}"
        + (f", module={module}" if module else "")
        + f", top_k={top_k})\n"
    ]

    for i, r in enumerate(results, 1):
        payload = r.payload or {}
        icon = type_icons.get(payload.get("chunk_type", ""), "❓")
        mod_tag = f"[{payload.get('module', '?')}]"
        fpath = payload.get("file_path", "?")
        start_l = payload.get("start_line", "?")
        end_l = payload.get("end_line", "?")
        func = payload.get("function_name")
        content = (payload.get("content", "") or "")[:300].replace("\n", " ").strip()

        header = (
            f"**#{i}** [{r.score:.3f}] {icon} {mod_tag} "
            f"`{fpath}` (L{start_l}-L{end_l})"
        )
        if func:
            header += f"  — `{func}()`"
        lines.append(header)
        lines.append(f"> {content}...")

    return "\n".join(lines)


# ── Entry point ─────────────────────────────────────────────────────────
#
# Local mode (Qoder on same machine):
#   python mcp_server.py
#
# Remote mode (Qoder on another host, GPU+Qdrant here):
#   MCP_TRANSPORT=sse MCP_HOST=0.0.0.0 MCP_PORT=8765 python mcp_server.py
#   Then on Qoder side:
#     {"aosp-search": {"url": "http://<this-ip>:8765/sse"}}

if __name__ == "__main__":
    transport = os.environ.get("MCP_TRANSPORT", "stdio")
    mcp.run(transport=transport)
