<template>
  <div class="app-card q-pa-md">
    <div class="text-weight-bold q-mb-sm">
      {{ forced ? '要派誰上場？' : '要換誰上場？（會用掉這一回合）' }}
    </div>
    <div class="bench">
      <button
        v-for="c in team"
        :key="c.uid"
        type="button"
        class="bench__member"
        :disabled="c.uid === activeUid || (hp[c.uid] ?? 0) <= 0"
        @click="$emit('pick', c.uid)"
      >
        <CreatureSvg
          :species="getSpecies(c.speciesId)"
          :size="56"
          :animated="false"
          :evolved="(c.stage ?? 1) >= 2"
        />
        <span class="text-weight-bold">{{ creatureName(getSpecies(c.speciesId), c.stage) }}</span>
        <span class="text-caption">Lv {{ c.level }} · ❤️ {{ hp[c.uid] ?? 0 }}</span>
      </button>
    </div>
    <div v-if="!forced" class="text-right q-mt-sm">
      <q-btn flat color="grey-7" label="取消" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { creatureName, getSpecies } from '../../domain/species';
import type { OwnedCreature } from '../../store/useAdventureStore';
import CreatureSvg from '../CreatureSvg.vue';

/** 換字靈：場上的和已倒下的不能選；被迫換人（目前的倒下）時不能取消 */
defineProps<{
  team: OwnedCreature[];
  hp: Record<string, number>;
  activeUid: string;
  forced: boolean;
}>();
defineEmits<{
  (e: 'pick', uid: string): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped lang="scss">
.bench {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.bench__member {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border: 2px solid var(--app-line);
  border-radius: 14px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: $primary;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}
</style>
