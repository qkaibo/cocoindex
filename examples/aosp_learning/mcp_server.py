#!/usr/bin/env python3
"""
code-search — 多项目语义代码检索 MCP server（单进程多端口、团队授权矩阵）。

架构（一机多项目 + 多团队远程连接）:
- platforms.yaml  平台清单（type 决定 collection 前缀, description 生成工具描述）
- teams.yaml      团队授权矩阵（每团队一个端口 + Bearer token + 可查项目列表）
- 单进程内每团队一个 FastMCP(streamable-http) 实例、独立端口、共享一份 embedding 模型
- 工具按授权项目动态注册: search_<project>; 每端口只暴露本团队授权项目的工具
- 新增项目/团队 = 只改 YAML, 重启服务即生效（零改码）

Usage (register in Hermes mcp_servers)::
    code-search-local:
      url: "http://127.0.0.1:9101/mcp"
      headers: { Authorization: "Bearer <token>" }

Or run standalone for testing:
    python mcp_server.py
"""

from __future__ import annotations

import os
import sys
import threading
import time
from typing import Annotated

# ── Offline mode (must be set before importing torch/transformers) ───────
# BGE-M3 is cached locally; skip HuggingFace Hub network checks that cause
# multi-second timeouts (or hangs behind a proxy).
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import pathlib

import uvicorn
import yaml
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from sentence_transformers import CrossEncoder  # reranker(可选)
from sentence_transformers import SentenceTransformer
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from transformers import AutoTokenizer

# ── Configuration ───────────────────────────────────────────────────────

load_dotenv()

QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
EMBED_MODEL = "BAAI/bge-m3"
VEC_DIM = 1024
TOP_K_DEFAULT = 10

_DIR = pathlib.Path(__file__).resolve().parent
_PLATFORMS_YAML = _DIR / "platforms.yaml"
_TEAMS_YAML = _DIR / "teams.yaml"
_SERVER_CFG_YAML = _DIR / "server_config.yaml"

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

# ── Lazy singletons (loaded once on first query, shared across ports) ────

_embedder: SentenceTransformer | None = None
_client: QdrantClient | None = None
_tokenizer: AutoTokenizer | None = None
_reranker: "CrossEncoder | None" = None
_reranker_failed: bool = False

# 多端口共享同一模型实例 —— 推理加锁串行化(查询频率低, 无性能影响)
_EMBED_LOCK = threading.Lock()


# ── 配置加载(数据驱动: platforms.yaml + teams.yaml) ─────────────────────

def load_server_config() -> dict:
    """读 server_config.yaml → 运行参数(唯一真相源, 改配置即生效, 不动代码)。"""
    if not _SERVER_CFG_YAML.exists():
        return {}
    with open(_SERVER_CFG_YAML, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return data or {}


def cfg_flag(value, default: bool = False) -> bool:
    """配置布尔解析: 兼容 true/True/1/yes 等写法。"""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "yes", "on")
    return default


_SERVER_CFG = load_server_config()


def load_platforms() -> dict:
    """读 platforms.yaml → {project: {type, description, ...}}"""
    with open(_PLATFORMS_YAML, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return data.get("platforms", {}) or {}


def load_teams() -> dict:
    """读 teams.yaml → {team_name: {token, projects, port}}"""
    if not _TEAMS_YAML.exists():
        return {}
    with open(_TEAMS_YAML, encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return data.get("teams", {}) or {}


def collection_name(project: str, platforms: dict) -> str:
    """Qdrant collection 名 = 规则生成: f\"{type}_{project}\"。

    - qcm4490 (type=aosp)         → aosp_qcm4490
    - seahorse_wear_base (type=rtos) → rtos_seahorse_wear_base
    与历史 collection 名一致, 零迁移; 新平台只需在 platforms.yaml 写对 type。
    """
    cfg = platforms.get(project, {})
    prefix = cfg.get("type")
    return f"{prefix}_{project}" if prefix else project


# ── Model / client singletons ───────────────────────────────────────────

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


# ── Shared search core (retrieval logic unchanged) ──────────────────────

async def _run_search(
    query: str,
    project: str,
    module: str | None,
    top_k: int,
    platforms: dict,
) -> str:
    """共享检索核心: 按 project 查对应 Qdrant collection 并格式化结果。"""
    if top_k < 1 or top_k > 50:
        return "Error: top_k must be between 1 and 50."

    client = _get_client()
    col = collection_name(project, platforms)

    if not client.collection_exists(col):
        known = "、".join(f"'{p}'" for p in platforms)
        return (
            f"Error: 项目 '{project}' 的索引不存在 "
            f"(collection '{col}' 未找到)。\n"
            f"当前支持的项目: {known}。\n"
            f"可先执行 cocoindex update <project>:<module> 建立索引。"
        )

    # embed+tokenize 共享模型, 加锁串行(多端口并发安全)
    with _EMBED_LOCK:
        embedder = _get_embedder()
        query_vec = embedder.encode(query, convert_to_numpy=True, normalize_embeddings=True)
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
    recall_n = RERANK_POOL if (RERANK_ENABLE and not _reranker_failed) else top_k
    response = client.query_points(
        collection_name=col,
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


# ── 动态工具生成(数据驱动) ──────────────────────────────────────────────

def make_generic_search_fn(allowed_projects: list, platforms: dict):
    """通用入口(原 search_aosp 改名 search_code): project 限定在授权范围内。

    注意: 参数注解必须全是静态字面量 —— FastMCP 用 `eval_str=True` 求值注解,
    环境只有模块全局(闭包变量不可见), 引用闭包变量会 NameError。
    授权项目列表在函数体内校验; 完整列表由调用方放进 add_tool 的 description。
    """

    async def _search_code(
        query: Annotated[str, Field(description="自然语言搜索查询(中文或英文), 例如 '蓝牙配对流程'、'MIPI DSI lane config'")],
        project: Annotated[str | None, Field(description="可选: 指定项目精确检索(必须是本端口授权项目); 不传 = 自动检索本端口全部授权项目")] = None,
        module: Annotated[str | None, Field(description="可选模块过滤(如 'BSP' / 'FW'), 默认全部")] = None,
        top_k: Annotated[int, Field(ge=1, le=50, description="返回结果条数(1-50)")] = TOP_K_DEFAULT,
    ) -> str:
        if project is not None:
            if project not in allowed_projects:
                return (
                    f"Error: 项目 '{project}' 不在本端口授权范围内。"
                    f"可用项目: {'、'.join(allowed_projects)}。"
                )
            return await _run_search(query, project, module, top_k, platforms)

        # 不传 project: 遍历本端口授权项目, 逐个检索, 结果分项目标注拼接
        parts = []
        for p in allowed_projects:
            parts.append(await _run_search(query, p, module, top_k, platforms))
        return "\n\n".join(parts) if parts else "本端口未授权任何项目。"

    _search_code.__name__ = "search_code"
    return _search_code


# ── Token 认证(每个端口一个 token, Authorization: Bearer <token>) ───────

class TokenAuthMiddleware(BaseHTTPMiddleware):
    """Bearer token 校验(每个端口一个 token)。
    AUTH_ENABLED=1 时启用; 默认关闭(内网直连, 不校验)。
    恢复认证: systemd 服务加 Environment="AUTH_ENABLED=1" 重启即可, 代码不动。
    """

    def __init__(self, app, token: str):
        super().__init__(app)
        self.token = token
        # 认证开关来自 server_config.yaml 的 auth.enabled（改配置即可, 不动代码/systemd）
        self.enabled = cfg_flag(_SERVER_CFG.get("auth", {}).get("enabled", False))

    async def dispatch(self, request, call_next):
        if self.enabled:
            auth = request.headers.get("authorization", "")
            if auth != f"Bearer {self.token}":
                return JSONResponse({"error": "unauthorized"}, status_code=401)
        return await call_next(request)


# ── 每团队一个端口实例 ──────────────────────────────────────────────────

def run_team_server(team_name: str, team_cfg: dict, platforms: dict) -> None:
    port = int(team_cfg["port"])
    mcp = FastMCP(
        f"code-search-{team_name}",
        host="0.0.0.0",
        port=port,
        log_level="WARNING",
    )

    allowed = team_cfg.get("projects", [])

    # 通用入口(search_code): 不传 project = 自动检索本端口全部授权项目; 传 = 精确指定单项目
    mcp.add_tool(
        make_generic_search_fn(allowed, platforms),
        name="search_code",
        description=(
            "代码检索(语义+关键词混合检索, 结果带文件路径+行号+代码片段)。\n"
            f"本端口授权项目: {'、'.join(allowed)}。\n"
            "project 可选: 不传 = 自动检索本端口全部授权项目; 传 = 精确指定单项目。"
        ),
    )

    app = TokenAuthMiddleware(mcp.streamable_http_app(), team_cfg.get("token", ""))
    print(f"[code-search] team={team_name} port={port} projects={allowed} 已启动")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")


# ── Warmup (消灭冷启动惩罚) ─────────────────────────────────────────
# 常驻服务启动时预热 embedder/tokenizer/Qdrant gRPC 通道,
# 首次查询冷启动 ~2.2s(embedder 267ms + tokenizer 1473ms + channel 481ms) → ~50ms。
# 失败自动跳过(懒加载兜底,行为不回归)。MCP_WARMUP=0 可关闭。

_WARMUP_QUERY = "qti_battery_charger 充电截止电压 配置"


def _warmup(platforms: dict) -> None:
    from time import perf_counter

    t0 = perf_counter()
    try:
        embedder = _get_embedder()
        qv = embedder.encode(_WARMUP_QUERY, convert_to_numpy=True, normalize_embeddings=True)
        si, sv = _tokenize_query(_WARMUP_QUERY)
        client = _get_client()
        col = collection_name("qcm4490", platforms)
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


# ── Entry point ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    platforms = load_platforms()
    teams = load_teams()

    if not teams:
        print("[code-search] teams.yaml 未配置任何团队, 退出")
        sys.exit(1)

    if os.environ.get("MCP_WARMUP", "1") != "0":
        _warmup(platforms)

    threads = [
        threading.Thread(
            target=run_team_server,
            args=(name, cfg, platforms),
            daemon=True,
            name=f"code-search-{name}",
        )
        for name, cfg in teams.items()
    ]
    for t in threads:
        t.start()

    print(
        "[code-search] 全部端口已启动: "
        + ", ".join(f"{name}->:{cfg['port']}" for name, cfg in teams.items())
    )
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        print("\n[code-search] 退出")