<template>
  <div v-if="candidates.length" class="radar app-card q-pa-md">
    <div class="row items-center no-wrap">
      <span class="text-subtitle1 text-weight-bold">📡 字靈雷達</span>
      <q-space />
      <span class="text-caption text-weight-bold">🍬 {{ candyCount }} 顆</span>
    </div>
    <div class="text-caption text-muted q-mb-sm">
      <template v-if="target !== null">
        正在找<b>{{ nameOf(target) }}</b
        >，在這裡探險比較容易遇到牠！收服後雷達會關掉。
      </template>
      <template v-else>
        花 🍬
        {{ RADAR_COST }} 顆鎖定一隻還沒收服的字靈，在這裡探險比較容易遇到牠。看中文提示猜猜看是誰！
      </template>
    </div>
    <div class="radar__list">
      <button
        v-for="id in candidates"
        :key="id"
        type="button"
        class="radar__item"
        :class="{ 'radar__item--target': id === target, 'radar__item--picked': id === picked }"
        @click="picked = id"
      >
        <span v-if="id === target" class="radar__ping">📡</span>
        <CreatureView
          :species="getSpecies(id)"
          :size="56"
          :silhouette="!store.isSeen(id)"
          :animated="false"
        />
        <span class="radar__name">{{ nameOf(id) }}</span>
        <span class="radar__hint">{{ getSpecies(id).meaning }}</span>
      </button>
    </div>
    <q-btn
      v-if="picked !== null && picked !== target"
      class="btn-3d full-width q-mt-sm"
      color="indigo-5"
      icon="gps_fixed"
      :disable="candyCount < RADAR_COST"
      :label="
        candyCount >= RADAR_COST
          ? `用 🍬 ${RADAR_COST} 顆鎖定${nameOf(picked)}`
          : `糖果不夠，要 🍬 ${RADAR_COST} 顆`
      "
      @click="lock"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { sfx } from 'src/modules/Games/shared';
import type { Area } from '../domain/areas';
import { RADAR_COST, radarCandidates } from '../domain/radar';
import { getSpecies } from '../domain/species';
import { candyCount } from '../store/candy';
import { useAdventureStore } from '../store/useAdventureStore';
import CreatureView from './CreatureView.vue';

const props = defineProps<{ area: Area }>();
const store = useAdventureStore();

const candidates = computed(() => radarCandidates(props.area, store.isCaught));
const target = computed(() => store.radarTargetIn(props.area));
/** 點了還沒鎖定的字靈，按下按鈕才花糖果（避免誤觸） */
const picked = ref<number | null>(null);

/** 沒遇過的字靈不知道名字，只看得到剪影和中文提示 */
const nameOf = (id: number) => (store.isSeen(id) ? getSpecies(id).name : '神秘字靈');

const lock = () => {
  if (picked.value === null || !store.lockRadar(props.area, picked.value)) return;
  picked.value = null;
  sfx.correct();
};
</script>

<style scoped>
.radar__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.radar__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 84px;
  padding: 6px 4px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.08);
  font: inherit;
  cursor: pointer;
}
.radar__item--picked {
  border-color: #818cf8;
}
.radar__item--target {
  border-color: #4f46e5;
  background: rgba(99, 102, 241, 0.18);
}
.radar__ping {
  position: absolute;
  top: 2px;
  right: 4px;
  animation: ping 1.2s ease-in-out infinite;
}
.radar__name {
  font-size: 0.75rem;
  font-weight: 700;
}
.radar__hint {
  font-size: 0.7rem;
  color: #6b7280;
}
@keyframes ping {
  50% {
    opacity: 0.35;
  }
}
</style>
