# AOSP 代码索引噪音治理方案(平台无关)

> 版本:v1.0 | 日期:2026-08-08 | 适用:aosp_learning 索引(qcm4490 实例,可推广至任意平台)
> 全部结论基于实测数据,非推测。

---

## 1. 背景与问题定义

### 1.1 现象

用语义搜索 `"MIPI DSI display panel backlight control"` 时,结果 #1 命中的是
`kernel_platform/common/drivers/gpu/drm/i915/i915_drv.h`(Intel 显卡驱动)的
`edp_power_seq()`——**不是高通代码**。

```
**#1** [0.500] 📄 [BSP] kernel_platform/common/drivers/gpu/drm/i915/i915_drv.h (L694-L724) — edp_power_seq()
> struct { u16 pwm_freq_hz; bool active_low_pwm; u8 min_brightness; ... } backlight; /* MIPI DSI */ ...

**#2** [0.500] 📄 [BSP] vendor/qcom/opensource/display-drivers/msm/dsi/dsi_panel.c (L592-L621) — DSI_DEBUG()
> static int dsi_panel_wled_register(...) { ... backlight_device_get_by_type(BACKLIGHT_RAW) ... }
```

### 1.2 根因

索引输入是**全量源码目录**,学习过程本身无法区分:

1. **哪些代码属于本平台**(高通 QCM4490)
2. **哪些代码被实际编译进固件**(arm64 上 i915 根本不会编译)
3. **哪些是其他厂商的 BSP**(NXP/ST 的 NFC 驱动)

`i915` 的 backlight 结构体字段名与查询高度语义相似,dense 向量匹配把它拉进结果。
**这不是"学错了",是"没区分所有权与有效性"。**

### 1.3 为什么必须系统化

噪音不止 i915 一种。实测 5,926,948 个 chunk 的路径分布:

```
kernel_platform  42.5%  ├─ msm-kernel 21.3% (高通内核)
                        ├─ common     21.0% (上游 Linux,含 i915/atomisp 等)
                        └─ qcom/external/prebuilts 微量
amss             37.6%  ├─ LE.UM.5.3.1  22.1% (高通 modem 应用侧)
                        ├─ BOOT.MXF.2.0 11.1% (高通 bootloader)
                        └─ ADSP.HT.5.7   4.4% (高通 DSP)
vendor           19.0%  ├─ qcom 18.3% (高通闭源)
                        ├─ codeaurora 0.4% (高通 CAF)
                        ├─ nxp 0.3% (NXP NFC — 噪音候选)
                        └─ stm/mobiiot 微量 (噪音候选)
hardware          0.9%  ├─ interfaces/qcom/google (混合)
                        └─ nxp/st/samsung/ti 微量 (噪音候选)
```

**任何"列举已知噪音文件"的方案都会漏。必须按"可机器验证的机制"分层判定。**

---

## 2. 噪音分类学(按机制,而非列举)

把噪音按**判定机制**分类,每一类都有对应的机器可验证方法:

| 类 | 定义 | 判定机制 | 实测量级 | 例子 |
|---|---|---|---|---|
| N1 | 其他厂商 BSP | 路径所有权 | ~2.4万点 (nxp+st+...) | `vendor/nxp/opensource/hidlimpl/`、`hardware/st/nfc/st21nfc/` |
| N2 | 上游内核中本平台**不编译**的驱动 | defconfig/Kconfig | common 内未启用驱动 | `drivers/gpu/drm/i915/`、`drivers/staging/media/atomisp/` |
| N3 | 上游内核中**通用有效**代码 | defconfig 启用 | common 内启用部分 | `drivers/tty/serial/`、`drivers/scsi/ufs/`(GKI 启用) |
| N4 | vendor 模块未被产品引用 | Android.bp / PRODUCT_PACKAGES | 待测 | `vendor.nxp.hardware.nfc@2.0-service` 无 PRODUCT 引用 |
| N5 | 非代码文件 | 文件类型/扩展名 | pipeline 已部分处理 | 二进制、`.md`、测试固件 |
| N6 | 冗余镜像/重复源码 | 目录拓扑 | 待测 | `amss/` 与 `target/` 可能重复 |

**核心原则:`
- N1 靠路径(平台无关的"厂商目录表")
- N2/N3 靠 defconfig(内核自带的"编译清单")
- N4 靠构建系统(AOSP 的"引用图")
- N5/N6 靠文件属性与拓扑

---

## 3. 判定机制详解(每层可独立验证)

### 3.1 L0 文件类型判定

**机制**:按扩展名/二进制探测排除非代码。
**现状**:pipeline 的 path_matcher 已过滤部分类型。
**输出**:`kind: code | doc | binary | test`
**局限**:不能区分代码所有权,只是第一道闸。

### 3.2 L1 路径所有权判定

**机制**:平台描述文件中的"厂商目录表"——每个厂商的专属路径前缀。

高通 qcm4490 实测:

```
qcom_owned:      vendor/qcom, vendor/codeaurora, kernel_platform/msm-kernel,
                 kernel_platform/qcom, amss (全部), hardware/qcom
upstream:        kernel_platform/common (上游 Linux,需 L2 细分)
other_vendor:    vendor/nxp, vendor/stm, vendor/mobiiot,
                 hardware/nxp, hardware/st, hardware/samsung, hardware/ti
```

**实测证据**:`vendor/nxp/opensource/hidlimpl/2.0/default/Android.bp` 定义
`vendor.nxp.hardware.nfc@2.0-service`——这是 NXP 的 NFC HAL,与高通平台无关
(QCM4490 若用高通自家 NFC 驱动,这批代码就是纯噪音)。

**输出**:`owner: qcom | upstream | other_vendor | unknown`
**局限**:`common` 里混着通用有效代码,不能一刀切删——需要 L2。

### 3.3 L2 defconfig/Kconfig 判定(内核核心层)

**机制**:解析平台 defconfig 的启用 CONFIG 符号 → 经 Kconfig 反查源码目录。

实测链路(msm-kernel):

```
build.config
  └─ KERNEL_DIR=./msm-kernel
     └─ . ./msm-kernel/build.config.msm.qdt676   ← 本机芯片 = qdt676
        └─ 继承 build.config.msm.parrot          ← qdt676 从 parrot 继承
           └─ 继承 build.config.msm.gki
              └─ DEFCONFIG="gki_defconfig"       ← 基础
                 + apply_defconfig_fragment vendor/parrot_GKI.config
                    → vendor/parrot-gki_defconfig ← 合并产物(直接可用)
```

实测结果:

| 检查项 | 结果 |
|---|---|
| defconfig 启用符号 | 922 个 |
| Kconfig 定义符号 | 11,160 个 |
| 成功定位到目录 | 489 个 (53.0%) |
| 有效驱动目录数 | 115 个 |
| `CONFIG_DRM_I915`(Intel) | 0 条 → i915 判定无效 ✅ |
| `CONFIG_VIDEO_ATOMISP`(Intel) | 0 条 → atomisp 判定无效 ✅ |
| `CONFIG_*` in `drivers/soc/qcom` | 80 条 → 高通 SoC 有效 ✅ |
| `CONFIG_*` in `drivers/tty/serial` | 13 条 → 串口框架有效(通用,保留)✅ |

**重要:common 不能全删。** GKI defconfig 启用了大量通用驱动:

```
CONFIG_SCSI=y  CONFIG_BLK_DEV_SD=y  CONFIG_SCSI_UFSHCD=y  CONFIG_BLK_DEV_LOOP=y ...
```

这些是有效代码,必须保留。**这正是 defconfig 方案的价值:在 common 内部做精细划分。**

**已知坑**:`CONFIG_DRM_MSM`(高通显示驱动)在 `parrot-gki_defconfig` 中为 0 条,
因为它定义在 `parrot-consolidate_defconfig`(合并片段)。**必须合并
gki + consolidate 两个片段再解析,否则会误删高通核心驱动。**

**输出**:`effective: yes | no`(仅对内核路径)
**局限**:只覆盖 `kernel_platform` 内核目录;vendor 层需 L3。

### 3.4 L3 构建引用判定(AOSP 层)

**机制**:解析 Android.bp / Android.mk 的模块定义 + PRODUCT_PACKAGES 引用,
判断 vendor 模块是否被产品实际打包。

**实测**:`device/` 下 PRODUCT_PACKAGES 未发现 `vendor.nxp.hardware.nfc` 引用
→ NXP NFC 服务很可能未被产品打包 → 可判 `not_built`。

**输出**:`built: yes | no | unknown`
**局限**:解析 Soong 完整依赖图较复杂;对纯内核索引可跳过。

---

## 4. 平台适配层(高通 vs MTK 及其他)

### 4.1 核心思想:判定逻辑平台无关,平台差异收敛到"平台画像"

```
┌─────────────────────────────────────────────────┐
│  平台无关的判定管线 (pipeline)                    │
│  L0 文件类型 → L1 路径所有权 → L2 defconfig → L3 引用  │
└──────────────────┬──────────────────────────────┘
                   │ 读取
        ┌──────────▼──────────┐
        │   platform.yaml     │ ← 唯一平台相关的文件
        │  (平台画像)          │
        └─────────────────────┘
```

**新增平台 = 新增一个 yaml,判定代码零改动。**

### 4.2 高通 qcm4490 平台画像(实测填充)

```yaml
platform: qcm4490
vendor_id: qcom

# L1 路径所有权
qcom_dirs:
  - vendor/qcom
  - vendor/codeaurora
  - kernel_platform/msm-kernel
  - kernel_platform/qcom
  - hardware/qcom
  - amss            # modem/boot/dsp,高通全部
other_vendor_dirs:
  - vendor/nxp, vendor/stm, vendor/mobiiot
  - hardware/nxp, hardware/st, hardware/samsung, hardware/ti
upstream_dirs:
  - kernel_platform/common

# L2 defconfig(内核)
kernel_roots:
  - kernel_platform/msm-kernel
  - kernel_platform/common
defconfig_files:                      # 按 build.config 引用链
  - kernel_platform/msm-kernel/arch/arm64/configs/vendor/parrot-gki_defconfig
  - kernel_platform/msm-kernel/arch/arm64/configs/vendor/parrot-consolidate_defconfig   # 必须合并!
defconfig_merge: true                 # gki + consolidate 合并解析

# L3 构建引用(可选)
build_ref_files:
  - "**/Android.bp"
  - "**/Android.mk"
product_makefiles:
  - device/**/*.mk
```

### 4.3 MTK 平台预估(结构差异与适配)

MTK(MediaTek)与高通差异明显,画像设计要点:

| 维度 | 高通 qcm4490 | MTK(预估) | 适配点 |
|---|---|---|---|
| 厂商目录 | `vendor/qcom` | `vendor/mediatek`、`vendor/mediatek/proprietary` | L1 目录表不同 |
| 内核目录 | `kernel_platform/msm-kernel` + `common` | `kernel-5.10/`(单树或 `kernel-6.1/`) | L2 kernel_roots 不同 |
| 芯片代号 | `parrot` / `qdt676`(build.config 链) | `mt6895` / `mt6985` 等 | defconfig 文件名不同 |
| defconfig 位置 | `arch/arm64/configs/vendor/parrot-gki_defconfig` | `arch/arm64/configs/mt6895_defconfig` 或 vendor 子目录 | L2 路径不同 |
| 高通专属驱动前缀 | `CONFIG_MSM_*`、`CONFIG_QCOM_*`、`CONFIG_DRM_MSM` | `CONFIG_MTK_*`、`CONFIG_MTK_DRM`、`CONFIG_MACH_MT*` | **无需硬编码**——Kconfig 反查天然适配 |
| 构建系统 | Soong (Android.bp) | Soong + 部分 `ProjectConfig.mk` | L3 需扩展 mk 解析 |
| 特性文件 | `build.config*` 引用链 | `ProjectConfig.mk` / `kernel defconfig fragments` | 需平台画像加 `config_chain` 字段 |

**关键洞察:defconfig→Kconfig→目录 的反查机制与厂商无关**——MTK 的
`CONFIG_MTK_DRM=y` 同样能通过 `drivers/gpu/drm/mediatek/Kconfig` 反查到
`drivers/gpu/drm/mediatek/`。**L2 逻辑零改动,只换 yaml。**

### 4.4 平台画像必需字段(通用 schema)

```yaml
platform: <name>
vendor_id: <主厂商标识>
qcom_dirs / vendor_dirs: <厂商专属路径前缀列表>        # L1
other_vendor_dirs: <其他厂商路径前缀>                  # L1
upstream_dirs: <上游公共代码路径>                      # L1,需 L2 细分
kernel_roots: <内核源码根>                             # L2
defconfig_files: <defconfig 路径列表,支持合并>          # L2
defconfig_merge: <bool, gki+consolidate 是否合并>       # L2
config_chain: <可选,描述 build.config 引用链脚本>       # L2 高级
build_ref_files / product_makefiles: <构建引用文件>    # L3
```

---

## 5. 落地实施路径

### 阶段 0:查询侧快速过滤(不动索引,立即生效)

在 `mcp_server.py` 的 `search_aosp` 增加过滤参数,按 file_path 前缀过滤:

```python
# 伪代码:查询时默认排除其他厂商 BSP
exclude_prefixes = ["vendor/nxp/", "vendor/stm/", "hardware/nxp/", "hardware/st/"]
query_filter = Filter(must=[FieldCondition(key="file_path",
                       match=MatchExcept(text=exclude_prefixes))])
```

**收益**:立即消除 N1 类噪音,零索引改动。
**局限**:N2(i915 等)仍需 defconfig 规则;不解决排序。

### 阶段 1:标签生成脚本(独立于索引)

写 `noise_classifier.py`,输入 = 文件路径清单,输出 = 标签:

```
判定顺序(短路):
1. L0 文件类型 → kind
2. L1 路径所有权 → owner (qcom/upstream/other_vendor/unknown)
3. L2 (owner==upstream 时)defconfig 反查 → effective (yes/no)
4. L3 (可选)构建引用 → built
最终标签: {owner, effective, built}
```

**可复用性**:该脚本输出 CSV/JSON,可喂给:
- 查询侧过滤器(按路径前缀匹配,无需重索引)
- 或 Qdrant payload 批量更新(upsert 点属性)
- 或未来重索引时写入 payload

### 阶段 2:标签接入查询(两条路线)

| 路线 | 做法 | 代价 | 生效 |
|---|---|---|---|
| A. 查询侧前缀过滤 | 标签→路径前缀→Qdrant Filter | 零,不动索引 | 立即 |
| B. payload 打标 | Qdrant 批量更新点 payload 加 owner/effective | 一次批量更新(5.9M 点,~小时级) | 更新后 |
| C. 重索引写入 | pipeline write_chunk 时带标签 | 需重跑索引(20+ 小时) | 重跑后 |

**推荐 A + B**:A 立即去噪,B 逐步升级(按 file_path 匹配更新 payload,不重算 embed)。

### 阶段 3:验证方法(必须量化)

建立查询测试集(每条含:查询词、期望命中的代码目录):

```
Q1: "MIPI DSI display panel backlight control" → 期望 vendor/qcom/.../dsi/dsi_panel.c
Q2: "Qualcomm UART power management"           → 期望 drivers/tty/serial 或 hci_qca.c
Q3: "camera sensor register setup"             → 期望 vendor/qcom/.../camx/ 或 cam_sensor_core.h
Q4: "GPIO 中断处理流程"                         → 期望 kernel_platform/msm-kernel/.../gpio
Q5: "NFC 驱动"                                 → 期望(若有)高通 NFC,而非 vendor/nxp
```

**指标**:
- 噪音命中率 = 结果中 owner=other_vendor 或 effective=no 的比例,目标 < 5%
- 有效命中率 = 结果中 qcom/effective 的比例,目标 > 80%
- 每个查询 top_k=10 人工标注,迭代调参

---

## 6. 权衡与风险

| 风险 | 说明 | 缓解 |
|---|---|---|
| **误删通用有效代码** | common 里 GKI 启用代码不能删 | L2 用 defconfig 精细判定,不按目录粗删 |
| **defconfig 不完整** | 只合并 gki 会漏 DRM_MSM | 强制 gki+consolidate 合并(已验证坑) |
| **vendor 层无 defconfig** | L2 只覆盖内核 | 补 L3 构建引用,或按 owner 降权而非删除 |
| **MTK 结构差异** | 目录/defconfig 命名不同 | 平台画像收敛,逻辑零改动 |
| **构建引用解析复杂度** | Soong 图解析重 | 可选功能,默认 owner 降权兜底 |
| **性能** | 过滤条件多可能拖慢查询 | 前缀过滤走 Qdrant 索引,影响小;5.9M 点可承受 |

**兜底原则:不确定的标签 → 宁降权不删除。** 噪音污染检索(降权)比漏掉有效代码(删除)代价低。

---

## 7. 附录:实测数据汇总

| 项目 | 数值 |
|---|---|
| 索引 chunk 总数 | 5,926,948 |
| 文件总数 | 318,235 |
| kernel_platform 占比 | 42.5% |
| amss 占比 | 37.6% |
| vendor 占比 | 19.0% |
| hardware 占比 | 0.9% |
| NXP+ST 等噪音候选点数 | ~24,000 (0.4%) |
| defconfig 启用符号 | 922 |
| Kconfig 定义符号 | 11,160 |
| 定位到目录的启用符号 | 489 (53%) |
| 有效驱动目录 | 115 |
| i915/atomisp 启用符号 | 0(判定无效) |
| drivers/soc/qcom 启用符号 | 80(判定有效) |

---

*文档完。下一步动作:① 若同意,先做阶段 0(查询侧过滤)立即去噪;② 写 noise_classifier.py 生成标签;③ 建查询测试集量化验证。*
