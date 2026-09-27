<template>
  <section class="app-card q-pa-lg">
    <div class="text-h6">💾 備份與還原</div>
    <div class="text-muted q-mt-xs">
      學習進度只存在這台裝置的瀏覽器裡。清除瀏覽器資料、換手機時會全部不見，建議定期備份。
    </div>
    <div class="q-mt-sm text-weight-bold" :class="lastBackupClass">
      {{ lastBackupText }}
    </div>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-sm-6">
        <div class="text-subtitle2 q-mb-xs">備份</div>
        <div class="column q-gutter-sm">
          <q-btn
            class="btn-3d"
            color="primary"
            icon="download"
            label="下載備份檔"
            @click="download"
          />
          <q-btn outline color="primary" icon="content_copy" label="複製備份文字" @click="copy" />
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="text-subtitle2 q-mb-xs">還原</div>
        <div class="column q-gutter-sm">
          <q-btn
            outline
            color="orange-9"
            icon="upload_file"
            label="選擇備份檔"
            @click="fileInput?.click()"
          />
          <q-btn
            outline
            color="orange-9"
            icon="content_paste"
            label="貼上備份文字"
            @click="pasteOpen = true"
          />
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json,text/plain"
          hidden
          @change="onFile"
        />
      </div>
    </div>

    <div v-if="message" class="message q-mt-md" :class="message.type">{{ message.text }}</div>

    <!-- 貼上備份文字 -->
    <q-dialog v-model="pasteOpen">
      <q-card class="q-pa-md" style="width: 520px; max-width: 95vw">
        <div class="text-h6 q-mb-sm">貼上備份文字</div>
        <textarea
          v-model="pasted"
          class="paste"
          placeholder="把「複製備份文字」得到的內容貼在這裡"
        />
        <div class="row justify-end q-gutter-sm q-mt-sm">
          <q-btn flat color="grey-8" label="取消" v-close-popup />
          <q-btn
            color="primary"
            label="下一步"
            :disable="!pasted.trim()"
            @click="prepare(pasted)"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- 確認還原 -->
    <q-dialog v-model="confirmOpen" persistent>
      <q-card v-if="pending" class="q-pa-md" style="width: 420px; max-width: 95vw">
        <div class="row items-center no-wrap q-mb-sm">
          <q-icon name="warning" color="orange-9" size="28px" class="q-mr-sm" />
          <div class="text-h6">確定要還原嗎？</div>
        </div>
        <div>這台裝置<b>目前的進度會被備份內容取代</b>，無法復原。</div>
        <ul class="q-mt-sm q-mb-none">
          <li>備份時間：{{ pending.summary.exportedAt.toLocaleString() }}</li>
          <li>單字答題記錄：{{ pending.summary.words }} 個字</li>
          <li>收服的字靈：{{ pending.summary.creatures }} 隻</li>
        </ul>
        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn flat color="grey-8" label="取消" v-close-popup />
          <q-btn color="orange-9" label="確定還原" @click="restore" />
        </div>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  type Backup,
  BackupError,
  createBackup,
  parseBackup,
  restoreBackup,
  summarizeBackup,
} from '../backup';

const lastBackupAt = useLocalStorage<number>('last-backup-at', 0);
const daysSince = computed(() =>
  lastBackupAt.value ? Math.floor((Date.now() - lastBackupAt.value) / 86_400_000) : null,
);
const lastBackupText = computed(() => {
  if (daysSince.value === null) return '⚠️ 還沒有備份過';
  if (daysSince.value === 0) return '✅ 今天已經備份過';
  return `上次備份：${daysSince.value} 天前`;
});
const lastBackupClass = computed(() =>
  daysSince.value === null || daysSince.value > 14 ? 'text-orange-9' : 'text-positive',
);

const message = ref<{ type: 'ok' | 'error'; text: string } | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const pasteOpen = ref(false);
const pasted = ref('');
const confirmOpen = ref(false);
const pending = ref<{ backup: Backup; summary: ReturnType<typeof summarizeBackup> } | null>(null);

const backupText = () => {
  lastBackupAt.value = Date.now();
  return JSON.stringify(createBackup(localStorage));
};

const download = () => {
  const blob = new Blob([backupText()], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `jamie-english-backup-${date}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  message.value = { type: 'ok', text: '已下載備份檔，請保存在雲端硬碟或傳給自己。' };
};

const copy = async () => {
  try {
    await navigator.clipboard.writeText(backupText());
    message.value = { type: 'ok', text: '已複製！可以貼到 LINE、Email 或備忘錄保存。' };
  } catch {
    message.value = { type: 'error', text: '這個瀏覽器不允許複製，請改用「下載備份檔」。' };
  }
};

const prepare = (text: string) => {
  try {
    const backup = parseBackup(text);
    pending.value = { backup, summary: summarizeBackup(backup) };
    pasteOpen.value = false;
    confirmOpen.value = true;
  } catch (e) {
    message.value = {
      type: 'error',
      text: e instanceof BackupError ? e.message : '無法讀取備份內容',
    };
    pasteOpen.value = false;
  }
};

const onFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (file) prepare(await file.text());
};

const restore = () => {
  if (!pending.value) return;
  restoreBackup(localStorage, pending.value.backup);
  // 各頁面的資料是啟動時從 localStorage 讀的，重新載入最乾淨
  window.location.reload();
};
</script>

<style scoped>
.message {
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
}
.message.ok {
  background: #f0fdf4;
  color: #15803d;
}
.message.error {
  background: #fef2f2;
  color: #b91c1c;
}
.paste {
  width: 100%;
  min-height: 160px;
  padding: 10px;
  border: 2px solid var(--app-line);
  border-radius: 12px;
  font: inherit;
  font-size: 0.8rem;
  resize: vertical;
}
</style>
