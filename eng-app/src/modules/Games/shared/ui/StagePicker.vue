<template>
  <div class="picker">
    <div class="picker__head">
      <span>選擇關卡</span>
      <span>⭐ {{ totalStars }} / {{ stages.length * 3 }}</span>
    </div>
    <div class="stages">
      <button
        v-for="(st, i) in stages"
        :key="st.name"
        type="button"
        class="stage-btn"
        :class="{ on: sameSelection(modelValue, { kind: 'stage', index: i }) }"
        :disabled="!isStageUnlocked(i, stars)"
        @click="$emit('update:modelValue', { kind: 'stage', index: i })"
      >
        <span class="stage-btn__emoji">{{ isStageUnlocked(i, stars) ? st.emoji : '🔒' }}</span>
        <span class="stage-btn__name">{{ i + 1 }}. {{ st.name }}</span>
        <span class="stage-btn__stars">
          <span v-for="n in 3" :key="n" :class="{ lit: n <= (stars[i] ?? 0) }">★</span>
        </span>
      </button>
      <button
        type="button"
        class="stage-btn stage-btn--endless"
        :class="{ on: modelValue.kind === 'endless' }"
        @click="$emit('update:modelValue', { kind: 'endless' })"
      >
        <span class="stage-btn__emoji">♾️</span>
        <span class="stage-btn__name">無盡模式</span>
        <span class="stage-btn__stars">挑戰最高分</span>
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type StageCard, type StageSelection, isStageUnlocked, sameSelection } from '../stages';

const props = defineProps<{
  stages: readonly StageCard[];
  stars: readonly number[];
  modelValue: StageSelection;
}>();
defineEmits<{ (e: 'update:modelValue', v: StageSelection): void }>();

const totalStars = computed(() => props.stars.reduce((sum, n) => sum + (n ?? 0), 0));
</script>

<style scoped>
.picker {
  max-width: 560px;
  margin: 0 auto;
  text-align: left;
}
.picker__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 800;
}
.stages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.stage-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 6px 4px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.stage-btn.on {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.22);
}
.stage-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.stage-btn__emoji {
  font-size: 1.5rem;
  line-height: 1.2;
}
.stage-btn__name {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.stage-btn__stars {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.35);
}
.stage-btn__stars .lit {
  color: #fbbf24;
}
.stage-btn--endless .stage-btn__stars {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
}
</style>
