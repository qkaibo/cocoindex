"""
Schema-related helper types.

Currently this module contains helpers for connector schemas that need extra
out-of-band information beyond Python type annotations.
"""

from __future__ import annotations

import typing as _typing
import cocoindex as coco
import msgspec as _msgspec
import numpy as _np


@_typing.runtime_checkable
class VectorSchemaProvider(_typing.Protocol):
    """Additional information for a vector column."""

    def __coco_vector_schema__(self) -> _typing.Awaitable[VectorSchema]: ...


from cocoindex._internal.serde import unpickle_safe


class VectorSchema(_msgspec.Struct, frozen=True, tag=True):
    """Additional information for a vector column."""

    # dtype is stored as plain str (e.g. "float32"). Annotated as object so
    # msgspec invokes ext_hook when decoding LEGACY tracking records that
    # serialized a numpy dtype here (ext code 100 → normalized to str in
    # serde._ext_hook); new records encode the str natively.
    dtype: object
    size: int

    async def __coco_vector_schema__(self) -> VectorSchema:
        return self


unpickle_safe(VectorSchema)


async def get_vector_schema(obj: object) -> VectorSchema | None:
    """Helper function to get the vector schema from an object, if it provides one."""
    if isinstance(obj, coco.ContextKey):
        obj = coco.use_context(obj)
    if isinstance(obj, VectorSchemaProvider):
        return await obj.__coco_vector_schema__()
    return None


@_typing.runtime_checkable
class MultiVectorSchemaProvider(_typing.Protocol):
    """Additional information for a vector column."""

    def __coco_multi_vector_schema__(self) -> _typing.Awaitable[MultiVectorSchema]: ...


class MultiVectorSchema(_msgspec.Struct, frozen=True, tag=True):
    """Additional information for a vector column."""

    vector_schema: VectorSchema

    async def __coco_multi_vector_schema__(self) -> MultiVectorSchema:
        return self


unpickle_safe(MultiVectorSchema)


async def get_multi_vector_schema(obj: object) -> MultiVectorSchema | None:
    """Helper function to get the multi-vector schema from an object, if it provides one."""
    if isinstance(obj, coco.ContextKey):
        obj = coco.use_context(obj)
    if isinstance(obj, MultiVectorSchemaProvider):
        return await obj.__coco_multi_vector_schema__()
    return None


__all__ = [
    "MultiVectorSchema",
    "MultiVectorSchemaProvider",
    "VectorSchema",
    "VectorSchemaProvider",
    "get_multi_vector_schema",
    "get_vector_schema",
]
