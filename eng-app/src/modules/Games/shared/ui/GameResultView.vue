<template>
  <div class="result-card app-card q-pa-lg text-center">
    <div class="result-emoji">{{ result.won ? '🏆' : '💪' }}</div>
    <div class="text-h5 text-weight-bold q-mt-sm">{{ result.headline }}</div>

    <div class="score text-primary q-mt-md">{{ result.score }}</div>
    <div class="text-caption text-grey-7">分數</div>
    <q-chip v-if="isNewBest" color="amber" text-color="black" icon="emoji_events" class="q-mt-sm">
      新紀錄！
    </q-chip>
    <div v-else class="text-caption text-grey-6 q-mt-sm">最高分 {{ bestScore }}</div>

    <div class="row justify-center q-gutter-sm q-mt-md">
      <q-chip v-for="s in result.stats" :key="s.label" outline color="primary">
        {{ s.label }}：<b class="q-ml-xs">{{ s.value }}</b>
      </q-chip>
    </div>

    <div v-if="result.missed.length" class="text-left q-mt-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">要再練習的單字</div>
      <q-list bordered separator class="rounded-borders">
        <q-item v-for="w in result.missed" :key="w.answer" dense>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ w.answer }}</q-item-label>
            <q-item-label caption>{{ w.chinese }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              icon="volume_up"
              aria-label="發音"
              @click="WordPronunciation(w.answer)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="column q-gutter-sm q-mt-lg">
      <q-btn
        class="btn-3d"
        color="primary"
        size="lg"
        icon="replay"
        label="再玩一次"
        @click="$emit('replay')"
      />
      <q-btn flat color="primary" icon="category" label="換單字範圍" @click="$emit('setup')" />
      <q-btn flat color="grey-8" icon="sports_esports" label="回遊戲中心" to="/games" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WordPronunciation } from 'src/modules/Vocabulary';
import type { GameResult } from '../types';

defineProps<{ result: GameResult; bestScore: number; isNewBest: boolean }>();
defineEmits<{ (e: 'replay'): void; (e: 'setup'): void }>();
</script>

<style scoped>
.result-card {
  max-width: 480px;
  margin: 0 auto;
}
.score {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
}
.result-emoji {
  font-size: 4rem;
  line-height: 1;
}
</style>
