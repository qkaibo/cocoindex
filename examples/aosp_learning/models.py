"""
Data models for the AOSP code+wiki unified learning pipeline.

Two kinds of chunks go into the same LanceDB table:
  - CodeChunkMeta: extracted from source files (.c/.h/.java/.dts/.dtsi)
  - WikiChunkMeta: extracted from wiki files (.md/.rst/.txt)

Both carry the same embedding dimension, so a single vector search returns
mixed code+wiki results ranked by semantic similarity.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import pydantic


# ── Chunk type discriminant (used in Qdrant payload) ────────────────────

CHUNK_TYPES = Literal["code", "wiki"]


# ── LLM extraction schemas (Pydantic, for instructor) ──────────────────


class CodeEntity(pydantic.BaseModel):
    """
    A significant code element extracted by LLM for cross-referencing.
    For C/Java: function / struct / class.
    For DTS: node label, compatible string, key property values.
    """

    name: str = pydantic.Field(description="Function / struct / DTS node name.")
    kind: str = pydantic.Field(
        description="One of: function, struct, class, dts_node, macro, config_key."
    )
    summary: str = pydantic.Field(
        description="One-line summary of what this entity does in plain language."
    )
    related_concepts: list[str] = pydantic.Field(
        default_factory=list,
        description="Wiki-style concept keywords this code relates to "
        "(e.g. 'MIPI DSI', 'panel init sequence', 'GPIO pinctrl').",
    )


class CodeExtraction(pydantic.BaseModel):
    """LLM structured output for a single code file."""

    entities: list[CodeEntity] = pydantic.Field(default_factory=list)
    file_summary: str = pydantic.Field(
        default="",
        description="One-paragraph summary of what this file does.",
    )


class WikiConcept(pydantic.BaseModel):
    """A concept extracted from wiki documentation."""

    name: str = pydantic.Field(description="The concept name, e.g. 'MIPI DSI'.")
    description: str = pydantic.Field(
        description="Concise explanation of the concept."
    )
    code_references: list[str] = pydantic.Field(
        default_factory=list,
        description="Expected file paths or function names in the codebase "
        "that implement or configure this concept.",
    )


class WikiExtraction(pydantic.BaseModel):
    """LLM structured output for a single wiki page."""

    concepts: list[WikiConcept] = pydantic.Field(default_factory=list)
    page_summary: str = pydantic.Field(
        default="",
        description="One-paragraph summary of this wiki page.",
    )


# ── Module configuration ─────────────────────────────────────────────────


@dataclass
class ModuleConfig:
    """Defines a learning module — a conceptual scope that spans many directories.

    Example — BSP 模块:
        ModuleConfig(
            name="BSP",
            code_globs=["**/kernel/**", "**/hardware/**", "**/device/**", "**/vendor/**"],
            wiki_dir="bsp_wiki",
            description="板级支持包：kernel 驱动 + DTS + HAL + vendor 配置",
        )
    """

    name: str
    """Module tag stored in each chunk, e.g. ``"BSP"``."""

    code_globs: list[str]
    """Glob patterns matching source files belonging to this module.
    Overlapping patterns are fine — the first match wins."""

    wiki_dir: str
    """Sub-directory under ``wiki_dir`` containing this module's wiki/docs."""

    description: str = ""


# Predefined module configurations — edit these for your AOSP layout.
MODULES: list[ModuleConfig] = [
    ModuleConfig(
        name="BSP",
        code_globs=["**/hardware/**", "**/device/**", "**/vendor/**", "**/longan/**"],
        wiki_dir="bsp",
        description="板级支持包：kernel驱动(H618 longan) + DTS + HAL + vendor配置",
    ),
    ModuleConfig(
        name="FRAMEWORK",
        code_globs=["**/frameworks/**", "**/system/**"],
        wiki_dir="framework",
        description="Android Framework层：system_server, JNI, 系统服务",
    ),
    ModuleConfig(
        name="APP",
        code_globs=["**/packages/**", "**/cts/**"],
        wiki_dir="app",
        description="应用层：Settings, Launcher, CTS测试",
    ),
]
"""
Predefined learning modules. Each module maps glob patterns to code directories
and a sub-directory for associated wiki/docs.

To focus on one module today, set the COCOINDEX_MODULE env var or use
``cocoindex update main -p module=BSP`` (if supported).
"""
