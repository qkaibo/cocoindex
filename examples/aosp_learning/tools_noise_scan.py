#!/usr/bin/env python3
"""噪音治理 L2: .config × Kconfig → 文件有效性清单
机制: CONFIG 符号状态(=/y/m 有效; not set/未出现 无效)
      × Kconfig 树(config XXX 声明位置 = 该符号控制的目录)
      → 目录下驱动文件有效性判定
输出: labels.json {file_path: valid/invalid} + 统计
"""
import os, re, json, sys
from collections import Counter, defaultdict

CONFIG_FILE = "/home/ts/.hermes/cache/documents/doc_4654a45ce726_.config"
KERNEL = "/home/ts/ssd/workspace/code/qcm4490/target/kernel_platform/common"
OUT = "/tmp/noise_labels.json"

# ── 1. 解析 .config ──────────────────────────────────────────────
sym_status = {}   # CONFIG_X -> "y" | "m" | "n"
with open(CONFIG_FILE, errors="replace") as f:
    for line in f:
        line = line.strip()
        if line.startswith("CONFIG_") and "=" in line:
            k, _, v = line.partition("=")
            if v in ("y", "m", "n"):
                sym_status[k] = v
        elif line.startswith("# CONFIG_") and line.endswith(" is not set"):
            sym_status[line[2:].replace(" is not set", "")] = "n"

# ── 2. Kconfig 树: config 声明 → 所在目录 ─────────────────────────
sym_dir = {}      # CONFIG_X -> dir(相对 msm-kernel)
config_re = re.compile(r"^\s*(?:menu)?config\s+([A-Za-z0-9_]+)\s*$")
n_kconfig = 0
for root, dirs, files in os.walk(KERNEL):
    for fn in files:
        if fn.startswith("Kconfig"):
            n_kconfig += 1
            path = os.path.join(root, fn)
            rel_dir = os.path.relpath(os.path.dirname(path), KERNEL)
            try:
                with open(path, errors="replace") as f:
                    for line in f:
                        m = config_re.match(line)
                        if m:
                            sym_dir["CONFIG_" + m.group(1)] = rel_dir
            except Exception:
                pass

# ── 3. 符号状态统计 ──────────────────────────────────────────────
valid = {k for k, v in sym_status.items() if v in ("y", "m")}
invalid = {k for k, v in sym_status.items() if v == "n"}
# 未出现符号(在 Kconfig 树里有声明但 .config 无条目) = 无效
declared = set(sym_dir.keys())
absent = declared - set(sym_status.keys())

print(f".config 符号: {len(sym_status)} (y/m 有效 {len(valid)}, not-set {len(invalid)})")
print(f"Kconfig 文件: {n_kconfig}, config 声明符号: {len(sym_dir)}")
print(f"Kconfig 声明但 .config 未出现(含平台 fragment 未叠): {len(absent)}")

# ── 4. 目录有效性: Kconfig 声明符号全无效 → 目录无效 ─────────────
dir_syms = defaultdict(list)
for s, d in sym_dir.items():
    dir_syms[d].append(s)

def dir_status(d: str) -> str:
    """目录有效 = 有任一 y/m 符号; 无效 = 全部 not-set/absent; unknown = 无符号声明"""
    syms = dir_syms.get(d, [])
    if not syms:
        return "unknown"
    if any(s in valid for s in syms):
        return "valid"
    return "invalid"

dir_stat = Counter()
for d in dir_syms:
    dir_stat[dir_status(d)] += 1
print(f"\n目录级判定: {dict(dir_stat)}")

# ── 5. 驱动文件归属 & 有效性(作用域: 仅 common 上游内核) ──────────
# 方案文档: N2/N3 defconfig 判定只针对 kernel_platform/common(上游 Linux)
# msm-kernel(高通内核)/ vendor / amss 不在此判定范围(平台符号需 fragment 叠加)
code_exts = {".c", ".h", ".S"}
file_label = {}       # rel path -> valid/invalid/unknown
noise_dirs = []
for d, syms in dir_syms.items():
    st = dir_status(d)
    if st == "invalid":
        noise_dirs.append(d)

COMMON = os.path.join(KERNEL.replace("msm-kernel", "common"), "drivers")
if not os.path.isdir(COMMON):
    COMMON = os.path.join(KERNEL, "drivers")  # fallback

total_files = 0
invalid_files = 0
for root, dirs, files in os.walk(COMMON):
    for fn in files:
        if os.path.splitext(fn)[1] in code_exts:
            total_files += 1
            rel_dir = os.path.relpath(root, os.path.dirname(COMMON))
            # 找最近的声明目录(逐级向上)
            st = "unknown"
            cur = rel_dir
            while cur:
                if cur in dir_syms:
                    st = dir_status(cur)
                    break
                cur = os.path.dirname(cur)
            file_label[rel_dir + "/" + fn] = st
            if st == "invalid":
                invalid_files += 1

print(f"\ncommon/drivers 代码文件: {total_files}")
print(f"无效(噪音): {invalid_files} ({invalid_files/total_files*100:.1f}%)")
print(f"\nTop 噪音目录(按无效文件数):")
by_dir = defaultdict(int)
for f, st in file_label.items():
    if st == "invalid":
        by_dir[f.rsplit("/", 1)[0]] += 1
for d, cnt in sorted(by_dir.items(), key=lambda kv: -kv[1])[:20]:
    print(f"  {d}: {cnt} 文件")

# ── 6. 落盘 ──────────────────────────────────────────────────────
with open(OUT, "w") as f:
    json.dump(file_label, f, ensure_ascii=False, indent=0)
print(f"\n已写 {OUT}: {len(file_label)} 文件")
