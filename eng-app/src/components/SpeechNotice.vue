<template>
  <div v-if="visible" class="speech-notice row items-center no-wrap q-px-md q-py-sm">
    <q-icon name="volume_off" size="22px" class="q-mr-sm" />
    <div class="col text-body2">
      <b>這台裝置沒有英文語音，發音按鈕可能沒有聲音。</b>
      <span class="gt-xs">
        可以到系統設定的「文字轉語音」下載英文語音，或按單字旁的
        <q-icon name="translate" size="16px" /> 用 Google 翻譯聽發音。
      </span>
    </div>
    <q-btn flat dense no-caps label="知道了" @click="dismissed = true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { speechStatus } from 'src/modules/Vocabulary';

const dismissed = useLocalStorage('speech-notice-dismissed', false);
const visible = computed(
  () =>
    !dismissed.value &&
    (speechStatus.value === 'no-english' || speechStatus.value === 'unsupported'),
);
</script>

<style scoped>
.speech-notice {
  background: #fff7e6;
  color: #92400e;
  border-bottom: 1px solid #fde68a;
}
</style>
