<template>
  <q-page padding>
    <div class="hub q-mx-auto">
      <div class="text-h4 text-weight-bold q-mb-xs">🎮 遊戲中心</div>
      <div class="text-subtitle1 text-grey-7 q-mb-lg">
        邊玩邊背單字！遊戲會用你選的單字範圍出題。
      </div>

      <div class="grid">
        <q-card
          v-for="{ card, path } in gameEntries"
          :key="card.id"
          v-ripple
          class="game-card soft-shadow cursor-pointer"
          @click="router.push(`/${path}`)"
        >
          <div class="banner" :class="`bg-${card.color}`">{{ card.icon }}</div>
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="text-h6 text-weight-bold">{{ card.title }}</div>
              <q-space />
              <q-chip dense outline :color="card.color">{{ card.skill }}</q-chip>
            </div>
            <div class="text-body2 text-grey-8 q-mt-xs">{{ card.description }}</div>
            <div class="row items-center q-mt-sm text-caption">
              <span v-if="card.desktopOnly" class="text-orange-9">💻 限電腦版</span>
              <q-space />
              <span v-if="best[card.id]" class="text-weight-medium"
                >🏅 最高分 {{ best[card.id] }}</span
              >
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { gameEntries } from '../registry';
import { bestScoreKey } from '../shared/useGameSession';

const router = useRouter();

const readBest = (id: string): number => {
  try {
    return Number(localStorage.getItem(bestScoreKey(id))) || 0;
  } catch {
    return 0;
  }
};
const best = Object.fromEntries(gameEntries.map((e) => [e.card.id, readBest(e.card.id)]));
</script>

<style scoped>
.hub {
  max-width: 1000px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.game-card {
  overflow: hidden;
  transition: transform 0.2s;
}
.game-card:hover {
  transform: translateY(-4px);
}
.banner {
  font-size: 3.5rem;
  text-align: center;
  padding: 12px 0;
}
</style>
