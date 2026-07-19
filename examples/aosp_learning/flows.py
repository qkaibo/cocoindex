"""
Prefect flows for AOSP code+wiki indexing pipeline.

Start the Prefect server (remote dev — accessible from LAN)::

    prefect config set PREFECT_SERVER_API_HOST=<your-ip>
    prefect config set PREFECT_API_URL=http://<your-ip>:4200/api
    prefect server start

Then open http://<your-ip>:4200 — you can trigger flows, watch progress,
and view run history from the dashboard.

The ``index_module`` and ``index_platform`` flows are auto-discovered by
Prefect.  You can also trigger them via CLI::

    python flows.py index-module --project aw_h618 --module-name BSP
"""

from __future__ import annotations

import pathlib
from typing import Any

from prefect import flow

from pipeline import (
    ModuleConfig,
    load_platforms,
    make_app,
)


def _resolve_platform_config(
    project: str,
    config_path: str | None = None,
) -> tuple[pathlib.Path, pathlib.Path, list[dict[str, Any]]]:
    """Load platform config and resolve paths."""
    platforms = load_platforms(
        pathlib.Path(config_path) if config_path else None,
    )
    if project not in platforms:
        available = ", ".join(platforms)
        raise ValueError(
            f"Unknown project '{project}'. Available: {available}"
        )
    cfg = platforms[project]
    aosp_root = pathlib.Path(cfg["aosp_root"]).resolve()
    wiki_root = pathlib.Path(cfg["wiki_root"]).resolve()
    modules = cfg["modules"]
    return aosp_root, wiki_root, modules


@flow(name="index-module", log_prints=True)
async def index_module(
    project: str,
    module_name: str,
    config_path: str | None = None,
) -> None:
    """Index a single module for a platform.

    Parameters
    ----------
    project : str
        Platform project name, e.g. ``"aw_h618"``.
    module_name : str
        Module to index, e.g. ``"BSP"``, ``"FRAMEWORK"``, ``"APP"``.
    config_path : str | None
        Path to ``platforms.yaml``.  Defaults to the one next to ``pipeline.py``.
    """
    aosp_root, wiki_root, modules = _resolve_platform_config(project, config_path)

    mod_cfg = next(
        (m for m in modules if m["name"] == module_name),
        None,
    )
    if mod_cfg is None:
        available = ", ".join(m["name"] for m in modules)
        raise ValueError(
            f"Unknown module '{module_name}' for project '{project}'. "
            f"Available: {available}"
        )

    mod = ModuleConfig(**mod_cfg)
    app = make_app(project, aosp_root, wiki_root, mod)

    print(f"[{project}/{module_name}] Indexing started")
    await app.update()
    print(f"[{project}/{module_name}] Indexing complete")


@flow(name="index-platform", log_prints=True)
async def index_platform(
    project: str,
    config_path: str | None = None,
) -> None:
    """Index all modules for a platform, one after another.

    Each module runs as an independent CocoIndex App with its own LMDB,
    so a crash in one module does not affect the others.
    """
    aosp_root, wiki_root, modules = _resolve_platform_config(project, config_path)

    for mod_cfg in modules:
        mod = ModuleConfig(**mod_cfg)
        app = make_app(project, aosp_root, wiki_root, mod)

        print(f"[{project}/{mod.name}] Indexing started")
        await app.update()
        print(f"[{project}/{mod.name}] Indexing complete")

    print(f"[{project}] All modules indexed")


@flow(name="list-platforms", log_prints=True)
async def list_platforms(
    config_path: str | None = None,
) -> dict[str, Any]:
    """List all configured platforms and their modules."""
    platforms = load_platforms(
        pathlib.Path(config_path) if config_path else None,
    )
    for name, cfg in platforms.items():
        modules = [m["name"] for m in cfg["modules"]]
        print(f"  {name}: {', '.join(modules)}")
        print(f"    aosp_root: {cfg['aosp_root']}")
        print(f"    wiki_root: {cfg['wiki_root']}")
    return platforms
