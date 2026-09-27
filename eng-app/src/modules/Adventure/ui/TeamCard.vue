<template>
  <div class="app-card q-pa-md">
    <div class="row items-center q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">🤝 我的隊伍</div>
      <q-space />
      <q-btn flat dense color="primary" icon="menu_book" label="管理隊伍" to="/adventure/dex" />
    </div>
    <div class="team">
      <div v-for="(c, i) in slots" :key="c?.uid ?? `empty-${i}`" class="member">
        <template v-if="c">
          <span v-if="i === 0" class="member__leader">隊長</span>
          <span v-if="store.evolveStatus(c).canEvolve" class="member__evolve">可以進化！</span>
          <CreatureSvg
            :species="getSpecies(c.speciesId)"
            :size="80"
            :evolved="(c.stage ?? 1) >= 2"
          />
          <div class="text-weight-bold ellipsis full-width text-center">
            {{ creatureName(getSpecies(c.speciesId), c.stage) }}
          </div>
          <div class="row items-center q-gutter-x-xs">
            <span class="text-caption text-weight-bold">Lv {{ c.level }}</span>
            <ElementBadge :element="getSpecies(c.speciesId).element" />
          </div>
          <q-linear-progress
            :value="c.xp / xpToNext(c.level)"
            color="accent"
            track-color="grey-3"
            size="6px"
            rounded
            class="q-mt-xs"
          />
        </template>
        <div v-else class="member__empty">
          <q-icon name="add" size="28px" />
          <div class="text-caption">從圖鑑加入</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { creatureName, getSpecies } from '../domain/species';
import { TEAM_SIZE, xpToNext } from '../domain/rules';
import { useAdventureStore } from '../store/useAdventureStore';
import CreatureSvg from './CreatureSvg.vue';
import ElementBadge from './ElementBadge.vue';

const store = useAdventureStore();
const slots = computed(() => Array.from({ length: TEAM_SIZE }, (_, i) => store.team[i]));
</script>

<style scoped lang="scss">
.team {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.member {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 10px 8px;
  border-radius: 16px;
  background: #f5f7fa;
}
.member__leader,
.member__evolve {
  position: absolute;
  top: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
}
.member__leader {
  left: 6px;
  background: $primary;
  color: #fff;
}
.member__evolve {
  right: 6px;
  background: #fef3c7;
  color: #b45309;
  animation: pulse 1.2s ease-in-out infinite;
}
.member__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  color: #94a3b8;
}
@keyframes pulse {
  50% {
    transform: scale(1.08);
  }
}
</style>
