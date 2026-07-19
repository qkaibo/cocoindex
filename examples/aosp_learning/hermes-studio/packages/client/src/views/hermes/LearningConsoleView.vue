<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  NCard, NTabs, NTabPane, NButton, NSwitch, NInputNumber,
  NTag, NProgress, NStatistic, NGrid, NGi, NSelect,
  NSpace, NSpin, NLog, NModal, NInput,
  useMessage,
} from "naive-ui";
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
}

interface RuntimeConfig {
  max_workers: number;
  timeout: number;
  max_inflight: number;
}

interface PlatformInfo {
  name: string;
  aosp_root: string;
  wiki_root: string;
  modules: string[];
  source?: string;
}


interface AppConfig {
  platform: string;
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
  platform: "aw_h618",
  modules: ["BSP", "FRAMEWORK", "APP"],
  activeModule: "BSP",
  runtime: { max_workers: 256, timeout: 300, max_inflight: 4096 },
});
const allModules = ref<ModuleInfo[]>([]);
const platforms = ref<PlatformInfo[]>([]);
const configLoading = ref(false);

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
    config.value = await res.json();
  } catch (e) {
    message.error(t("learningConsole.configFetchFailed"));
  } finally {
    configLoading.value = false;
  }
}

async function fetchModules(platform?: string) {
  try {
    const p = platform || config.value.platform;
    const res = await fetch(`${API_BASE}/api/learning/modules?platform=${p}`);
    allModules.value = await res.json();
  } catch (e) {
    // silent
  }
}

async function fetchPlatforms() {
  try {
    const res = await fetch(`${API_BASE}/api/learning/platforms`);
    platforms.value = await res.json();
  } catch (e) {
    // silent
  }
}

// 切换平台时刷新模块列表
async function onPlatformChange(platform: string) {
  config.value.platform = platform;
  config.value.modules = [];
  config.value.activeModule = "";
  await fetchModules(platform);
  if (allModules.value.length > 0) {
    config.value.modules = allModules.value.map(m => m.name);
    config.value.activeModule = allModules.value[0].name;
    selectedModule.value = allModules.value[0].name;
  }
}

// ── 平台管理 ──────────────────────────────────────────────────────────
const showPlatformForm = ref(false);
const editingPlatform = ref<string>("");
const platformForm = ref({ name: "", aosp_root: "", wiki_root: "./aosp_wiki", modules_json: "" });

function openNewPlatform() {
  editingPlatform.value = "";
  platformForm.value = { name: "", aosp_root: "", wiki_root: "./aosp_wiki", modules_json: "[]" };
  showPlatformForm.value = true;
}

async function savePlatform() {
  const body = {
    name: platformForm.value.name,
    aosp_root: platformForm.value.aosp_root,
    wiki_root: platformForm.value.wiki_root,
    modules: [
      { name: "BSP", code_globs: ["**/hardware/**", "**/device/**", "**/vendor/**"], wiki_dir: "bsp", description: "板级支持包" },
      { name: "FRAMEWORK", code_globs: ["**/frameworks/**", "**/system/**"], wiki_dir: "framework", description: "Framework层" },
      { name: "APP", code_globs: ["**/packages/**", "**/cts/**"], wiki_dir: "app", description: "应用层" },
    ],
  };
  try {
    const method = editingPlatform.value ? "PUT" : "POST";
    const url = editingPlatform.value
      ? `${API_BASE}/api/learning/platforms/${editingPlatform.value}`
      : `${API_BASE}/api/learning/platforms`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      message.success(editingPlatform.value ? "平台已更新" : "平台已添加");
      showPlatformForm.value = false;
      await fetchPlatforms();
    } else {
      const err = await res.json();
      message.error(err.detail || "操作失败");
    }
  } catch (e: any) {
    message.error("操作失败: " + (e.message || ""));
  }
}

async function deletePlatform(name: string) {
  try {
    const res = await fetch(`${API_BASE}/api/learning/platforms/${name}`, { method: "DELETE" });
    if (res.ok) {
      message.success(`平台 ${name} 已删除`);
      await fetchPlatforms();
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
  await Promise.all([fetchConfig(), fetchPlatforms(), fetchModules(), fetchStatus(), fetchGpu()]);
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

    <NTabs v-model:value="activeTab" type="line" animated>
      <!-- ═══ Tab 1: 配置 ═══ -->
      <NTabPane name="config" :tab="t('learningConsole.configTab')">
        <NSpin :show="configLoading">
          <NGrid :cols="2" :x-gap="16" :y-gap="16">
            <!-- 平台选择 -->
            <NGi :span="2">
              <NCard :title="t('learningConsole.projectInfo')" size="small" bordered>
                <NSpace vertical size="small" style="width: 100%">
                  <div class="param-row">
                    <span class="param-label">芯片平台</span>
                    <NSelect
                      :value="config.platform"
                      :options="platforms.map(p => ({ label: p.name + (p.source === 'user' ? ' ✏️' : ''), value: p.name }))"
                      style="width: 240px"
                      @update:value="onPlatformChange"
                    />
                    <NButton size="tiny" @click="openNewPlatform">+ 添加</NButton>
                    <NButton
                      v-if="config.platform && platforms.find(p => p.name === config.platform)?.source === 'user'"
                      size="tiny" type="error"
                      @click="deletePlatform(config.platform)"
                    >删除</NButton>
                  </div>
                  <div v-if="config.platform" class="dim-text" style="font-size: 12px">
                    AOSP: {{ platforms.find(p => p.name === config.platform)?.aosp_root || '' }}
                  </div>
                </NSpace>
              </NCard>
            </NGi>

            <!-- 模块列表 -->
            <NGi :span="2">
              <NCard :title="t('learningConsole.modules')" size="small" bordered>
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
                  </div>
                </div>
              </NCard>
            </NGi>

            <!-- 运行时参数 -->
            <NGi :span="2">
              <NCard :title="t('learningConsole.runtimeParams')" size="small" bordered>
                <NSpace vertical size="medium" style="width: 100%">
                  <div class="param-row">
                    <span class="param-label">{{ t("learningConsole.maxWorkers") }}</span>
                    <NInputNumber
                      v-model:value="config.runtime.max_workers"
                      :min="1" :max="1024" style="width: 200px"
                    />
                  </div>
                  <div class="param-row">
                    <span class="param-label">{{ t("learningConsole.timeout") }}</span>
                    <NInputNumber
                      v-model:value="config.runtime.timeout"
                      :min="30" :max="3600" style="width: 200px"
                    />
                    <span class="dim-text">s</span>
                  </div>
                  <div class="param-row">
                    <span class="param-label">{{ t("learningConsole.maxInflight") }}</span>
                    <NInputNumber
                      v-model:value="config.runtime.max_inflight"
                      :min="64" :max="16384" style="width: 200px"
                    />
                  </div>
                </NSpace>
              </NCard>
            </NGi>

            <!-- 保存 -->
            <NGi :span="2">
              <NButton type="primary" :loading="loading" @click="saveConfig" block>
                {{ t("learningConsole.saveConfig") }}
              </NButton>
            </NGi>
          </NGrid>
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

    <!-- 平台添加/编辑弹窗 -->
    <NModal v-model:show="showPlatformForm" :title="editingPlatform ? '编辑平台' : '添加平台'">
      <NCard style="width: 500px" :bordered="false" size="small">
        <NSpace vertical size="medium" style="width: 100%">
          <div class="param-row">
            <span class="param-label">平台名</span>
            <NInput v-model:value="platformForm.name" :disabled="!!editingPlatform" placeholder="例如 mtk_6893" style="width: 240px" />
          </div>
          <div class="param-row">
            <span class="param-label">AOSP 路径</span>
            <NInput v-model:value="platformForm.aosp_root" placeholder="/path/to/aosp/root" style="width: 400px" />
          </div>
          <div class="param-row">
            <span class="param-label">Wiki 路径</span>
            <NInput v-model:value="platformForm.wiki_root" placeholder="./aosp_wiki" style="width: 240px" />
          </div>
          <NSpace>
            <NButton type="primary" @click="savePlatform">{{ editingPlatform ? '保存' : '添加' }}</NButton>
            <NButton @click="showPlatformForm = false">取消</NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped lang="scss">
.learning-console {
  padding: 24px;
  max-width: 960px;
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
