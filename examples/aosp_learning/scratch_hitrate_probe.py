#!/usr/bin/env python3
"""Standalone hit-rate probe for aosp_qcm4490.

Does NOT import or modify mcp_server.py / pipeline.py.
Creates its own retrieval variants and prints Hit@1 / Hit@10 / Recall@10.

Usage:
  /home/ts/.hermes/hermes-agent/venv/bin/python scratch_hitrate_probe.py
  /home/ts/.hermes/hermes-agent/venv/bin/python scratch_hitrate_probe.py --gt scratch_hitrate_probe_gt20.json
  /home/ts/.hermes/hermes-agent/venv/bin/python scratch_hitrate_probe.py --gt scratch_hitrate_probe_gt107.json --variants baseline,filtered
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")

from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

HERE = Path(__file__).resolve().parent
DEFAULT_GT = HERE / "scratch_hitrate_probe_gt20.json"
COLLECTION = "aosp_qcm4490"
EMBED_MODEL = "BAAI/bge-m3"
TOP_K = 10
# pull a wider pool so post-filters still have candidates
POOL = 40

# Path denylist: known cross-vendor / dead-driver noise for qcm4490 probe.
# This is experimental only — not wired into production MCP.
NOISE_PATH_SUBSTR = (
    "/drivers/gpu/drm/i915/",
    "/drivers/gpu/drm/tegra/",
    "/drivers/gpu/drm/amd/",
    "/drivers/gpu/drm/nouveau/",
    "/drivers/staging/media/atomisp/",
    "/drivers/mfd/ab8500",
    "/vendor/nxp/",
    "/vendor/stm/",
    "/hardware/nxp/",
    "/hardware/st/",
    "/hardware/samsung/",
    "/mediatek/",
    "/mtk_",
    "/drivers/power/supply/mtk",
)


@dataclass
class Metrics:
    hit1: float
    hit10: float
    recall10: float
    n: int


def _basename_set(paths: list[str]) -> set[str]:
    return {Path(p).name for p in paths if p}


def hit_at_k(retrieved_basenames: list[str], gt_basenames: set[str], k: int) -> float:
    if not gt_basenames:
        return 0.0
    return 1.0 if gt_basenames & set(retrieved_basenames[:k]) else 0.0


def recall_at_k(retrieved_basenames: list[str], gt_basenames: set[str], k: int) -> float:
    if not gt_basenames:
        return 0.0
    got = gt_basenames & set(retrieved_basenames[:k])
    return len(got) / len(gt_basenames)


def is_noise_path(file_path: str) -> bool:
    p = file_path.replace("\\", "/")
    return any(s in p for s in NOISE_PATH_SUBSTR)


def extract_symbols(query: str) -> list[str]:
    """Cheap identifier harvest for optional path boost (no LLM)."""
    toks = re.findall(r"\b[A-Za-z_][A-Za-z0-9_]{3,}\b", query)
    stop = {
        "this",
        "that",
        "with",
        "from",
        "kernel",
        "where",
        "what",
        "which",
        "project",
        "logic",
        "power",
        "supply",
        "battery",
        "charger",
        "display",
        "panel",
        "config",
        "message",
        "定义",
    }
    out: list[str] = []
    seen: set[str] = set()
    for t in toks:
        tl = t.lower()
        if tl in stop or tl in seen:
            continue
        seen.add(tl)
        out.append(t)
    return out[:8]


class ProbeRetriever:
    def __init__(self, qdrant_url: str = "http://localhost:6333") -> None:
        self.client = QdrantClient(qdrant_url, prefer_grpc=True, check_compatibility=False)
        print(f"[probe] loading {EMBED_MODEL} ...", flush=True)
        t0 = time.time()
        self.model = SentenceTransformer(EMBED_MODEL, device="cuda")
        self.model.half()
        self.tok = AutoTokenizer.from_pretrained(EMBED_MODEL)
        print(f"[probe] model ready in {time.time() - t0:.1f}s", flush=True)

    def _sparse(self, query: str) -> tuple[list[int], list[float]]:
        ids = self.tok.encode(query, add_special_tokens=False)
        uniq: list[int] = []
        seen: set[int] = set()
        for tid in ids:
            if tid not in seen:
                seen.add(tid)
                uniq.append(tid)
        return uniq, [1.0] * len(uniq)

    def search_pool(self, query: str, limit: int = POOL) -> list[dict]:
        qvec = self.model.encode(query, convert_to_numpy=True, normalize_embeddings=True)
        s_idx, s_val = self._sparse(query)
        resp = self.client.query_points(
            collection_name=COLLECTION,
            prefetch=[
                qm.Prefetch(query=qvec.tolist(), using="dense", limit=limit * 3),
                qm.Prefetch(
                    query=qm.SparseVector(indices=s_idx, values=s_val),
                    using="sparse",
                    limit=limit * 3,
                ),
            ],
            query=qm.FusionQuery(fusion=qm.Fusion.RRF),
            limit=limit,
        )
        rows: list[dict] = []
        for p in resp.points:
            payload = p.payload or {}
            rows.append(
                {
                    "score": float(p.score or 0.0),
                    "file_path": str(payload.get("file_path") or ""),
                    "title": str(payload.get("title") or ""),
                    "content": str(payload.get("content") or "")[:240],
                }
            )
        return rows

    def variant_baseline(self, pool: list[dict]) -> list[str]:
        """Production-like: RRF order, file basename unique."""
        out: list[str] = []
        seen: set[str] = set()
        for r in pool:
            bn = Path(r["file_path"]).name
            if not bn or bn in seen:
                continue
            seen.add(bn)
            out.append(bn)
            if len(out) >= TOP_K:
                break
        return out

    def variant_filtered(self, pool: list[dict]) -> list[str]:
        """Drop known noise paths, then unique basenames."""
        kept = [r for r in pool if r["file_path"] and not is_noise_path(r["file_path"])]
        # if filter emptied too much, fall back
        if len(kept) < TOP_K:
            kept = pool
        return self.variant_baseline(kept)

    def variant_filtered_symbol_boost(self, query: str, pool: list[dict]) -> list[str]:
        """Filter noise, then prefer paths containing query identifiers."""
        syms = [s.lower() for s in extract_symbols(query)]
        kept = [r for r in pool if r["file_path"] and not is_noise_path(r["file_path"])]
        if len(kept) < TOP_K:
            kept = list(pool)

        def boost(r: dict) -> tuple[int, float]:
            path = r["file_path"].lower()
            hit = sum(1 for s in syms if s in path)
            return (-hit, -r["score"])

        kept = sorted(kept, key=boost)
        return self.variant_baseline(kept)


def evaluate(retriever: ProbeRetriever, questions: list[dict], variants: list[str]) -> None:
    aggregates: dict[str, list[tuple[float, float, float]]] = {v: [] for v in variants}

    for i, item in enumerate(questions, 1):
        qid = item["id"]
        query = item["question"]
        gt = set(item.get("gt_basenames") or _basename_set(item.get("gt_files") or []))
        if not gt:
            print(f"  skip {qid}: empty GT")
            continue

        t0 = time.time()
        pool = retriever.search_pool(query, limit=POOL)
        dt = time.time() - t0

        print(f"\n[{i}/{len(questions)}] {qid}  ({dt:.2f}s)  GT={sorted(gt)}")
        print(f"  Q: {query[:80]}")

        for v in variants:
            if v == "baseline":
                got = retriever.variant_baseline(pool)
            elif v == "filtered":
                got = retriever.variant_filtered(pool)
            elif v == "filtered_symbol":
                got = retriever.variant_filtered_symbol_boost(query, pool)
            else:
                raise SystemExit(f"unknown variant: {v}")

            h1 = hit_at_k(got, gt, 1)
            h10 = hit_at_k(got, gt, 10)
            r10 = recall_at_k(got, gt, 10)
            aggregates[v].append((h1, h10, r10))
            mark = "OK" if h10 else "MISS"
            print(f"  {v:18s} Hit@1={h1:.0f} Hit@10={h10:.0f} Recall@10={r10:.2f} [{mark}] -> {got[:5]}")

    print("\n" + "=" * 72)
    print("SUMMARY")
    print("=" * 72)
    for v, rows in aggregates.items():
        if not rows:
            continue
        n = len(rows)
        m = Metrics(
            hit1=sum(x[0] for x in rows) / n,
            hit10=sum(x[1] for x in rows) / n,
            recall10=sum(x[2] for x in rows) / n,
            n=n,
        )
        print(
            f"{v:18s}  n={m.n:3d}  "
            f"Hit@1={m.hit1:.3f}  Hit@10={m.hit10:.3f}  Recall@10={m.recall10:.3f}"
        )


def main() -> None:
    ap = argparse.ArgumentParser(description="Standalone AOSP hit-rate probe (does not touch MCP).")
    ap.add_argument("--gt", type=Path, default=DEFAULT_GT, help="GT json path")
    ap.add_argument(
        "--variants",
        default="baseline,filtered,filtered_symbol",
        help="comma list: baseline,filtered,filtered_symbol",
    )
    ap.add_argument("--qdrant", default=os.environ.get("QDRANT_URL", "http://localhost:6333"))
    ap.add_argument("--limit-questions", type=int, default=0, help="0=all in gt file")
    args = ap.parse_args()

    questions = json.loads(args.gt.read_text(encoding="utf-8"))
    if args.limit_questions > 0:
        questions = questions[: args.limit_questions]
    variants = [v.strip() for v in args.variants.split(",") if v.strip()]

    print(f"[probe] gt={args.gt} questions={len(questions)} variants={variants}")
    print(f"[probe] collection={COLLECTION} top_k={TOP_K} pool={POOL}")
    retriever = ProbeRetriever(args.qdrant)
    evaluate(retriever, questions, variants)


if __name__ == "__main__":
    main()
