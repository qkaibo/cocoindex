"""
QCM4490 (Qualcomm) — AOSP code+wiki unified learning pipeline.

Usage:
    # Index via CocoIndex CLI:
    cocoindex update qcm4490:qcm4490_bsp       # ~130K files (kernel_platform + hardware + vendor)
    cocoindex update qcm4490:qcm4490_amss      # ~161K files (amss, exclude build)

    # Search:
    python qcm4490.py "MIPI DSI lane config"
    python qcm4490.py -m BSP "gpio pinctrl"
    python qcm4490.py -m AMSS "audio DSP init"
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
_cfg = _platforms["qcm4490"]

PROJECT = "qcm4490"
AOSP_ROOT = pathlib.Path(_cfg["aosp_root"])
WIKI_ROOT = pathlib.Path(_cfg["wiki_root"])

# ── App definitions (one per module, independent LMDB) ──────────────────

_modules = {m["name"]: ModuleConfig(**m) for m in _cfg["modules"]}

qcm4490_bsp = make_app(PROJECT, AOSP_ROOT, WIKI_ROOT, _modules["BSP"])

# Alias — default to BSP
qcm4490 = qcm4490_bsp

# ── CLI: interactive hybrid search ──────────────────────────────────────

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(query(PROJECT))
