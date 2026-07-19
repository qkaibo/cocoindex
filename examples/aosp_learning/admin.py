"""
AOSP 学习平台管理界面

启动::

    ~/.local/share/uv/tools/prefect/bin/python -m uvicorn admin:app --host 0.0.0.0 --port 8501

然后浏览器打开 http://<ip>:8501

功能:
  - 查看/新增/删除 芯片平台
  - 一键触发 Prefect flow 开始索引
  - 查看最近运行记录
"""

from __future__ import annotations

import asyncio
import pathlib
from datetime import datetime, timezone
from typing import Any

import yaml
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from prefect.client.orchestration import get_client
from prefect.client.schemas.filters import FlowFilter, FlowRunFilter

CONFIG_FILE = pathlib.Path(__file__).resolve().parent / "platforms.yaml"

app = FastAPI(title="AOSP 学习平台管理")


# ── YAML helpers ──────────────────────────────────────────────────────────

def load_config() -> dict[str, Any]:
    with open(CONFIG_FILE) as f:
        return yaml.safe_load(f)


def save_config(data: dict[str, Any]) -> None:
    with open(CONFIG_FILE, "w") as f:
        yaml.safe_dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)


# ── Prefect helpers ───────────────────────────────────────────────────────


async def _trigger(flow_name: str, params: dict) -> str | None:
    async with get_client() as client:
        flows = await client.read_flows(FlowFilter(name={"any_": [flow_name]}))
        if not flows:
            return None
        run = await client.create_flow_run_from_flow_id(flows[0].id, parameters=params)
        return str(run.id)


async def _recent_runs(limit: int = 20) -> list[dict]:
    async with get_client() as client:
        runs = await client.read_flow_runs(
            flow_run_filter=FlowRunFilter(), limit=limit, sort="-created",
        )
        return [r.model_dump() for r in runs]


# ── HTML template ─────────────────────────────────────────────────────────

PAGE = """<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AOSP 学习平台管理</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; }
  .container { max-width: 960px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; margin-bottom: 24px; }
  h2 { font-size: 18px; margin: 24px 0 12px; }
  .card { background: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .card h3 { font-size: 16px; margin-bottom: 8px; color: #1a73e8; }
  .meta { font-size: 13px; color: #666; margin-bottom: 4px; }
  .tag { display: inline-block; background: #e8f0fe; color: #1a73e8; border-radius: 4px; padding: 2px 8px; font-size: 12px; margin: 2px 4px 2px 0; }
  .btn { display: inline-block; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; text-decoration: none; }
  .btn-primary { background: #1a73e8; color: #fff; }
  .btn-danger { background: #fff; color: #d93025; border: 1px solid #d93025; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  form.inline { display: inline; }
  input, textarea { width: 100%; padding: 8px 12px; border: 1px solid #dadce0; border-radius: 6px; font-size: 14px; margin-bottom: 8px; }
  textarea { font-family: monospace; font-size: 12px; resize: vertical; }
  label { font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px; color: #555; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
  .status-COMPLETED { background: #34a853; }
  .status-RUNNING { background: #1a73e8; }
  .status-FAILED { background: #d93025; }
  .status-PENDING { background: #fbbc04; }
  .flash { padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
  .flash-success { background: #e6f4ea; color: #137333; }
  .flash-error { background: #fce8e6; color: #c5221f; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 24px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e0e0e0; }
  th { font-weight: 600; color: #555; }
  .section-actions { margin: 12px 0; display: flex; gap: 8px; align-items: center; }
  select { padding: 6px 10px; border: 1px solid #dadce0; border-radius: 6px; font-size: 14px; }
  .empty { color: #999; font-style: italic; padding: 20px 0; }
</style>
</head>
<body>
<div class="container">
  <h1>AOSP 芯片平台管理</h1>

  {flash}

  <!-- 平台列表 -->
  <h2>已配置的芯片平台</h2>
  {platforms_html}

  <hr>

  <!-- 触发索引 -->
  <h2>触发索引</h2>
  <div class="card">
    <form method="post" action="/trigger">
      <div class="section-actions">
        <select name="project" required>
          <option value="">选择平台...</option>
          {project_options}
        </select>
        <select name="module" required>
          <option value="">选择模块...</option>
          {module_options}
        </select>
        <button type="submit" class="btn btn-primary">开始索引</button>
      </div>
    </form>
  </div>

  <hr>

  <!-- 新增平台 -->
  <h2>新增芯片平台</h2>
  <div class="card">
    <form method="post" action="/add">
      <label>项目名</label>
      <input name="project" placeholder="如 mtk_h618" required>
      <label>AOSP 源码根路径</label>
      <input name="aosp_root" placeholder="/path/to/aosp" required>
      <label>Wiki 根路径</label>
      <input name="wiki_root" placeholder="./aosp_wiki_mtk" required>

      <h3 style="margin: 16px 0 8px;">模块定义</h3>
      <div class="form-grid">
        <div>
          <label>BSP code_globs</label>
          <textarea name="bsp_globs" rows="4">**/hardware/**&#10;**/device/**&#10;**/vendor/**&#10;**/kernel/**</textarea>
        </div>
        <div>
          <label>FRAMEWORK code_globs</label>
          <textarea name="fw_globs" rows="4">**/frameworks/**&#10;**/system/**</textarea>
        </div>
        <div>
          <label>APP code_globs</label>
          <textarea name="app_globs" rows="4">**/packages/**&#10;**/cts/**</textarea>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:12px;">创建平台</button>
    </form>
  </div>

  <hr>

  <!-- 运行记录 -->
  <h2>
    最近运行记录
    <a href="/" class="btn btn-sm" style="margin-left:12px;">刷新</a>
  </h2>
  {runs_html}
</div>
</body>
</html>"""


def _platforms_html(platforms: dict) -> str:
    if not platforms:
        return '<div class="empty">暂无平台，在下方新增</div>'
    parts = []
    for name, cfg in platforms.items():
        mod_tags = " ".join(
            f'<span class="tag">{m["name"]}</span>' for m in cfg.get("modules", [])
        )
        parts.append(f"""<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div>
      <h3>{name}</h3>
      <div class="meta">源码: {cfg['aosp_root']}</div>
      <div class="meta">Wiki: {cfg['wiki_root']}</div>
      <div style="margin-top:6px;">{mod_tags}</div>
    </div>
    <form method="post" action="/delete" class="inline" onsubmit="return confirm('确认删除 {name}？此操作不可恢复。')">
      <input type="hidden" name="project" value="{name}">
      <button type="submit" class="btn btn-danger btn-sm">删除</button>
    </form>
  </div>
</div>""")
    return "\n".join(parts)


def _project_options(platforms: dict) -> str:
    return "\n".join(
        f'<option value="{n}">{n}</option>' for n in platforms
    )


def _module_options(platforms: dict) -> str:
    parts = []
    for name, cfg in platforms.items():
        parts.append(f'<optgroup label="{name}">')
        for m in cfg.get("modules", []):
            parts.append(f'<option value="{name}/{m["name"]}">{m["name"]}</option>')
        parts.append('</optgroup>')
    return "\n".join(parts)


def _runs_html(runs: list[dict]) -> str:
    if not runs:
        return '<div class="empty">暂无运行记录</div>'
    rows = []
    for r in runs:
        state = r.get("state", {})
        stype = state.get("type", "UNKNOWN")
        sname = state.get("name", stype)
        created = r.get("created", "")
        if created:
            dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
            ts = dt.astimezone(timezone.utc).strftime("%m-%d %H:%M")
        else:
            ts = "?"
        params = r.get("parameters", {})
        proj = params.get("project", "?")
        mod = params.get("module_name", params.get("module", "?"))
        rows.append(
            f'<tr><td><span class="status-dot status-{stype}"></span>{sname}</td>'
            f'<td>{proj} / {mod}</td><td>{ts}</td></tr>'
        )
    return f"<table><thead><tr><th>状态</th><th>目标</th><th>时间</th></tr></thead><tbody>{''.join(rows)}</tbody></table>"


# ── Routes ─────────────────────────────────────────────────────────────────


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> str:
    config = load_config()
    platforms = config.get("platforms", {})

    flash = request.query_params.get("flash", "")
    flash_html = ""
    if flash:
        flash_html = f'<div class="flash flash-success">{flash}</div>'

    try:
        runs = await _recent_runs(20)
    except Exception:
        runs = []

    return PAGE.replace("{flash}", flash_html).replace("{platforms_html}", _platforms_html(platforms)).replace("{project_options}", _project_options(platforms)).replace("{module_options}", _module_options(platforms)).replace("{runs_html}", _runs_html(runs))


@app.post("/add")
async def add_platform(
    project: str = Form(...),
    aosp_root: str = Form(...),
    wiki_root: str = Form(...),
    bsp_globs: str = Form(""),
    fw_globs: str = Form(""),
    app_globs: str = Form(""),
) -> RedirectResponse:
    config = load_config()
    platforms = config.get("platforms", {})

    if project in platforms:
        return RedirectResponse("/?flash=项目已存在", status_code=303)

    modules = []
    for name, globs_text in [("BSP", bsp_globs), ("FRAMEWORK", fw_globs), ("APP", app_globs)]:
        globs = [g.strip() for g in globs_text.strip().split("\n") if g.strip()]
        if globs:
            modules.append({
                "name": name,
                "code_globs": globs,
                "wiki_dir": name.lower(),
                "description": "",
            })

    platforms[project] = {
        "aosp_root": aosp_root,
        "wiki_root": wiki_root,
        "modules": modules,
    }
    config["platforms"] = platforms
    save_config(config)
    return RedirectResponse(f"/?flash=平台 {project} 已创建", status_code=303)


@app.post("/delete")
async def delete_platform(project: str = Form(...)) -> RedirectResponse:
    config = load_config()
    platforms = config.get("platforms", {})
    platforms.pop(project, None)
    config["platforms"] = platforms
    save_config(config)
    return RedirectResponse(f"/?flash=平台 {project} 已删除", status_code=303)


@app.post("/trigger")
async def trigger_index(
    project: str = Form(...),
    module: str = Form(...),
) -> RedirectResponse:
    if "/" in module:
        project, module_name = module.split("/", 1)
    else:
        module_name = module

    flow_name = "index-platform" if module_name == "(全部模块)" else "index-module"
    params = {"project": project}
    if module_name != "(全部模块)":
        params["module_name"] = module_name

    run_id = await _trigger(flow_name, params)
    if run_id:
        flash = f"已触发 {project}/{module_name} (Flow Run: {run_id[:8]}...)"
    else:
        flash = f"Flow 未找到，请先启动 Prefect server"

    return RedirectResponse(f"/?flash={flash}", status_code=303)
