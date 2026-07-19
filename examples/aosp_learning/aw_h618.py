"""
Allwinner H618 — AOSP code+wiki unified learning pipeline.

This file is self-contained for one platform.  To add MTK H618 (or another
chip), copy this file to ``mtk_h618.py``, change the constants and module
globs, and you're done — no other files need editing.

Usage::

    # Index (one module at a time — independent LMDB per module):
    cocoindex update aw_h618:aw_h618_bsp
    cocoindex update aw_h618:aw_h618_framework
    cocoindex update aw_h618:aw_h618_app

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
    app_main,
    query,
)

# ══════════════════════════════════════════════════════════════════════════
# Platform config — change these three for a new platform
# ══════════════════════════════════════════════════════════════════════════

PROJECT = "aw_h618"
AOSP_ROOT = pathlib.Path("/CM/work/h618/android12/H618-android-20230427-v1.1")
WIKI_ROOT = pathlib.Path("./aosp_wiki")

# ══════════════════════════════════════════════════════════════════════════
# Module definitions — which code directories belong to which module
# ══════════════════════════════════════════════════════════════════════════
# Overlapping patterns are fine — first match wins.
# If your platform has different directory layout, adjust code_globs here.

BSP = ModuleConfig(
    name="BSP",
    code_globs=["**/hardware/**", "**/device/**", "**/vendor/**", "**/longan/**"],
    wiki_dir="bsp",
    description="板级支持包：kernel驱动(H618 longan) + DTS + HAL + vendor配置",
)

FRAMEWORK = ModuleConfig(
    name="FRAMEWORK",
    code_globs=["**/frameworks/**", "**/system/**"],
    wiki_dir="framework",
    description="Android Framework层：system_server, JNI, 系统服务",
)

APP = ModuleConfig(
    name="APP",
    code_globs=["**/packages/**", "**/cts/**"],
    wiki_dir="app",
    description="应用层：Settings, Launcher, CTS测试",
)

# ══════════════════════════════════════════════════════════════════════════
# App definitions — each module is a separate App (independent LMDB)
# ══════════════════════════════════════════════════════════════════════════

_ALL_MODULES = [BSP, FRAMEWORK, APP]


def _app(mod: ModuleConfig, suffix: str) -> coco.App:
    return coco.App(
        coco.AppConfig(name=f"{PROJECT}_{suffix}"),
        app_main,
        aosp_root=AOSP_ROOT,
        wiki_root=WIKI_ROOT,
        project=PROJECT,
        module=mod,
    )


aw_h618_bsp = _app(BSP, "bsp")
aw_h618_framework = _app(FRAMEWORK, "framework")
aw_h618_app = _app(APP, "app")

# Alias — most common entry point
aw_h618 = aw_h618_bsp

# ══════════════════════════════════════════════════════════════════════════
# CLI: interactive hybrid search
# ══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(query(PROJECT))
