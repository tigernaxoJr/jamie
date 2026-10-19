<template>
  <q-dialog :model-value="type !== null" @update:model-value="(v) => !v && (type = null)">
    <q-card style="width: 90vw; max-width: 900px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round v-close-popup aria-label="關閉" />
      </q-card-section>
      <q-card-section>
        <StatWordList :words="filtered" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { QuizWord } from '../../domain';
import StatWordList from './StatWordList.vue';

/** 點統計數字後列出對應的單字；type 為 null 時關閉 */
const props = defineProps<{ words: QuizWord[] }>();
const type = defineModel<string | null>('type', { required: true });

const STATS: Record<string, { title: string; match: (w: QuizWord) => boolean }> = {
  count: { title: '全部單字', match: () => true },
  e1: { title: '連續答錯 1 次', match: (w) => w.errorRec.consecutive === 1 },
  e2: { title: '連續答錯 2 次', match: (w) => w.errorRec.consecutive === 2 },
  e3: { title: '連續答錯 3 次以上', match: (w) => w.errorRec.consecutive >= 3 },
  c1: { title: '連續答對 1 次', match: (w) => w.correctRec.consecutive === 1 },
  c2: { title: '連續答對 2 次', match: (w) => w.correctRec.consecutive === 2 },
  c3: { title: '連續答對 3 次以上', match: (w) => w.correctRec.consecutive >= 3 },
};

// 關閉時保留上一次的內容，淡出動畫期間才不會閃成空清單
const shown = ref(type.value);
watch(type, (t) => {
  if (t !== null) shown.value = t;
});
const stat = computed(() => (shown.value ? STATS[shown.value] : undefined));
const title = computed(() => stat.value?.title ?? '單字清單');
const filtered = computed(() => (stat.value ? props.words.filter(stat.value.match) : []));
</script>
