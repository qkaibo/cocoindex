#!/usr/bin/env python3
"""
MCP Server for AOSP Code+Wiki Semantic Search.

Exposes a ``search_aosp`` tool so AI agents (Claude Code, Codex, etc.) can
query the Qdrant index directly — no CLI needed.

Usage (register in your MCP config)::

    {
        "aosp-search": {
            "command": "/home/ts/.hermes/hermes-agent/venv/bin/python",
            "args": ["/home/ts/cocoindex/examples/aosp_learning/mcp_server.py"]
        }
    }

Or run standalone for testing::

    python mcp_server.py
"""

from __future__ import annotations

import os
from typing import Annotated

# ── Offline mode (must be set before importing torch/transformers) ───────
# BGE-M3 is cached locally; skip HuggingFace Hub network checks that cause
# multi-second timeouts (or hangs behind a proxy).
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from sentence_transformers import SentenceTransformer
from sentence_transformers import CrossEncoder  # reranker(可选)
from transformers import AutoTokenizer

# ── Configuration ───────────────────────────────────────────────────────

load_dotenv()

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
EMBED_MODEL = "BAAI/bge-m3"
VEC_DIM = 1024
TOP_K_DEFAULT = 10

# ── Reranker 配置(可选,默认关闭)──────────────────────────────
# 流程: dense+sparse 召回 RERANK_POOL 个候选 → reranker 精排 → 返回 top_k。
# 关闭: RERANK_ENABLE=0(完全退回纯 bge-m3,零额外依赖)。
# 注: 141 问全量评测(107 问可信 GT)实测 4 个 reranker(Qwen3-0.6B/4B、bge-v2-m3、jina-v2)
#      全部为负收益(Recall 0.734 → 0.53-0.57),根因: reranker 只看文本相似度,
#      丢掉了 RRF 的文件路径+词法+语义三路信号,无信息增量。纯 RRF 为最优配置。
#      如需启用: RERANK_ENABLE=1 并用 RERANK_MODEL 指定模型。
RERANK_ENABLE = os.environ.get("RERANK_ENABLE", "0") == "1"
RERANK_MODEL = os.environ.get("RERANK_MODEL", "Qwen/Qwen3-Reranker-0.6B")
RERANK_POOL = int(os.environ.get("RERANK_POOL", "30"))  # 召回候选数(精排输入)
RERANK_BATCH = int(os.environ.get("RERANK_BATCH", "4"))  # 实测 batch=4 最优(长尾 padding)

# ── Lazy singletons (loaded once on first query) ────────────────────────

_embedder: SentenceTransformer | None = None
_client: QdrantClient | None = None
_tokenizer: AutoTokenizer | None = None
_reranker: "CrossEncoder | None" = None
_reranker_failed: bool = False


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


def _get_reranker() -> "CrossEncoder | None":
    """懒加载 reranker。失败时置 _reranker_failed,后续调用直接返回 None(fallback 纯 bge-m3)。"""
    global _reranker, _reranker_failed
    if not RERANK_ENABLE or _reranker_failed:
        return None
    if _reranker is None:
        try:
            _reranker = CrossEncoder(RERANK_MODEL, device="cuda", max_length=2048)
        except Exception as e:  # 模型缺失/无 GPU 等 → 不阻断检索
            _reranker_failed = True
            print(f"[reranker] 加载失败,禁用精排,退回纯 bge-m3: {e}")
            return None
    return _reranker


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


# 已知项目清单(单一事实来源: project → 描述)
# 与 platforms.yaml 的平台条目保持一致; 新平台在此追加。
_PROJECTS = {
    "qcm4490": "Qualcomm QCM4490 (AOSP/Android BSP: kernel_platform + vendor + amss)",
    "seahorse_wear_base": "Seahorse 穿戴设备固件 (RTOS: rtos + bthost + multimedia + nn)",
}


def _collection_name(project: str) -> str:
    """Qdrant collection 名(带平台类型前缀): aosp_=Android, rtos_=嵌入式固件。"""
    return {
        "qcm4490": "aosp_qcm4490",
        "seahorse_wear_base": "rtos_seahorse_wear_base",
    }.get(project, project)


# ── MCP server ──────────────────────────────────────────────────────────

mcp = FastMCP(
    "aosp-search",
    host=os.environ.get("MCP_HOST", "127.0.0.1"),
    port=int(os.environ.get("MCP_PORT", "8000")),
)


async def _run_search(
    query: str,
    project: str,
    module: str | None,
    top_k: int,
) -> str:
    """共享检索核心: 按 project 查对应 Qdrant collection 并格式化结果。

    query: 自然语言查询(中文/英文)。
    project: 项目标识(qcm4490 / seahorse_wear_base),决定查哪个 collection。
    module: 可选模块过滤。
    top_k: 返回条数(1-50)。
    """
    if top_k < 1 or top_k > 50:
        return "Error: top_k must be between 1 and 50."

    client = _get_client()
    embedder = _get_embedder()
    collection_name = _collection_name(project)

    if not client.collection_exists(collection_name):
        known = "、".join(f"'{p}'" for p in _PROJECTS)
        return (
            f"Error: 项目 '{project}' 的索引不存在 "
            f"(collection '{collection_name}' 未找到)。\n"
            f"当前支持的项目: {known}。\n"
            f"可先执行 cocoindex update <project>:<module> 建立索引。"
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
    # 召回 RERANK_POOL 个候选(reranker 的输入池),而不是直接取 top_k
    recall_n = RERANK_POOL if (RERANK_ENABLE and not _reranker_failed) else top_k
    response = client.query_points(
        collection_name=collection_name,
        prefetch=[
            qdrant_models.Prefetch(
                query=query_vec.tolist(),
                using="dense",
                limit=recall_n * 3,
            ),
            qdrant_models.Prefetch(
                query=qdrant_models.SparseVector(
                    indices=sparse_indices,
                    values=sparse_values,
                ),
                using="sparse",
                limit=recall_n * 3,
            ),
        ],
        query=qdrant_models.FusionQuery(fusion=qdrant_models.Fusion.RRF),
        query_filter=query_filter,
        limit=recall_n,
    )
    results = response.points

    if not results:
        scope = f"[{module}] " if module else ""
        return f"No results found for '{query}' in project '{project}' {scope}."

    # ── Rerank (Qwen3-Reranker 精排) ──────────────────────────────────
    reranker = _get_reranker()
    reranked = False
    _rerank_scores: list[float] = []
    if reranker is not None and len(results) > 1:
        try:
            pairs = [(query, (r.payload or {}).get("content", "")) for r in results]
            scores = reranker.predict(pairs, batch_size=RERANK_BATCH)
            # 按 reranker 分数降序重排
            order = sorted(range(len(results)), key=lambda i: -float(scores[i]))
            results = [results[i] for i in order]
            _rerank_scores = [float(scores[i]) for i in order]
            reranked = True
        except Exception as e:
            print(f"[reranker] 精排失败,退回原始 RRF 顺序: {e}")

    # ── Format ──────────────────────────────────────────────────────
    type_icons = {"code": "📄", "wiki": "📖"}
    lines: list[str] = [
        f"Results for: **{query}**  (project={project}"
        + (f", module={module}" if module else "")
        + (f", reranked={RERANK_MODEL.split('/')[-1]}" if reranked else ", rerank=off")
        + f", top_k={top_k})\n"
    ]

    for i, r in enumerate(results[:top_k], 1):
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
        if reranked:
            header += f"  — rerank_score={_rerank_scores[i-1]:.3f}"
        if func:
            header += f"  — `{func}()`"
        lines.append(header)
        lines.append(f"> {content}...")

    return "\n".join(lines)


# ── 业务化工具: 每个平台一个, 客户端按工具名/描述选择 ────────────────────
# 原则: 工具名 = 平台名, 描述 = 业务场景。客户端 list_tools 看到名字和描述
# 就知道"这个问题该用哪个工具", 无需理解 project 参数。


def _q_field(**kw):
    return Field(**kw)  # 保持 import 简洁


@mcp.tool()
async def search_aosp(
    query: Annotated[str, Field(description="自然语言搜索查询(中文或英文), 例如 '蓝牙配对流程'、'MIPI DSI lane config'")],
    project: Annotated[str, Field(description=(
        "项目/芯片标识, 决定搜索哪套代码。Known projects:\n"
        "  - 'qcm4490': Qualcomm QCM4490 手机平台 (AOSP/Android BSP)\n"
        "  - 'seahorse_wear_base': Seahorse 穿戴设备 (RTOS 固件)\n"
        "同一芯片的多套代码各有独立索引, 必须显式指定; 不确定时先问用户是哪颗芯片。"
    ))] = "qcm4490",
    module: Annotated[str | None, Field(description="可选模块过滤(如 'BSP' / 'FW'), 默认全部")] = None,
    top_k: Annotated[int, Field(ge=1, le=50, description="返回结果条数(1-50)")] = TOP_K_DEFAULT,
) -> str:
    """通用代码检索(需显式指定 project)。

    业务判断: 问题关于「手机 / Android / 高通内核 / 充电 / 显示面板」→ project="qcm4490";
    问题关于「耳机 / 蓝牙 BTHost / 可穿戴 RTOS 固件」→ project="seahorse_wear_base"。
    同一颗芯片的代码必须用对应 project 检索——靠语义判断芯片归属不可靠, 显式指定为准。
    """
    return await _run_search(query, project, module, top_k)


@mcp.tool()
async def search_qcm4490(
    query: Annotated[str, Field(description="自然语言搜索查询(中文或英文), 例如 '蓝牙配对流程'、'MIPI DSI lane config'")],
    module: Annotated[str | None, Field(description="可选模块过滤(如 'BSP'), 默认全部")] = None,
    top_k: Annotated[int, Field(ge=1, le=50, description="返回结果条数(1-50)")] = TOP_K_DEFAULT,
) -> str:
    """搜索高通 QCM4490 手机平台 (AOSP/Android) 的代码索引。

    业务场景: Android/手机 相关的一切——内核驱动、充电管理、显示面板、
    电源、外设(BSP)、modem(amss)等 4490 平台问题。
    结果带文件路径+行号+代码片段。
    """
    return await _run_search(query, "qcm4490", module, top_k)


@mcp.tool()
async def search_seahorse_wear_base(
    query: Annotated[str, Field(description="自然语言搜索查询(中文或英文), 例如 '蓝牙配对流程'、'MIPI DSI lane config'")],
    module: Annotated[str | None, Field(description="可选模块过滤(如 'FW'), 默认全部")] = None,
    top_k: Annotated[int, Field(ge=1, le=50, description="返回结果条数(1-50)")] = TOP_K_DEFAULT,
) -> str:
    """搜索 Seahorse 穿戴设备 (RTOS) 固件的代码索引。

    业务场景: 耳机/智能穿戴 固件——蓝牙协议栈 (bthost)、RTOS 内核、
    多媒体、DSP/NN、应用层 (apps) 等。
    注意区分: 手机 (Android) 的蓝牙/配对问题属于 4490 平台,
    请用 search_qcm4490——本工具只查耳机固件代码。
    结果带文件路径+行号+代码片段。
    """
    return await _run_search(query, "seahorse_wear_base", module, top_k)


# ── Entry point ─────────────────────────────────────────────────────────
#
# Local mode (Qoder on same machine):
#   python mcp_server.py
#
# Remote mode (Qoder on another host, GPU+Qdrant here):
#   MCP_TRANSPORT=sse MCP_HOST=0.0.0.0 MCP_PORT=8765 python mcp_server.py
#   Then on Qoder side:
#     {"aosp-search": {"url": "http://<this-ip>:8765/sse"}}

# ── Warmup (消灭冷启动惩罚) ─────────────────────────────────────────
# 常驻服务(stdio/SSE)启动时预热 embedder/tokenizer/Qdrant gRPC 通道,
# 首次查询冷启动 ~2.2s(embedder 267ms + tokenizer 1473ms + channel 481ms) → ~50ms。
# 失败自动跳过(懒加载兜底,行为不回归)。MCP_WARMUP=0 可关闭。

_WARMUP_QUERY = "qti_battery_charger 充电截止电压 配置"


def _warmup() -> None:
    from time import perf_counter

    t0 = perf_counter()
    try:
        embedder = _get_embedder()
        qv = embedder.encode(_WARMUP_QUERY, convert_to_numpy=True, normalize_embeddings=True)
        si, sv = _tokenize_query(_WARMUP_QUERY)
        client = _get_client()
        col = _collection_name("qcm4490")
        if client.collection_exists(col):
            client.query_points(
                collection_name=col,
                prefetch=[
                    qdrant_models.Prefetch(query=qv.tolist(), using="dense", limit=10),
                    qdrant_models.Prefetch(
                        query=qdrant_models.SparseVector(indices=si, values=sv),
                        using="sparse",
                        limit=10,
                    ),
                ],
                query=qdrant_models.FusionQuery(fusion=qdrant_models.Fusion.RRF),
                limit=1,
            )
        print(f"[warmup] 完成: embedder+tokenizer+Qdrant 已就绪 ({perf_counter() - t0:.1f}s)")
    except Exception as e:
        print(f"[warmup] 跳过(首次查询时懒加载兜底): {e}")


if __name__ == "__main__":
    transport = os.environ.get("MCP_TRANSPORT", "stdio")
    if os.environ.get("MCP_WARMUP", "1") != "0":
        _warmup()
    mcp.run(transport=transport)
