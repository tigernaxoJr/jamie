<template>
  <div class="app-card q-pa-md">
    <div class="row items-center q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">📊 學習狀況</div>
      <q-space />
      <button type="button" class="total" @click="$emit('clickStat', 'count')">
        全部 {{ meta.count }} 字 ›
      </button>
    </div>

    <div class="group-label text-negative">要加油 · 連續答錯</div>
    <div class="tiles q-mb-sm">
      <button
        v-for="t in errorTiles"
        :key="t.key"
        type="button"
        class="tile tile--bad"
        @click="$emit('clickStat', t.key)"
      >
        <span class="tile__value">{{ meta[t.key] }}</span>
        <span class="tile__label">{{ t.label }}</span>
      </button>
    </div>

    <div class="group-label text-positive">越來越熟 · 連續答對</div>
    <div class="tiles">
      <button
        v-for="t in correctTiles"
        :key="t.key"
        type="button"
        class="tile tile--good"
        @click="$emit('clickStat', t.key)"
      >
        <span class="tile__value">{{ meta[t.key] }}</span>
        <span class="tile__label">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuizMeta } from '../../domain';

defineProps<{ meta: QuizMeta }>();
defineEmits<{
  (e: 'clickStat', type: string): void;
}>();

type Key = Exclude<keyof QuizMeta, 'count'>;
const errorTiles: { key: Key; label: string }[] = [
  { key: 'e1', label: '1 次' },
  { key: 'e2', label: '2 次' },
  { key: 'e3', label: '3 次以上' },
];
const correctTiles: { key: Key; label: string }[] = [
  { key: 'c1', label: '1 次' },
  { key: 'c2', label: '2 次' },
  { key: 'c3', label: '3 次以上 ⭐' },
];
</script>

<style scoped lang="scss">
.total {
  border: none;
  background: none;
  font: inherit;
  font-weight: 800;
  color: $primary;
  cursor: pointer;
}
.group-label {
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 4px;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border: none;
  border-radius: 14px;
  font: inherit;
  cursor: pointer;
  transition: transform 0.12s;
  &:hover {
    transform: translateY(-2px);
  }
}
.tile--bad {
  background: #fef2f2;
  color: #b91c1c;
}
.tile--good {
  background: #f0fdf4;
  color: #15803d;
}
.tile__value {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.1;
}
.tile__label {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.85;
}
</style>
