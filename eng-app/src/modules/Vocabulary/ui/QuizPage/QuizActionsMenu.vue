<template>
  <q-btn flat round icon="more_vert" color="grey-8" aria-label="更多選項">
    <q-menu anchor="bottom right" self="top right">
      <q-list style="min-width: 240px">
        <q-item v-close-popup clickable @click="$emit('changeTopic')">
          <q-item-section avatar><q-icon name="category" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label>換主題</q-item-label>
            <q-item-label caption>保留所有答題記錄</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item v-close-popup clickable @click="confirmReset = true">
          <q-item-section avatar>
            <q-icon name="restart_alt" color="orange-8" />
          </q-item-section>
          <q-item-section>
            <q-item-label>重新開始</q-item-label>
            <q-item-label caption>清除這些主題的記錄</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="confirmClear = true">
          <q-item-section avatar>
            <q-icon name="delete_forever" color="negative" />
          </q-item-section>
          <q-item-section>
            <q-item-label>清除所有記憶</q-item-label>
            <q-item-label caption>所有主題的記錄都會清掉</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>

  <!-- 重新開始確認對話框 -->
  <q-dialog v-model="confirmReset" persistent>
    <q-card class="q-pa-sm" style="min-width: 320px; max-width: 420px">
      <q-card-section class="row items-center no-wrap">
        <q-icon name="restart_alt" color="orange-8" size="2rem" class="q-mr-sm" />
        <span class="text-h6">確認重新開始？</span>
      </q-card-section>
      <q-card-section class="q-pt-none">
        會清除<strong>目前所選主題</strong>的答題記錄（答對、答錯次數等），其他主題不受影響。
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn label="確認重新開始" color="orange-8" @click="confirm('reset')" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 清除所有記憶確認對話框 -->
  <q-dialog v-model="confirmClear" persistent>
    <q-card class="q-pa-sm" style="min-width: 320px; max-width: 420px">
      <q-card-section class="row items-center no-wrap">
        <q-icon name="warning" color="negative" size="2rem" class="q-mr-sm" />
        <span class="text-h6">確認清除所有記憶？</span>
      </q-card-section>
      <q-card-section class="q-pt-none">
        會清除<strong>所有主題、所有單字</strong>的答題記錄，而且無法復原。
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn label="確認清除全部" color="negative" @click="confirm('clearAll')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/** 測驗頁右上角選單：換主題、重新開始、清除所有記憶（後兩項會先跳確認） */
const emit = defineEmits<{
  (e: 'changeTopic' | 'reset' | 'clearAll'): void;
}>();

const confirmReset = ref(false);
const confirmClear = ref(false);

const confirm = (action: 'reset' | 'clearAll') => {
  confirmReset.value = false;
  confirmClear.value = false;
  emit(action);
};
</script>
