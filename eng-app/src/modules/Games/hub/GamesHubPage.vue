<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle emoji="🎮" title="遊戲中心" subtitle="邊玩邊背單字！遊戲會用你選的主題出題" />

      <div class="grid">
        <router-link
          v-for="{ card, path } in gameEntries"
          :key="card.id"
          :to="`/${path}`"
          class="game app-card app-card--hover"
        >
          <div class="game__art" :class="`bg-${card.color}`">
            <span class="game__icon">{{ card.icon }}</span>
          </div>
          <div class="q-pa-md">
            <div class="row items-center no-wrap q-mb-xs">
              <div class="text-h6">{{ card.title }}</div>
              <q-space />
              <span class="skill" :class="`text-${card.color}`">{{ card.skill }}</span>
            </div>
            <div class="text-muted">{{ card.description }}</div>
            <div class="row items-center q-mt-sm text-caption text-weight-bold">
              <span v-if="card.desktopOnly" class="text-orange-9">💻 限電腦版</span>
              <span v-else-if="progress[card.id]" class="progress">{{ progress[card.id] }}</span>
              <q-space />
              <span v-if="best[card.id]"
                >🏅 {{ card.stageBased ? '無盡 ' : '' }}{{ best[card.id] }}</span
              >
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import PageTitle from 'src/components/PageTitle.vue';
import { gameEntries } from '../registry';
import type { GameCard } from '../shared/types';
import { bestScoreKey } from '../shared/useGameSession';

const readBest = (card: GameCard): number => {
  try {
    return Number(localStorage.getItem(bestScoreKey(card))) || 0;
  } catch {
    return 0;
  }
};
const best = Object.fromEntries(gameEntries.map((e) => [e.card.id, readBest(e.card)]));
const progress = Object.fromEntries(
  gameEntries.map((e) => [e.card.id, e.card.progress?.() ?? null]),
);
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.game {
  display: block;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
}
.game__art {
  position: relative;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: radial-gradient(rgba(255, 255, 255, 0.18) 2px, transparent 2px);
  background-size: 18px 18px;
}
.game__icon {
  font-size: 3.6rem;
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.25));
  transition: transform 0.2s;
}
.game:hover .game__icon {
  transform: scale(1.12) rotate(-6deg);
}
.progress {
  color: #b45309;
}
.skill {
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}
</style>
