"""
Allwinner H618 — AOSP code+wiki unified learning pipeline.

This file provides CocoIndex CLI-compatible App definitions.  All platform
configuration lives in ``platforms.yaml``, so adding a new chip means
editing YAML, not Python.

Usage::

    # Index via CocoIndex CLI (backward-compatible):
    cocoindex update aw_h618:aw_h618_bsp
    cocoindex update aw_h618:aw_h618_framework
    cocoindex update aw_h618:aw_h618_app

    # Index via Prefect Web UI (recommended):
    prefect server start        # → http://localhost:4200

    # Search:
    python aw_h618.py "MIPI DSI lane config"
    python aw_h618.py --module BSP "gpio pinctrl"
"""

from __future__ import annotations

import asyncio
import pathlib

import cocoindex as coco
from dotenv import load_dotenv

from pipeline import (
    ModuleConfig,
    load_platforms,
    make_app,
    query,
)

# ── Load from platforms.yaml ────────────────────────────────────────────

_platforms = load_platforms()
_cfg = _platforms["aw_h618"]

PROJECT = "aw_h618"
AOSP_ROOT = pathlib.Path(_cfg["aosp_root"])
WIKI_ROOT = pathlib.Path(_cfg["wiki_root"])

# ── App definitions (for CocoIndex CLI compatibility) ───────────────────

_modules = {m["name"]: ModuleConfig(**m) for m in _cfg["modules"]}

aw_h618_bsp = make_app(PROJECT, AOSP_ROOT, WIKI_ROOT, _modules["BSP"])
aw_h618_framework = make_app(PROJECT, AOSP_ROOT, WIKI_ROOT, _modules["FRAMEWORK"])
aw_h618_app = make_app(PROJECT, AOSP_ROOT, WIKI_ROOT, _modules["APP"])

# Alias — most common entry point
aw_h618 = aw_h618_bsp

# ── CLI: interactive hybrid search ──────────────────────────────────────

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(query(PROJECT))
