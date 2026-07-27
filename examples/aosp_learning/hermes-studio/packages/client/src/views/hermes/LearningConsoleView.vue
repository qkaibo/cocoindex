<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, h } from "vue";
import {
  NCard, NTabs, NTabPane, NButton, NSwitch, NInputNumber,
  NTag, NProgress, NStatistic, NGrid, NGi, NSelect,
  NSpace, NSpin, NLog, NModal, NInput, NDivider, NEmpty, NTree,
  useMessage,
} from "naive-ui";
import type { TreeOption } from "naive-ui";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const message = useMessage();

// ── API base URL ──────────────────────────────────────────────────────
const API_BASE = "";

// ── Types ──────────────────────────────────────────────────────────────
interface ModuleInfo {
  name: string;
  description: string;
  code_globs: string[];
  wiki_dir: string;
}

interface ModuleFormData {
  name: string;
  description: string;
  code_globs: string[];
  wiki_dir: string;
}

interface RuntimeConfig {
  max_workers: number;
  timeout: number;
  max_inflight: number;
}

interface ChipInfo {
  name: string;
  aosp_root: string;
  wiki_root: string;
  modules: ModuleInfo[];
  source: string;
  platform: string;
}

interface PlatformTreeNode {
  name: string;
  chips: ChipInfo[];
  source: string;
}

interface AppConfig {
  platform: string;
  chip: string;
  modules: string[];
  activeModule: string;
  runtime: RuntimeConfig;
}

interface IndexStatus {
  total: number;
  in_flight: number;
  added: number;
  elapsed: number;
  running: boolean;
  process_alive: boolean;
  exit_code?: number;
  module: string;
  external_process?: ExternalProcess;
  log_lines?: string[];
  history?: Record<string, ModuleHistory>;
}

interface ModuleHistory {
  status: string;
  total: number;
  added: number;
  elapsed: number;
  exit_code: number;
  time: string;
  complete?: boolean | null;
  detail?: string;
}

interface ExternalProcess {
  pid: number;
  module: string;
  target: string;
  alive: boolean;
  cpu_percent: number;
  rss_mb: number;
  uptime_seconds: number;
  source: string;
}

interface GpuStatus {
  gpu_util: string;
  mem_used: string;
  mem_total: string;
  temp: string;
  power: string;
  error?: string;
}

// ── State ──────────────────────────────────────────────────────────────
const activeTab = ref("config");
const loading = ref(false);

// Config state
const config = ref<AppConfig>({
  platform: "allwinner",
  chip: "h618",
  modules: ["BSP", "FRAMEWORK", "APP"],
  activeModule: "BSP",
  runtime: { max_workers: 256, timeout: 300, max_inflight: 4096 },
});
const allModules = ref<ModuleInfo[]>([]);
const configLoading = ref(false);

// ── 树形导航状态 ──────────────────────────────────────────────────────
const platformTree = ref<PlatformTreeNode[]>([]);
const treeData = ref<TreeOption[]>([]);
const selectedChipKey = ref<string>("");
const currentChipDetail = ref<ChipInfo | null>(null);
const treeLoading = ref(false);

// 芯片编辑状态
const showChipForm = ref(false);
const editingChipKey = ref<string>("");  // "platform/chip"
const chipForm = ref<{
  platform: string;
  name: string;
  aosp_root: string;
  wiki_root: string;
  modules: ModuleFormData[];
}>({
  platform: "allwinner",
  name: "",
  aosp_root: "",
  wiki_root: "./aosp_wiki",
  modules: [],
});
const chipFormLoading = ref(false);

// Control state
const selectedModule = ref<string>("BSP");
const indexStatus = ref<IndexStatus>({
  total: 0, in_flight: 0, added: 0, elapsed: 0,
  running: false, process_alive: false, module: "",
});
const statusLoading = ref(false);

// Monitor state
const gpuStatus = ref<GpuStatus>({ gpu_util: "?", mem_used: "?", mem_total: "?", temp: "?", power: "?" });
let sseSource: EventSource | null = null;
let gpuTimer: ReturnType<typeof setInterval> | null = null;

// ── Computed ───────────────────────────────────────────────────────────
const progressPercent = computed(() => {
  if (indexStatus.value.total === 0) return 0;
  return Math.round((indexStatus.value.added / indexStatus.value.total) * 100);
});

const isRunning = computed(() => indexStatus.value.process_alive && indexStatus.value.running);

const moduleOptions = computed(() =>
  allModules.value.map((m) => ({ label: m.name, value: m.name })),
);

const statusColor = computed(() => {
  if (isRunning.value) return "success";
  if (indexStatus.value.exit_code !== undefined && indexStatus.value.exit_code !== 0) return "error";
  return "default";
});

const hasExternalProcess = computed(() => !!indexStatus.value.external_process?.alive);

const externalUptime = computed(() => {
  const sec = indexStatus.value.external_process?.uptime_seconds || 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h}h ${m}m ${s}s`;
});

const externalMem = computed(() => {
  const mb = indexStatus.value.external_process?.rss_mb || 0;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
});

const processLog = computed(() => (indexStatus.value.log_lines || []).join("\n"));

const historyTagType = (s: string) => {
  if (s === "completed") return "success";
  if (s === "stopped") return "warning";
  if (s === "error") return "error";
  if (s === "indexed") return "success";
  if (s === "incomplete") return "warning";
  if (s === "running") return "info";
  return "default";
};
const historyLabel = (s: string) => {
  if (s === "completed") return "✅ 已完成";
  if (s === "stopped") return "⚠️ 已停止";
  if (s === "error") return "❌ 错误";
  if (s === "indexed") return "📊 已索引";
  if (s === "incomplete") return "⚠️ 未完成";
  if (s === "running") return "🔄 学习中";
  return "— 未学习";
};
const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

// 每个模块的有效状态：历史记录 > 当前运行中 > 未学习
const moduleState = (modName: string): (ModuleHistory & { complete?: boolean | null; detail?: string }) | null => {
  let h = indexStatus.value.history?.[modName];
  if (h) {
    const total = h.total || 0;
    const added = h.added || 0;
    const elapsed = h.elapsed || 0;
    const complete = h.complete;
    let detail: string;
    if (complete === true) {
      detail = `✅ 已完成 · ${added.toLocaleString()} 文档 / ${total.toLocaleString()} 源文件`;
      h = { ...h, status: "completed" };
    } else if (complete === false) {
      detail = `⚠️ 未完成 · ${added.toLocaleString()} 文档 / ${total.toLocaleString()} 源文件`;
      h = { ...h, status: "incomplete" };
    } else if (total > 0) {
      detail = `${added.toLocaleString()} 文档 / ${total.toLocaleString()} 源文件`;
    } else {
      detail = `${added.toLocaleString()} 文档`;
    }
    return { ...h, complete, detail, added, total, elapsed };
  }
  // 正在运行且匹配当前模块 → 显示实时进度
  if (isRunning.value && indexStatus.value.module === modName) {
    return {
      status: "running",
      total: indexStatus.value.total,
      added: indexStatus.value.added,
      elapsed: indexStatus.value.elapsed,
      time: "",
      exit_code: 0,
      complete: null,
      detail: `${indexStatus.value.added.toLocaleString()}/${indexStatus.value.total || "?"} 文件中...`,
    };
  }
  return null;
};

// ── API calls ──────────────────────────────────────────────────────────
async function fetchConfig() {
  configLoading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/learning/config`);
    config.value = { ...config.value, ...await res.json() };
    // 有保存的配置时自动选中对应芯片
    if (config.value.platform && config.value.chip) {
      selectedChipKey.value = `${config.value.platform}/${config.value.chip}`;
      await loadChipDetail(config.value.platform, config.value.chip);
      await fetchModulesForChip(config.value.platform, config.value.chip);
    }
  } catch (e) {
    message.error(t("learningConsole.configFetchFailed"));
  } finally {
    configLoading.value = false;
  }
}

async function fetchModulesForChip(platform: string, chip: string) {
  try {
    const res = await fetch(`${API_BASE}/api/learning/modules?platform=${platform}&chip=${chip}`);
    allModules.value = await res.json();
  } catch (e) { /* silent */ }
}

// ── 平台树 ────────────────────────────────────────────────────────────
function buildTreeData(tree: PlatformTreeNode[]): TreeOption[] {
  return tree.map(plat => {
    if (plat.chips.length === 0) {
      return {
        key: plat.name,
        label: `📁 ${plat.name}`,
        isLeaf: true,
        suffix: () => h(NTag, { type: "warning", size: "tiny", bordered: false }, { default: () => "空" }),
      };
    }
    return {
      key: plat.name,
      label: `📁 ${plat.name}`,
      children: plat.chips.map(chip => {
        const key = `${plat.name}/${chip.name}`;
        return {
          key,
          label: () => {
            const sel = selectedChipKey.value === key;
            return h('span', sel ? { style: { fontWeight: '600' } } : { style: { color: '#aaa' } }, `${sel ? '◆' : '◇'} ${chip.name}`);
          },
          isLeaf: true,
        };
      }),
    };
  });
}

async function fetchPlatformTree() {
  treeLoading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/learning/platforms`);
    const data: PlatformTreeNode[] = await res.json();
    platformTree.value = data;
    treeData.value = buildTreeData(data);
    // 自动选中当前配置的芯片
    if (config.value.platform && config.value.chip) {
      selectedChipKey.value = `${config.value.platform}/${config.value.chip}`;
    }
  } catch (e) { /* silent */ } finally {
    treeLoading.value = false;
  }
}

// ── 树选择 & 芯片详情 ─────────────────────────────────────────────────
async function onTreeSelect(keys: string[], _opt: any) {
  if (keys.length === 0) return;
  const key = keys[0];
  const parts = key.split("/");
  if (parts.length !== 2) return;  // 只处理芯片节点

  const [platform, chip] = parts;
  selectedChipKey.value = key;
  config.value.platform = platform;
  config.value.chip = chip;
  await Promise.all([
    loadChipDetail(platform, chip),
    fetchModulesForChip(platform, chip),
  ]);
  // 自动选中所有模块
  if (allModules.value.length > 0) {
    config.value.modules = allModules.value.map(m => m.name);
    config.value.activeModule = allModules.value[0].name;
    selectedModule.value = allModules.value[0].name;
  }
}

async function loadChipDetail(platform: string, chip: string) {
  try {
    const res = await fetch(`${API_BASE}/api/learning/chips/${platform}/${chip}`);
    currentChipDetail.value = await res.json();
  } catch (e) {
    // 从 treeData 中找
    const plat = platformTree.value.find(p => p.name === platform);
    const c = plat?.chips.find(ch => ch.name === chip);
    if (c) currentChipDetail.value = c;
  }
}

// ── 芯片管理 ──────────────────────────────────────────────────────────
const DEFAULT_MODULES: ModuleFormData[] = [
  { name: "BSP", description: "板级支持包", code_globs: ["**/hardware/**", "**/device/**", "**/vendor/**", "**/longan/**"], wiki_dir: "bsp" },
  { name: "FRAMEWORK", description: "Android Framework层", code_globs: ["**/frameworks/**", "**/system/**"], wiki_dir: "framework" },
  { name: "APP", description: "应用层", code_globs: ["**/packages/**", "**/cts/**"], wiki_dir: "app" },
];

function openNewChip() {
  editingChipKey.value = "";
  chipForm.value = {
    platform: "allwinner",
    name: "",
    aosp_root: "",
    wiki_root: "./aosp_wiki",
    modules: DEFAULT_MODULES.map(m => ({ ...m, code_globs: [...m.code_globs] })),
  };
  showChipForm.value = true;
}

async function openEditChip(platform: string, chip: string) {
  editingChipKey.value = `${platform}/${chip}`;
  chipForm.value = { platform, name: chip, aosp_root: "", wiki_root: "./aosp_wiki", modules: [] };
  try {
    const res = await fetch(`${API_BASE}/api/learning/chips/${platform}/${chip}`);
    const detail = await res.json();
    chipForm.value = {
      platform,
      name: chip,
      aosp_root: detail.aosp_root || "",
      wiki_root: detail.wiki_root || "./aosp_wiki",
      modules: (detail.modules || []).map((m: any) => ({
        name: m.name || "",
        description: m.description || "",
        code_globs: [...(m.code_globs || [])],
        wiki_dir: m.wiki_dir || "",
      })),
    };
  } catch (e) {
    chipForm.value.modules = DEFAULT_MODULES.map(m => ({ ...m, code_globs: [...m.code_globs] }));
  }
  showChipForm.value = true;
}

function addModule() {
  chipForm.value.modules.push({ name: "", description: "", code_globs: [], wiki_dir: "" });
}

function removeModule(idx: number) {
  chipForm.value.modules.splice(idx, 1);
}

function _codeGlobsToText(globs: string[]): string {
  return (globs || []).join("\n");
}

function _textToCodeGlobs(text: string): string[] {
  return text.split("\n").map(s => s.trim()).filter(s => s);
}

async function saveChip() {
  chipFormLoading.value = true;
  try {
    const body = {
      platform: chipForm.value.platform,
      name: chipForm.value.name,
      aosp_root: chipForm.value.aosp_root,
      wiki_root: chipForm.value.wiki_root,
      modules: chipForm.value.modules.filter(m => m.name.trim()).map(m => ({
        name: m.name.trim(),
        description: m.description.trim(),
        code_globs: m.code_globs.filter(g => g.trim()),
        wiki_dir: m.wiki_dir.trim(),
      })),
    };
    if (!body.name) { message.error("芯片名不能为空"); return; }
    if (!body.platform) { message.error("平台名不能为空"); return; }
    if (body.modules.length === 0) { message.error("至少需要一个模块"); return; }

    const key = `${body.platform}/${body.name}`;
    const method = editingChipKey.value ? "PUT" : "POST";
    const url = editingChipKey.value
      ? `${API_BASE}/api/learning/chips/${editingChipKey.value}`
      : `${API_BASE}/api/learning/chips`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      message.success(editingChipKey.value ? "芯片已更新" : "芯片已添加");
      showChipForm.value = false;
      await fetchPlatformTree();
      // 刷新当前选中
      if (editingChipKey.value === selectedChipKey.value) {
        await loadChipDetail(body.platform, body.name);
        await fetchModulesForChip(body.platform, body.name);
      }
    } else {
      const err = await res.json();
      message.error(err.detail || "操作失败");
    }
  } catch (e: any) {
    message.error("操作失败: " + (e.message || ""));
  } finally {
    chipFormLoading.value = false;
  }
}

async function confirmDeleteChip(platform: string, chip: string) {
  if (window.confirm(`确定要删除芯片 "${platform}/${chip}" 吗？此操作不可撤销。`)) {
    await deleteChip(platform, chip);
  }
}

async function deleteChip(platform: string, chip: string) {
  try {
    const res = await fetch(`${API_BASE}/api/learning/chips/${platform}/${chip}`, { method: "DELETE" });
    if (res.ok) {
      message.success(`芯片 ${chip} 已删除`);
      if (`${platform}/${chip}` === selectedChipKey.value) {
        selectedChipKey.value = "";
        currentChipDetail.value = null;
        allModules.value = [];
      }
      await fetchPlatformTree();
    }
  } catch (e: any) {
    message.error("删除失败");
  }
}

async function saveConfig() {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/learning/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config.value),
    });
    if (res.ok) {
      message.success(t("learningConsole.configSaved"));
    } else {
      throw new Error(await res.text());
    }
  } catch (e: any) {
    message.error(t("learningConsole.configSaveFailed") + ": " + (e.message || ""));
  } finally {
    loading.value = false;
  }
}

async function fetchStatus() {
  statusLoading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/learning/status`);
    indexStatus.value = await res.json();
  } catch (e) {
    // backend might not be running
  } finally {
    statusLoading.value = false;
  }
}

async function startIndex() {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/learning/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: selectedModule.value }),
    });
    if (res.ok) {
      message.success(t("learningConsole.indexStarted", { module: selectedModule.value }));
      await fetchStatus();
      // 重新连接 SSE——可能之前因为没进程而断开了
      connectSSE();
    } else {
      const err = await res.json();
      message.error(err.detail || t("learningConsole.startFailed"));
    }
  } catch (e: any) {
    message.error(t("learningConsole.startFailed") + ": " + (e.message || ""));
  } finally {
    loading.value = false;
  }
}

async function stopIndex() {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/learning/stop`, { method: "POST" });
    if (res.ok) {
      message.success(t("learningConsole.indexStopped"));
      await fetchStatus();
    }
  } catch (e: any) {
    message.error(t("learningConsole.stopFailed") + ": " + (e.message || ""));
  } finally {
    loading.value = false;
  }
}

async function fetchGpu() {
  try {
    const res = await fetch(`${API_BASE}/api/learning/gpu`);
    gpuStatus.value = await res.json();
  } catch (e) {
    // silent
  }
}

// ── SSE ────────────────────────────────────────────────────────────────
function connectSSE() {
  if (sseSource) sseSource.close();
  sseSource = new EventSource(`${API_BASE}/api/learning/progress`);
  sseSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as IndexStatus;
      indexStatus.value = data;
      if (!data.process_alive && !data.running) {
        sseSource?.close();
        sseSource = null;
        // 进程结束了，过一会儿重连等待新进程
        setTimeout(() => connectSSE(), 2000);
      }
    } catch {}
  };
  sseSource.onerror = () => {
    // reconnect after delay
    setTimeout(() => {
      if (sseSource) {
        sseSource.close();
        sseSource = null;
      }
      connectSSE();
    }, 3000);
  };
}

// ── Lifecycle ──────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchConfig(), fetchPlatformTree(), fetchStatus(), fetchGpu()]);
  connectSSE();
  gpuTimer = setInterval(fetchGpu, 3000);
});

onUnmounted(() => {
  if (sseSource) {
    sseSource.close();
    sseSource = null;
  }
  if (gpuTimer) {
    clearInterval(gpuTimer);
    gpuTimer = null;
  }
});
</script>

<template>
  <div class="learning-console">
    <h2 class="page-title">{{ t("learningConsole.title") }}</h2>

    <div class="main-layout">
      <!-- ═══ 左侧：平台/芯片树 ═══ -->
      <div class="sidebar">
        <NCard title="平台 / 芯片" size="small" bordered>
          <template #header-extra>
            <NButton size="tiny" type="primary" @click="openNewChip">+</NButton>
          </template>
          <NSpin :show="treeLoading">
            <NTree
              :data="treeData"
              :selected-keys="selectedChipKey ? [selectedChipKey] : []"
              :default-expand-all="true"
              selectable
              @update:selected-keys="onTreeSelect"
            />
            <NEmpty v-if="treeData.length === 0" description="暂无平台" style="margin-top: 20px" />
          </NSpin>
        </NCard>
      </div>

      <!-- ═══ 右侧：选中芯片的内容 ═══ -->
      <div class="content">
        <NSpace v-if="!currentChipDetail" vertical align="center" justify="center" style="height: 100%; min-height: 300px">
          <span class="dim-text" style="font-size: 16px">← 请从左侧选择芯片</span>
        </NSpace>

        <template v-else>
          <div class="chip-header">
            <div class="chip-header-left">
              <span class="chip-header-platform">{{ currentChipDetail!.platform }}</span>
              <span class="chip-header-sep">/</span>
              <span class="chip-header-name">{{ currentChipDetail!.name }}</span>
              <code class="chip-header-path" :title="currentChipDetail!.aosp_root">{{ currentChipDetail!.aosp_root || '—' }}</code>
            </div>
            <NSpace>
              <NButton size="tiny" @click="openEditChip(currentChipDetail!.platform, currentChipDetail!.name)">编辑</NButton>
              <NButton size="tiny" type="error" @click="confirmDeleteChip(currentChipDetail!.platform, currentChipDetail!.name)">删除</NButton>
            </NSpace>
          </div>

          <NTabs v-model:value="activeTab" type="line" animated>
            <!-- ═══ Tab 1: 配置 ═══ -->
            <NTabPane name="config" :tab="t('learningConsole.configTab')">
              <NSpin :show="configLoading">

                <!-- 模块配置 -->
                <NCard title="模块" size="small" bordered style="margin-top: 12px">
                  <div v-for="mod in allModules" :key="mod.name" class="module-row">
                    <NSwitch
                      :value="config.modules.includes(mod.name)"
                      @update:value="(v: boolean) => {
                        if (v) {
                          if (!config.modules.includes(mod.name)) config.modules.push(mod.name);
                        } else {
                          config.modules = config.modules.filter((m: string) => m !== mod.name);
                        }
                      }"
                    />
                    <div class="module-info">
                      <strong>{{ mod.name }}</strong>
                      <p class="dim-text">{{ mod.description }}</p>
                      <p v-if="mod.code_globs?.length" class="dim-text" style="font-size: 11px; font-family: monospace">
                        {{ mod.code_globs.join(', ') }}
                      </p>
                    </div>
                  </div>
                  <NEmpty v-if="allModules.length === 0" description="该芯片暂无模块" style="margin-top: 8px" />
                </NCard>

                <!-- 运行时参数 -->
                <NCard :title="t('learningConsole.runtimeParams')" size="small" bordered style="margin-top: 12px">
                  <div class="runtime-row">
                    <div class="param-col">
                      <span class="param-label">{{ t("learningConsole.maxWorkers") }}</span>
                      <NInputNumber v-model:value="config.runtime.max_workers" :min="1" :max="1024" style="width: 100px" size="small" />
                    </div>
                    <div class="param-col">
                      <span class="param-label">{{ t("learningConsole.timeout") }}</span>
                      <NInputNumber v-model:value="config.runtime.timeout" :min="30" :max="3600" style="width: 100px" size="small" />
                      <span class="dim-text">s</span>
                    </div>
                    <div class="param-col">
                      <span class="param-label">{{ t("learningConsole.maxInflight") }}</span>
                      <NInputNumber v-model:value="config.runtime.max_inflight" :min="64" :max="16384" style="width: 130px" size="small" />
                    </div>
                  </div>
                </NCard>

                <!-- 保存 -->
                <NButton type="primary" :loading="loading" @click="saveConfig" block style="margin-top: 12px">
                  {{ t("learningConsole.saveConfig") }}
                </NButton>
              </NSpin>
            </NTabPane>

      <!-- ═══ Tab 2: 控制 ═══ -->
      <NTabPane name="control" :tab="t('learningConsole.controlTab')">
        <NGrid :cols="2" :x-gap="16" :y-gap="16">
          <!-- 模块选择 & 启停 -->
          <NGi :span="2">
            <NCard :title="t('learningConsole.indexControl')" size="small" bordered>
              <NSpace vertical size="medium" style="width: 100%">
                <div class="param-row">
                  <span class="param-label">{{ t("learningConsole.selectModule") }}</span>
                  <NSelect
                    v-model:value="selectedModule"
                    :options="moduleOptions"
                    style="width: 200px"
                    :disabled="isRunning"
                  />
                </div>
                <NSpace>
                  <NButton
                    type="success"
                    :loading="loading"
                    :disabled="isRunning"
                    @click="startIndex"
                  >
                    {{ t("learningConsole.start") }}
                  </NButton>
                  <NButton
                    type="error"
                    :loading="loading"
                    :disabled="!isRunning"
                    @click="stopIndex"
                  >
                    {{ t("learningConsole.stop") }}
                  </NButton>
                </NSpace>
              </NSpace>
            </NCard>
          </NGi>

          <!-- 状态 -->
          <NGi :span="2">
            <NCard :title="t('learningConsole.processStatus')" size="small" bordered>
              <NSpin :show="statusLoading">
                <NGrid :cols="4" :x-gap="12" :y-gap="12">
                  <NGi>
                    <NStatistic :label="t('learningConsole.status')">
                      <NTag :type="statusColor" size="medium" :bordered="false">
                        {{ isRunning ? t("learningConsole.running") : t("learningConsole.stopped") }}
                      </NTag>
                    </NStatistic>
                  </NGi>
                  <NGi>
                    <NStatistic :label="t('learningConsole.module')">
                      {{ indexStatus.module || "—" }}
                    </NStatistic>
                  </NGi>
                  <NGi>
                    <NStatistic :label="t('learningConsole.exitCode')">
                      {{ indexStatus.exit_code !== undefined ? indexStatus.exit_code : "—" }}
                    </NStatistic>
                  </NGi>
                  <NGi>
                    <NStatistic :label="t('learningConsole.elapsed')">
                      {{ indexStatus.elapsed.toFixed(1) }}s
                    </NStatistic>
                  </NGi>
                </NGrid>
              </NSpin>
            </NCard>
          </NGi>

          <!-- 模块历史 -->
          <NGi :span="2">
            <NCard :title="t('learningConsole.moduleHistory')" size="small" bordered>
              <div v-for="mod in allModules" :key="mod.name" class="history-row">
                <strong class="history-name">{{ mod.name }}</strong>
                <NTag :type="historyTagType(moduleState(mod.name)?.status || '')" size="small" :bordered="false" class="history-tag">
                  {{ historyLabel(moduleState(mod.name)?.status || '') }}
                </NTag>
                <template v-if="moduleState(mod.name)">
                  <span class="dim-text history-detail">
                    {{ moduleState(mod.name)!.detail }}
                    <template v-if="moduleState(mod.name)!.time"> · {{ formatTime(moduleState(mod.name)!.time) }}</template>
                  </span>
                </template>
                <span v-else class="dim-text history-detail">{{ t('learningConsole.neverLearned') }}</span>
              </div>
            </NCard>
          </NGi>
        </NGrid>
      </NTabPane>

      <!-- ═══ Tab 3: 监控 ═══ -->
      <NTabPane name="monitor" :tab="t('learningConsole.monitorTab')">
        <NGrid :cols="2" :x-gap="16" :y-gap="16">
          <!-- 索引进度 -->
          <NGi :span="2">
            <NCard :title="t('learningConsole.indexProgress')" size="small" bordered>
              <NSpace vertical size="medium" style="width: 100%">
                <div>
                  <div class="progress-label">
                    {{ t("learningConsole.filesProcessed") }}
                    <span class="dim-text">{{ indexStatus.added }} / {{ indexStatus.total }}</span>
                  </div>
                  <NProgress
                    type="line"
                    :percentage="progressPercent"
                    :indicator-placement="'inside'"
                    :height="24"
                    :color="isRunning ? '#18a058' : '#909399'"
                    :rail-color="'#f0f0f0'"
                  />
                </div>
                <NGrid :cols="4" :x-gap="12">
                  <NGi>
                    <NStatistic :label="t('learningConsole.totalFiles')" :value="indexStatus.total" />
                  </NGi>
                  <NGi>
                    <NStatistic :label="t('learningConsole.inFlight')" :value="indexStatus.in_flight" />
                  </NGi>
                  <NGi>
                    <NStatistic :label="t('learningConsole.added')" :value="indexStatus.added" />
                  </NGi>
                  <NGi>
                    <NStatistic :label="t('learningConsole.elapsed')">
                      {{ indexStatus.elapsed.toFixed(1) }}s
                    </NStatistic>
                  </NGi>
                </NGrid>
                <div v-if="!indexStatus.process_alive && !indexStatus.running" class="dim-text" style="text-align: center">
                  {{ t("learningConsole.noActiveProcess") }}
                </div>
              </NSpace>
            </NCard>
          </NGi>

          <!-- GPU 状态 -->
          <NGi :span="2">
            <NCard :title="t('learningConsole.processLog')" size="small" bordered>
              <NLog
                :log="processLog"
                :rows="5"
                language="naive-log"
                :loading="isRunning && !processLog"
                style="font-size: 12px; font-family: monospace; max-height: 160px"
              />
              <div v-if="!processLog && !isRunning" class="dim-text" style="text-align: center">
                {{ t('learningConsole.noActiveProcess') }}
              </div>
            </NCard>
          </NGi>

          <!-- GPU 状态 -->
          <NGi :span="2">
            <NCard :title="t('learningConsole.gpuStatus')" size="small" bordered>
              <div v-if="gpuStatus.error" class="dim-text">
                {{ gpuStatus.error }}
              </div>
              <NGrid v-else :cols="4" :x-gap="12">
                <NGi>
                  <NStatistic :label="t('learningConsole.gpuUtil')">
                    {{ gpuStatus.gpu_util }}%
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic :label="t('learningConsole.gpuMem')">
                    {{ gpuStatus.mem_used }} / {{ gpuStatus.mem_total }} MiB
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic :label="t('learningConsole.gpuTemp')">
                    {{ gpuStatus.temp }}°C
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic :label="t('learningConsole.gpuPower')">
                    {{ gpuStatus.power }}W
                  </NStatistic>
                </NGi>
              </NGrid>
            </NCard>
          </NGi>

          <!-- 外部进程 -->
          <NGi v-if="hasExternalProcess" :span="2">
            <NCard :title="t('learningConsole.externalProcess')" size="small" bordered>
              <NTag type="warning" size="small" :bordered="false" style="margin-bottom: 12px">
                {{ t('learningConsole.externalDetected') }}
              </NTag>
              <NGrid :cols="4" :x-gap="12" :y-gap="12">
                <NGi>
                  <NStatistic :label="t('learningConsole.module')">
                    {{ indexStatus.external_process?.module }}
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic label="PID">
                    {{ indexStatus.external_process?.pid }}
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic label="CPU">
                    {{ indexStatus.external_process?.cpu_percent }}%
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic :label="t('learningConsole.memory')">
                    {{ externalMem }}
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic :label="t('learningConsole.uptime')">
                    {{ externalUptime }}
                  </NStatistic>
                </NGi>
                <NGi>
                  <NStatistic :label="t('learningConsole.target')">
                    <span style="font-size: 12px; font-family: monospace">{{ indexStatus.external_process?.target }}</span>
                  </NStatistic>
                </NGi>
              </NGrid>
            </NCard>
          </NGi>
        </NGrid>
      </NTabPane>
          </NTabs>
        </template>
      </div>
    </div>

    <!-- 芯片编辑弹窗 -->
    <NModal v-model:show="showChipForm" :title="editingChipKey ? '编辑芯片' : '添加芯片'" preset="card" style="width: 720px" :mask-closable="false">
      <NSpace vertical size="medium" style="width: 100%; max-height: 70vh; overflow-y: auto">
        <div class="param-row">
          <span class="param-label">平台</span>
          <NInput v-model:value="chipForm.platform" :disabled="!!editingChipKey" placeholder="例如 allwinner" style="width: 240px" />
        </div>
        <div class="param-row">
          <span class="param-label">芯片名</span>
          <NInput v-model:value="chipForm.name" :disabled="!!editingChipKey" placeholder="例如 h618" style="width: 240px" />
        </div>
        <div class="param-row">
          <span class="param-label">AOSP 路径</span>
          <NInput v-model:value="chipForm.aosp_root" placeholder="/path/to/aosp/root" style="width: 520px" />
        </div>
        <div class="param-row">
          <span class="param-label">Wiki 路径</span>
          <NInput v-model:value="chipForm.wiki_root" placeholder="./aosp_wiki" style="width: 240px" />
        </div>

        <NDivider>模块配置</NDivider>

        <div v-for="(mod, idx) in chipForm.modules" :key="idx" class="module-editor">
          <NCard size="tiny" :bordered="true">
            <template #header>
              <NSpace align="center">
                <span class="dim-text" style="font-size: 12px">模块 {{ idx + 1 }}</span>
                <NInput v-model:value="mod.name" placeholder="模块名" style="width: 140px" size="small" />
                <NButton size="tiny" type="error" @click="removeModule(idx)">删除</NButton>
              </NSpace>
            </template>
            <NSpace vertical size="small" style="width: 100%">
              <div class="param-row">
                <span class="param-label" style="min-width: 50px">描述</span>
                <NInput v-model:value="mod.description" placeholder="描述信息" size="small" style="flex: 1" />
              </div>
              <div class="param-row">
                <span class="param-label" style="min-width: 50px">Wiki 目录</span>
                <NInput v-model:value="mod.wiki_dir" placeholder="bsp" style="width: 140px" size="small" />
              </div>
              <div>
                <span class="dim-text" style="font-size: 12px; margin-bottom: 4px; display: block">Code Globs（每行一个）</span>
                <NInput
                  :value="_codeGlobsToText(mod.code_globs)"
                  @update:value="(v: string) => mod.code_globs = _textToCodeGlobs(v)"
                  type="textarea"
                  :rows="3"
                  placeholder="**/hardware/**"
                  size="small"
                />
              </div>
            </NSpace>
          </NCard>
        </div>

        <NButton dashed block @click="addModule">+ 添加模块</NButton>

        <NDivider />

        <NSpace justify="end">
          <NButton type="primary" :loading="chipFormLoading" @click="saveChip">{{ editingChipKey ? '保存' : '添加' }}</NButton>
          <NButton @click="showChipForm = false">取消</NButton>
        </NSpace>
      </NSpace>
    </NModal>
  </div>
</template>

<style scoped lang="scss">
.learning-console {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.module-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--n-border-color, #eee);

  &:last-child {
    border-bottom: none;
  }

  .module-info {
    flex: 1;
    strong {
      display: block;
      margin-bottom: 2px;
    }
    p {
      margin: 0;
      font-size: 13px;
    }
  }
}

.param-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .param-label {
    min-width: 120px;
    font-weight: 500;
  }
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.dim-text {
  color: var(--n-text-color-3, #999);
  font-size: 13px;
}

// ── Main Layout ─────────────────────────────────────────────────────
.main-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  align-items: start;
  min-height: calc(100vh - 100px);
}

.sidebar {
  position: sticky;
  top: 0;

  // 选中芯片节点高亮样式
  :deep(.n-tree-node--selected) {
    .n-tree-node-content {
      background: #eaf4ff !important;
      border-radius: 4px;
    }
  }
}

.content {
  min-width: 0;
}

// ── Chip Header ─────────────────────────────────────────────────────
.chip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 8px;
  background: var(--n-color-embedded, #f8f9fa);
  border-radius: 6px;
  border: 1px solid var(--n-border-color, #e8e8e8);

  .chip-header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .chip-header-platform {
    font-weight: 600;
    color: var(--n-text-color-3, #999);
    font-size: 14px;
  }

  .chip-header-sep {
    color: var(--n-text-color-3, #ccc);
  }

  .chip-header-name {
    font-weight: 700;
    font-size: 16px;
    color: var(--n-text-color, #333);
  }

  .chip-header-path {
    margin-left: 16px;
    font-size: 11px;
    color: var(--n-text-color-3, #999);
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── Platform Table (保留兼容) ───────────────────────────────────────

// ── Runtime Row ─────────────────────────────────────────────────────
.runtime-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.platform-table {
  .pt-header {
    display: grid;
    grid-template-columns: 130px 1fr 70px 140px;
    gap: 8px;
    padding: 6px 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--n-text-color-3, #999);
    border-bottom: 2px solid var(--n-border-color, #eee);
  }
  .pt-row {
    display: grid;
    grid-template-columns: 130px 1fr 70px 140px;
    gap: 8px;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--n-border-color, #f5f5f5);
    font-size: 13px;
    transition: background .15s;
    &:hover { background: var(--n-color-hover, #fafafa); }
    &:last-child { border-bottom: none; }
  }
  .pt-row-active {
    background: var(--n-color-target, #f0f7ff) !important;
    border-left: 3px solid var(--n-color-primary, #18a058);
  }
  .pt-col-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .pt-active-badge {
      display: inline-block;
      color: var(--n-color-primary, #18a058);
      font-size: 11px;
      margin-left: 4px;
      font-weight: 600;
    }
  }
  .pt-col-path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    font-size: 12px;
    color: var(--n-text-color-3, #999);
  }
  .pt-col-source { text-align: center; }
  .pt-col-actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
  }
}

// ── Module Editor ────────────────────────────────────────────────────
.module-editor {
  margin-bottom: 8px;
}

// ── Param Column ─────────────────────────────────────────────────────
.param-col {
  display: flex;
  align-items: center;
  gap: 8px;
  .param-label {
    min-width: 80px;
    font-weight: 500;
  }
}

.history-row {
  display: grid;
  grid-template-columns: 100px 90px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--n-border-color, #eee);

  &:last-child {
    border-bottom: none;
  }
}

.history-name {
  font-weight: 600;
}

.history-tag {
  justify-self: start;
}

.history-detail {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
