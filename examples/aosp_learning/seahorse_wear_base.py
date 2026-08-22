"""
Seahorse_wear-base — 穿戴设备固件(RTOS)统一学习管道入口。

与 qcm4490(AOSP)完全独立: 独立 collection、独立 LMDB、独立入口。

Usage:
    # Index via CocoIndex CLI:
    cocoindex update seahorse_wear_base:seahorse_wear_base_fw

    # Search:
    python seahorse_wear_base.py "蓝牙连接状态机"
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
_cfg = _platforms["seahorse_wear_base"]

PROJECT = "seahorse_wear_base"
AOSP_ROOT = pathlib.Path(_cfg["aosp_root"])
WIKI_ROOT = pathlib.Path(_cfg["wiki_root"])

# ── App definitions (one per module, independent LMDB) ──────────────────

_modules = {m["name"]: ModuleConfig(**m) for m in _cfg["modules"]}

seahorse_wear_base_fw = make_app(PROJECT, AOSP_ROOT, WIKI_ROOT, _modules["FW"])

# Alias — default to FW
seahorse_wear_base = seahorse_wear_base_fw

# ── CLI: interactive hybrid search ──────────────────────────────────────

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(query(PROJECT))
