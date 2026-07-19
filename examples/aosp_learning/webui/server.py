#!/usr/bin/env python3
"""
AOSP Learning Console — 整合 hermes-studio 前端 + 学习 API + hermes API 代理

架构:
  浏览器 :8699 → FastAPI (本文件)
    ├─ /                   → hermes-studio 静态前端 (webui/static/)
    ├─ /api/learning/*     → cocoindex 学习控制 API (本地)
    └─ /api/* (其他)        → 代理到 hermes-studio Koa (127.0.0.1:8648)
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import signal
import sys
import time
from pathlib import Path
from datetime import datetime
from typing import AsyncIterator

# ── Paths ────────────────────────────────────────────────────────────────
PROJECT_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = Path(__file__).resolve().parent / "static"
CONFIG_FILE = PROJECT_DIR / ".cocoindex_config.json"
PID_FILE = PROJECT_DIR / ".cocoindex_pid.json"  # 进程持久化：重启后恢复跟踪
HISTORY_FILE = PROJECT_DIR / ".cocoindex_history.json"  # 模块学习历史
VENV_ACTIVATE = "/CM/cocoindex-env/bin/activate"

# 各模块源文件总数（用于判断学习是否完成）
# BSP: longan(83536) + hardware(12768) + device(7756) + vendor(5037)
# FRAMEWORK: frameworks(40197) + system(6140)
# APP: packages(49743) + cts(13780)
MODULE_FILE_COUNTS = {"BSP": 109097, "FRAMEWORK": 46337, "APP": 63523}

import yaml

# ── Cached file counts ────────────────────────────────────────────────────
FILE_COUNTS_CACHE = PROJECT_DIR / ".cocoindex_file_counts.json"

def _count_module_files(platform: str = "") -> dict[str, int]:
    """扫描 AOSP 源目录，统计每个模块的源文件数。"""
    try:
        with open(PROJECT_DIR / "platforms.yaml") as f:
            platforms = yaml.safe_load(f)
        key = platform or load_config().get("platform", "aw_h618")
        cfg = platforms["platforms"][key]
        aosp_root = Path(cfg["aosp_root"])
        modules = cfg["modules"]
    except Exception:
        return dict(MODULE_FILE_COUNTS)  # fallback

    # 各模块的文件扩展名
    exts = {
        "BSP": ["*.c", "*.h", "*.cpp", "*.cc", "*.java", "*.mk", "*.bp", "*.dts", "*.dtsi", "*.S", "*.s"],
        "FRAMEWORK": ["*.java", "*.kt", "*.aidl", "*.xml", "*.cpp", "*.h"],
        "APP": ["*.java", "*.kt", "*.xml", "*.aidl"],
    }

    result = {}
    for mod in modules:
        name = mod["name"]
        total = 0
        for glob in mod.get("code_globs", []):
            # glob 格式: "**/hardware/**" → 提取顶层目录
            top_dir = glob.strip("*").strip("/")
            dir_path = aosp_root / top_dir
            if not dir_path.exists():
                continue
            for ext in exts.get(name, ["*"]):
                try:
                    count = len(list(dir_path.rglob(ext)))
                except Exception:
                    count = 0
                total += count
        result[name] = total
    return result

def get_file_counts() -> dict[str, int]:
    """返回模块文件计数，优先从缓存读。"""
    if FILE_COUNTS_CACHE.exists():
        try:
            with open(FILE_COUNTS_CACHE) as f:
                cached = json.load(f)
            if all(m in cached for m in ("BSP", "FRAMEWORK", "APP")):
                return cached
        except Exception:
            pass
    # 缓存不存在，同步计数
    counts = _count_module_files()
    if counts:
        with open(FILE_COUNTS_CACHE, "w") as f:
            json.dump(counts, f)
    return counts

# Koa hermes-studio 后端地址
HERMES_BACKEND = "http://127.0.0.1:8648"

# ── Default config ───────────────────────────────────────────────────────
DEFAULT_CONFIG = {
    "platform": "aw_h618",
    "modules": ["BSP", "FRAMEWORK", "APP"],
    "activeModule": "BSP",
    "runtime": {"max_workers": 256, "timeout": 300, "max_inflight": 4096},
}

# ── 平台 & 模块：从 platforms.yaml 动态加载 ──────────────────────────────
_platforms_cache: dict | None = None

def _load_platforms() -> dict:
    """加载 platforms.yaml，缓存结果."""
    global _platforms_cache
    if _platforms_cache is not None:
        return _platforms_cache
    try:
        with open(PROJECT_DIR / "platforms.yaml") as f:
            data = yaml.safe_load(f)
        _platforms_cache = data if data else {}
        return _platforms_cache
    except Exception as e:
        print(f"[warn] 加载 platforms.yaml 失败: {e}")
        _platforms_cache = {}
        return {}

def get_available_platforms() -> list[dict]:
    """返回可选平台列表（platforms.yaml + 用户自定义）."""
    data = _load_platforms()
    builtin = data.get("platforms", {})
    user = _load_user_platforms()
    # 合并：用户平台覆盖同名内置平台
    all_platforms = {**builtin, **user}
    result = []
    for key, cfg in all_platforms.items():
        result.append({
            "name": key,
            "aosp_root": cfg.get("aosp_root", ""),
            "wiki_root": cfg.get("wiki_root", ""),
            "modules": [m["name"] for m in cfg.get("modules", [])],
            "source": "user" if key in user else "builtin",
        })
    return result

def get_modules_for_platform(platform: str) -> list[dict]:
    """返回指定平台的模块列表."""
    # 先查用户平台，再查内置
    user = _load_user_platforms()
    if platform in user:
        return user[platform].get("modules", [])
    data = _load_platforms()
    platforms = data.get("platforms", {})
    cfg = platforms.get(platform, {})
    return cfg.get("modules", [])

def get_all_modules(platform: str) -> list[dict]:
    """返回指定平台的所有模块（兼容旧 API）"""
    return get_modules_for_platform(platform)


# ── Runtime state ────────────────────────────────────────────────────────
_proc: asyncio.subprocess.Process | None = None
_proc_module: str = ""
_stats: dict = {"total": 0, "in_flight": 0, "added": 0, "elapsed": 0, "running": False}
_stats_lock = asyncio.Lock()
_log_buffer: list[str] = []  # 最近 200 行日志，前端可以看到模型加载等阶段


# ── External process detection ──────────────────────────────────────────
def _find_external_cocoindex() -> list[dict]:
    """发现所有外部 cocoindex 进程."""
    import glob as _glob
    result = []
    for entry in _glob.glob("/proc/[0-9]*/cmdline"):
        try:
            with open(entry, "rb") as f:
                raw = f.read()
            parts = raw.split(b"\x00")
            args = [p.decode("utf-8", errors="replace") for p in parts if p]
            if len(args) < 3:
                continue
            if "cocoindex" not in args[-3] and "cocoindex" not in args[-2]:
                continue
            if "update" not in args[-2] and "update" not in args[-1]:
                continue
            target = ""
            for a in args:
                if ":" in a and "_" in a:
                    target = a
                    break
            if not target:
                continue
            module = target.rsplit("_", 1)[-1].upper()
            pid = int(entry.split("/")[2])
            result.append({"pid": pid, "module": module, "target": target})
        except Exception:
            continue
    return result


def _get_proc_info(pid: int) -> dict:
    info = {"pid": pid, "alive": True, "cpu_percent": 0.0, "rss_mb": 0, "uptime_seconds": 0}
    try:
        stat_path = f"/proc/{pid}/stat"
        with open(stat_path) as f:
            fields = f.read().split()
        if len(fields) >= 22:
            starttime_ticks = int(fields[21])
            clk_tck = os.sysconf(os.sysconf_names["SC_CLK_TCK"])
            uptime_ticks = int(open("/proc/uptime").read().split()[0].split(".")[0]) * clk_tck
            info["uptime_seconds"] = max(0, (uptime_ticks - starttime_ticks) / clk_tck)
            utime = int(fields[13])
            stime = int(fields[14])
            total_ticks = utime + stime
            if info["uptime_seconds"] > 0:
                info["cpu_percent"] = round((total_ticks / clk_tck) / info["uptime_seconds"] * 100, 1)
        with open(f"/proc/{pid}/status") as f:
            for line in f:
                if line.startswith("VmRSS:"):
                    info["rss_mb"] = int(line.split()[1]) // 1024
                    break
    except Exception:
        info["alive"] = not os.path.exists(f"/proc/{pid}")
    return info


# ── Config helpers ───────────────────────────────────────────────────────
def load_config() -> dict:
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            cfg = json.load(f)
        return {**DEFAULT_CONFIG, **cfg, "runtime": {**DEFAULT_CONFIG["runtime"], **cfg.get("runtime", {})}}
    return DEFAULT_CONFIG


def save_config(cfg: dict) -> None:
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)


# ── History helpers ──────────────────────────────────────────────────────
def load_history() -> dict[str, dict]:
    """返回 {module: {status, total, added, elapsed, exit_code, time}}."""
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return {}

def save_history(module: str, record: dict) -> None:
    h = load_history()
    h[module] = record
    with open(HISTORY_FILE, "w") as f:
        json.dump(h, f, indent=2, ensure_ascii=False)


# ── Qdrant index stats ───────────────────────────────────────────────────
_qdrant_cache: dict[str, int] | None = None
_qdrant_cache_time: float = 0.0

async def _get_module_index_counts() -> dict[str, int]:
    """从 Qdrant 查询每个模块的实际索引文档数（并发 + 10s 缓存）."""
    global _qdrant_cache, _qdrant_cache_time
    now = time.time()
    if _qdrant_cache is not None and (now - _qdrant_cache_time) < 10:
        return _qdrant_cache

    cfg = load_config()
    platform = cfg.get("platform", "aw_h618")
    collection = f"aosp_{platform}"

    async def _count(module: str) -> tuple[str, int]:
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(3.0)) as client:
                resp = await client.post(
                    f"http://127.0.0.1:6333/collections/{collection}/points/count",
                    json={"filter": {"must": [{"key": "module", "match": {"value": module}}]}},
                )
                count = resp.json().get("result", {}).get("count", 0) if resp.status_code == 200 else 0
                return (module, count)
        except Exception:
            return (module, 0)

    try:
        results = await asyncio.gather(_count("BSP"), _count("APP"), _count("FRAMEWORK"))
        _qdrant_cache = dict(results)
        _qdrant_cache_time = now
        return dict(_qdrant_cache)
    except Exception:
        return _qdrant_cache or {}


# ── Stats parser ─────────────────────────────────────────────────────────
_STATS_RE = re.compile(r"process_code_file: (\d+) total, (\d+) in-flight \| (\d+)")
_ELAPSED_RE = re.compile(r"Elapsed: ([\d.]+)s")
_ANSI_RE = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]")  # 清洗 ANSI 转义码
_SPINNER_CHARS = set("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏⣾⣽⣻⢿⡿⣟⣯⣷")  # spinner / 进度条字符


def _clean_log_line(line: str) -> str | None:
    """清洗日志行，去掉 ANSI 码和纯 spinner 行，返回干净文本或 None."""
    cleaned = _ANSI_RE.sub("", line).strip()
    if not cleaned:
        return None
    # 跳过只有 spinner 字符的行
    if all(c in _SPINNER_CHARS or c.isspace() for c in cleaned):
        return None
    # 去掉行首 spinner + 空格
    cleaned = cleaned.lstrip("".join(_SPINNER_CHARS) + " ")
    return cleaned


def parse_line(line: str) -> dict | None:
    sm = _STATS_RE.search(line)
    em = _ELAPSED_RE.search(line)
    if sm:
        return {"total": int(sm.group(1)), "in_flight": int(sm.group(2)),
                "added": int(sm.group(3)), "elapsed": float(em.group(1)) if em else 0}
    return None


# ── FastAPI app ──────────────────────────────────────────────────────────
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from contextlib import asynccontextmanager
import httpx
import uvicorn

_http_client: httpx.AsyncClient | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _http_client
    _http_client = httpx.AsyncClient(timeout=httpx.Timeout(60.0))
    yield
    if _http_client:
        await _http_client.aclose()

app = FastAPI(title="AOSP Learning Console", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────────────────────
class RuntimeConfig(BaseModel):
    max_workers: int = 256
    timeout: int = 300
    max_inflight: int = 4096

class AppConfig(BaseModel):
    platform: str = "aw_h618"
    modules: list[str] = ["BSP", "FRAMEWORK", "APP"]
    activeModule: str = "BSP"
    runtime: RuntimeConfig = RuntimeConfig()

class IndexStartRequest(BaseModel):
    module: str


# ── Learning APIs ────────────────────────────────────────────────────────
@app.get("/api/learning/config")
async def get_config():
    return load_config()

@app.put("/api/learning/config")
async def update_config(cfg: AppConfig):
    save_config(cfg.model_dump())
    return {"status": "ok"}

@app.get("/api/learning/platforms")
async def list_platforms():
    return get_available_platforms()

# ── 平台管理：CRUD 持久化到 .cocoindex_platforms.json ──────────────────
PLATFORMS_JSON = PROJECT_DIR / ".cocoindex_platforms.json"

def _load_user_platforms() -> dict:
    """加载用户自定义平台."""
    if PLATFORMS_JSON.exists():
        try:
            with open(PLATFORMS_JSON) as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_user_platforms(data: dict) -> None:
    with open(PLATFORMS_JSON, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

class PlatformCreate(BaseModel):
    name: str
    aosp_root: str
    wiki_root: str = "./aosp_wiki"
    modules: list[dict] = []  # [{name, code_globs, wiki_dir, description}]

@app.post("/api/learning/platforms")
async def create_platform(req: PlatformCreate):
    data = _load_user_platforms()
    if req.name in data:
        raise HTTPException(400, f"平台 {req.name} 已存在")
    data[req.name] = {
        "aosp_root": req.aosp_root,
        "wiki_root": req.wiki_root,
        "modules": req.modules,
    }
    _save_user_platforms(data)
    return {"status": "ok", "name": req.name}

@app.put("/api/learning/platforms/{name}")
async def update_platform(name: str, req: PlatformCreate):
    data = _load_user_platforms()
    data[name] = {
        "aosp_root": req.aosp_root,
        "wiki_root": req.wiki_root,
        "modules": req.modules,
    }
    _save_user_platforms(data)
    return {"status": "ok", "name": name}

@app.delete("/api/learning/platforms/{name}")
async def delete_platform(name: str):
    data = _load_user_platforms()
    if name not in data:
        raise HTTPException(404, f"平台 {name} 不存在")
    del data[name]
    _save_user_platforms(data)
    return {"status": "ok", "name": name}

@app.get("/api/learning/modules")
async def list_modules(platform: str = ""):
    cfg = load_config()
    p = platform or cfg.get("platform", "aw_h618")
    return get_modules_for_platform(p)

@app.post("/api/learning/refresh-file-counts")
async def refresh_file_counts():
    try:
        counts = _count_module_files()
        with open(FILE_COUNTS_CACHE, "w") as f:
            json.dump(counts, f)
        return {"status": "ok", "counts": counts}
    except Exception as e:
        raise HTTPException(500, f"文件计数失败: {e}")

@app.get("/api/learning/status")
async def index_status():
    global _proc
    async with _stats_lock:
        s = dict(_stats)
        recent_logs = list(_log_buffer[-30:])
        recent_logs.reverse()
    s["process_alive"] = _proc is not None and _proc.returncode is None
    if not s["process_alive"] and _proc_module:
        for ext in _find_external_cocoindex():
            if ext["module"] == _proc_module and _get_proc_info(ext["pid"])["alive"]:
                s["process_alive"] = True
                s["running"] = True
                break
    if _proc is not None and _proc.returncode is not None:
        s["exit_code"] = _proc.returncode
    s["module"] = _proc_module
    exts = _find_external_cocoindex()
    ext_list = []
    for ext in exts:
        if _proc is None or _proc.pid != ext["pid"]:
            ext_list.append({**ext, **_get_proc_info(ext["pid"]), "source": "external"})
    s["external_processes"] = ext_list
    non_bsp = [e for e in ext_list if e["module"] != "BSP"]
    s["external_process"] = non_bsp[0] if non_bsp else (ext_list[0] if ext_list else None)
    if _proc is None and ext_list:
        main_ext = s["external_process"]
        if main_ext:
            s["process_alive"] = True
            s["running"] = True
            s["module"] = main_ext["module"]
            s["elapsed"] = main_ext["uptime_seconds"]
    s["log_lines"] = recent_logs
    history = load_history()
    qdrant_counts = await _get_module_index_counts()
    for mod_name, count in qdrant_counts.items():
        if mod_name in history:
            h = history[mod_name]
            h["added"] = count  # Qdrant chunk 数，纯展示
            # 完成状态只信进程退出结果，不用 chunk 数跟文件数瞎比
            if h.get("status") in ("completed", "error", "stopped"):
                h["complete"] = h["status"] == "completed"
            else:
                h["complete"] = None  # 进程没正常退出，不瞎猜
        elif count > 0:
            history[mod_name] = {"status": "indexed", "total": 0, "added": count,
                                 "elapsed": 0, "time": "", "complete": None}
    s["history"] = history
    return s

@app.post("/api/learning/start")
async def start_index(req: IndexStartRequest):
    global _proc, _proc_module, _stats, _log_buffer
    if _proc is not None and _proc.returncode is None:
        raise HTTPException(400, f"已有一个索引在运行: {_proc_module}")
    # 也检测外部同名模块进程，防止重复启动
    for ext in _find_external_cocoindex():
        if ext["module"] == req.module and _get_proc_info(ext["pid"])["alive"]:
            raise HTTPException(400, f"已有一个外部 {req.module} 索引在运行 (PID {ext['pid']})")
    cfg = load_config()
    platform = cfg.get("platform", "aw_h618")
    runtime = cfg["runtime"]
    module = req.module
    valid = [m["name"] for m in get_modules_for_platform(platform)]
    if module not in valid:
        raise HTTPException(400, f"未知模块: {module}，可选: {valid}")
    env = os.environ.copy()
    env.update({
        "COCOINDEX_DB": str(PROJECT_DIR / ".cocoindex_state"),
        "COCOINDEX_MAX_INFLIGHT_COMPONENTS": str(runtime["max_inflight"]),
        "HF_HUB_OFFLINE": "1",
        "PYTORCH_CUDA_ALLOC_CONF": "expandable_segments:True",
    })
    cmd = f"source {VENV_ACTIVATE} && cocoindex update {platform}:{platform}_{module.lower()} 2>&1"
    _proc = await asyncio.create_subprocess_exec(
        "bash", "-c", cmd,
        cwd=str(PROJECT_DIR), env=env,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
        preexec_fn=os.setsid,
    )
    _proc_module = module
    _save_pid(_proc.pid, module)
    async with _stats_lock:
        _stats = {"total": 0, "in_flight": 0, "added": 0, "elapsed": 0, "running": True}
        _log_buffer = []
    asyncio.create_task(_monitor_output(_proc))
    return {"status": "started", "module": module, "pid": _proc.pid}

@app.post("/api/learning/stop")
async def stop_index(request: Request):
    global _proc
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    target_module = body.get("module") if body else None
    # 优先停止跟踪的进程
    if _proc is not None and _proc.returncode is None:
        try:
            os.killpg(os.getpgid(_proc.pid), signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            await asyncio.wait_for(_proc.wait(), timeout=10)
        except asyncio.TimeoutError:
            os.killpg(os.getpgid(_proc.pid), signal.SIGKILL)
        async with _stats_lock:
            _stats["running"] = False
            save_history(_proc_module, {
                "status": "stopped", "total": _stats["total"], "added": _stats["added"],
                "elapsed": _stats["elapsed"], "exit_code": 143,
                "time": datetime.now().isoformat(),
                "complete": _stats["total"] > 0 and _stats["added"] >= _stats["total"],
            })
        _clear_pid()
        return {"status": "stopped", "pid": _proc.pid}
    # 否则尝试停止外部进程
    exts = _find_external_cocoindex()
    for ext in exts:
        info = _get_proc_info(ext["pid"])
        if not info["alive"]:
            continue
        if target_module and ext["module"] != target_module:
            continue
        # 不指定模块时不自动杀 BSP，但指定了就杀
        if not target_module:
            # 如果有非 BSP 进程优先杀，没有才杀 BSP
            non_bsp = [e for e in exts if e["module"] != "BSP"]
            if non_bsp and ext["module"] == "BSP":
                continue
        try:
            os.kill(ext["pid"], signal.SIGTERM)
            _clear_pid()
            return {"status": "stopped", "pid": ext["pid"], "module": ext["module"]}
        except ProcessLookupError:
            pass
    return {"status": "not_running"}

async def _monitor_output(proc: asyncio.subprocess.Process):
    global _stats, _log_buffer
    _pending_elapsed = 0.0
    try:
        async for line in proc.stdout:
            line_str = line.decode("utf-8", errors="replace") if isinstance(line, bytes) else line
            parsed = parse_line(line_str)
            if parsed:
                if _pending_elapsed:
                    parsed["elapsed"] = _pending_elapsed
                async with _stats_lock:
                    # 锁定 total：取第一次看到的值，后续不变
                    if _stats["total"] == 0 and parsed.get("total", 0) > 0:
                        _stats["total"] = parsed["total"]
                    # added 和 in_flight 每次更新
                    if "added" in parsed:
                        _stats["added"] = parsed["added"]
                    if "in_flight" in parsed:
                        _stats["in_flight"] = parsed["in_flight"]
                    if "elapsed" in parsed:
                        _stats["elapsed"] = parsed["elapsed"]
                    _stats["running"] = True
            else:
                em = _ELAPSED_RE.search(line_str)
                if em:
                    _pending_elapsed = float(em.group(1))
                # 所有非 stats 行都进日志缓冲（最多 200 行，带时间戳）
                stripped = _clean_log_line(line_str)
                if stripped:
                    ts = datetime.now().strftime("%H:%M:%S")
                    async with _stats_lock:
                        _log_buffer.append(f"[{ts}] {stripped}")
                        if len(_log_buffer) > 200:
                            _log_buffer = _log_buffer[-200:]
    except Exception:
        pass
    finally:
        async with _stats_lock:
            _stats["running"] = False
            # 记录历史
            save_history(_proc_module, {
                "status": "completed" if proc.returncode == 0 else "error",
                "total": _stats["total"], "added": _stats["added"],
                "elapsed": _stats["elapsed"], "exit_code": proc.returncode,
                "time": datetime.now().isoformat(),
                "complete": proc.returncode == 0 and _stats["total"] > 0 and _stats["added"] >= _stats["total"],
            })

@app.get("/api/learning/progress")
async def progress_stream():
    async def event_stream() -> AsyncIterator[str]:
        while True:
            async with _stats_lock:
                s = dict(_stats)
                recent_logs = list(_log_buffer[-30:])  # 最近 30 行
                recent_logs.reverse()  # 最新在前
            s["process_alive"] = _proc is not None and _proc.returncode is None
            # 恢复的进程
            if not s["process_alive"] and _proc_module:
                for ext in _find_external_cocoindex():
                    if ext["module"] == _proc_module and _get_proc_info(ext["pid"])["alive"]:
                        s["process_alive"] = True
                        s["running"] = True
                        break
            s["module"] = _proc_module
            if _proc is not None and _proc.returncode is not None:
                s["exit_code"] = _proc.returncode
            exts = _find_external_cocoindex()
            ext_list = []
            for ext in exts:
                if _proc is None or _proc.pid != ext["pid"]:
                    ext_list.append({**ext, **_get_proc_info(ext["pid"]), "source": "external"})
            s["external_processes"] = ext_list
            non_bsp = [e for e in ext_list if e["module"] != "BSP"]
            s["external_process"] = non_bsp[0] if non_bsp else (ext_list[0] if ext_list else None)
            # 自动接管外部进程
            if _proc is None and ext_list:
                main_ext = s["external_process"]
                if main_ext:
                    s["process_alive"] = True
                    s["running"] = True
                    s["module"] = main_ext["module"]
                    s["elapsed"] = main_ext["uptime_seconds"]
            s["log_lines"] = recent_logs
            # 从 Qdrant 获取每个模块的真实索引数
            qdrant_counts = await _get_module_index_counts()
            history = load_history()
            for mod_name, count in qdrant_counts.items():
                if mod_name in history:
                    h = history[mod_name]
                    h["added"] = count  # Qdrant chunk 数，纯展示
                    if h.get("status") in ("completed", "error", "stopped"):
                        h["complete"] = h["status"] == "completed"
                    else:
                        h["complete"] = None
                elif count > 0:
                    history[mod_name] = {"status": "indexed", "total": 0, "added": count,
                                         "elapsed": 0, "time": "", "complete": None}
            s["history"] = history
            yield f"data: {json.dumps(s)}\n\n"
            if not s["process_alive"] and not s["running"]:
                if not ext_list:
                    break
            await asyncio.sleep(1)
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/api/learning/gpu")
async def gpu_status():
    try:
        proc = await asyncio.create_subprocess_exec(
            "nvidia-smi",
            "--query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw",
            "--format=csv,noheader,nounits",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=5)
        parts = [p.strip() for p in stdout.decode().strip().split(",")]
        return {"gpu_util": parts[0] if len(parts) > 0 else "?",
                "mem_used": parts[1] if len(parts) > 1 else "?",
                "mem_total": parts[2] if len(parts) > 2 else "?",
                "temp": parts[3] if len(parts) > 3 else "?",
                "power": parts[4] if len(parts) > 4 else "?"}
    except Exception:
        return {"error": "nvidia-smi failed"}


# ── Proxy: 其他 /api/* → Koa hermes-studio ──────────────────────────────

# ── PID 持久化 ──────────────────────────────────────────────────────────
def _save_pid(pid: int, module: str) -> None:
    PID_FILE.write_text(json.dumps({"pid": pid, "module": module, "started_at": time.time()}))

def _clear_pid() -> None:
    if PID_FILE.exists():
        PID_FILE.unlink()

def _restore_process() -> bool:
    """启动时尝试恢复上次跟踪的进程."""
    global _proc, _proc_module, _stats
    if not PID_FILE.exists():
        return False
    try:
        data = json.loads(PID_FILE.read_text())
        pid = data["pid"]
        module = data["module"]
        os.kill(pid, 0)  # 检查进程是否存在
        _proc_module = module
        _stats["running"] = True
        print(f"[restore] 已恢复跟踪: {module} (PID {pid})")
        return True
    except (OSError, json.JSONDecodeError, KeyError):
        _clear_pid()
        return False

PROXY_PREFIXES = [
    "/api/",          # 大部分 hermes API
    "/api/hermes/",
    "/api-docs",
    "/socket.io/",    # WebSocket
    "/ws",
    "/mcp",
    "/.well-known",
]

@app.api_route("/api/{rest:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_api(request: Request, rest: str):
    """代理非学习 API 到 hermes-studio Koa 后端."""
    # 排除学习 API
    if rest.startswith("learning/"):
        raise HTTPException(404, "Use /api/learning/* instead")

    path = f"/api/{rest}"
    if request.url.query:
        path += f"?{request.url.query}"

    url = f"{HERMES_BACKEND}{path}"
    headers = {k: v for k, v in request.headers.items()
               if k.lower() not in ("host", "transfer-encoding")}
    body = await request.body()

    try:
        resp = await _http_client.request(
            method=request.method, url=url, headers=headers,
            content=body if body else None,
        )
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers={k: v for k, v in resp.headers.items()
                     if k.lower() not in ("transfer-encoding", "content-encoding")},
        )
    except httpx.ConnectError:
        raise HTTPException(502, "Hermes Studio 后端未启动。请先启动: hermes-web-ui start")


# ── SPA fallback: 非 API 路径返回 index.html ────────────────────────────
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """返回 hermes-studio 前端 (SPA)."""
    file_path = STATIC_DIR / full_path
    if full_path and file_path.is_file():
        return FileResponse(file_path)

    # SPA fallback
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        return HTMLResponse(
            "<h1>前端未构建</h1><p>请先构建 hermes-studio: cd hermes-studio && npm run build</p>",
            status_code=404)
    return HTMLResponse(index_path.read_text(encoding="utf-8"))


# ── Main ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if not CONFIG_FILE.exists():
        save_config(DEFAULT_CONFIG)
        print(f"[init] Created {CONFIG_FILE}")

    if not STATIC_DIR.exists():
        print("[warn] 前端静态文件目录不存在，请先复制 hermes-studio dist: "
              "cp -r /CM/work/hermes-studio/dist/client webui/static")

    host = sys.argv[1] if len(sys.argv) > 1 else "0.0.0.0"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8699
    _restore_process()
    print(f"  AOSP Learning Console → http://{host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="warning")
