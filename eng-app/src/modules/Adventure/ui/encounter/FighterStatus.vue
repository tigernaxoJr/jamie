<template>
  <div class="status">
    <div class="row items-center no-wrap q-gutter-x-xs">
      <b>{{ name }}</b>
      <span class="text-caption">Lv {{ level }}</span>
      <ElementBadge :element="element" />
    </div>
    <q-linear-progress
      :value="hp / max"
      :color="hpColor(hp / max)"
      track-color="grey-3"
      size="10px"
      rounded
      class="q-mt-xs"
    />
    <div class="row items-center text-caption">
      <span>{{ hp }} / {{ max }}</span>
      <q-space />
      <span v-if="pips.length > 1" class="pips">
        <span
          v-for="p in pips"
          :key="p.key"
          class="pip"
          :class="{ 'pip--mine': mine, 'pip--down': p.down }"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Element } from '../../domain/elements';
import ElementBadge from '../ElementBadge.vue';

/** 對戰中一方的名牌：名字、等級、屬性、血條，以及隊伍還剩幾隻 */
withDefaults(
  defineProps<{
    name: string;
    level: number;
    element: Element;
    hp: number;
    max: number;
    /** 隊伍每隻一顆小圓點，倒下的變灰 */
    pips?: { key: string | number; down: boolean }[];
    /** 我方用綠色圓點，對手用紅色 */
    mine?: boolean;
  }>(),
  { pips: () => [], mine: false },
);

const hpColor = (ratio: number) => (ratio > 0.5 ? 'positive' : ratio > 0.2 ? 'orange' : 'negative');
</script>

<style scoped lang="scss">
.status {
  min-width: 150px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.pips {
  display: inline-flex;
  gap: 3px;
}
.pip {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: $negative;
}
.pip--mine {
  background: $positive;
}
.pip--down {
  background: #cbd5e1;
}
@media (max-width: 599px) {
  .status {
    min-width: 130px;
  }
}
</style>
