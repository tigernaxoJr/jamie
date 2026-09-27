<template>
  <div class="result-card app-card q-pa-lg text-center">
    <div class="result-emoji">{{ result.won ? '🏆' : '💪' }}</div>
    <div class="text-h5 text-weight-bold q-mt-sm">{{ result.headline }}</div>
    <div
      v-if="result.stars !== undefined"
      class="stars q-mt-sm"
      :aria-label="`${result.stars} 顆星`"
    >
      <span v-for="n in 3" :key="n" :class="{ on: n <= result.stars }">★</span>
    </div>

    <div class="score text-primary q-mt-md">{{ result.score }}</div>
    <div class="text-caption text-grey-7">分數</div>
    <template v-if="result.ranked !== false">
      <q-chip v-if="isNewBest" color="amber" text-color="black" icon="emoji_events" class="q-mt-sm">
        新紀錄！
      </q-chip>
      <div v-else class="text-caption text-grey-6 q-mt-sm">最高分 {{ bestScore }}</div>
    </template>

    <div class="row justify-center q-gutter-sm q-mt-md">
      <q-chip v-for="s in result.stats" :key="s.label" outline color="primary">
        {{ s.label }}：<b class="q-ml-xs">{{ s.value }}</b>
      </q-chip>
    </div>

    <div v-if="result.reward" class="reward q-mt-md">
      <template v-if="result.reward.candies > 0">
        <div class="text-weight-bold">🍬 得到 {{ result.reward.candies }} 顆字靈糖果！</div>
        <div class="text-caption">
          可以在字靈探險餵給字靈（共 {{ candyCount }} 顆）
          <router-link to="/adventure" class="text-weight-bold">去餵字靈 →</router-link>
        </div>
      </template>
      <div v-else-if="result.reward.capped > 0" class="text-weight-bold">
        🍬 今天的字靈糖果已經拿滿了，明天再來！
      </div>
      <div v-else class="text-caption">
        每答對 {{ CORRECT_PER_CANDY }} 題可以拿到 1 顆字靈糖果 🍬
      </div>
      <div v-if="result.reward.candies > 0 && result.reward.capped > 0" class="text-caption">
        （今天的糖果拿滿了）
      </div>
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
      <q-btn
        class="full-width q-mt-sm"
        outline
        color="deep-orange"
        icon="school"
        :label="`只練這 ${result.missed.length} 個字，再玩一次`"
        @click="$emit('review')"
      />
    </div>

    <div class="column q-gutter-sm q-mt-lg">
      <slot name="actions" />
      <q-btn
        class="btn-3d"
        :outline="!!$slots.actions"
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
import { CORRECT_PER_CANDY, candyCount } from 'src/modules/Adventure';
import type { GameResult } from '../types';

defineProps<{ result: GameResult; bestScore: number; isNewBest: boolean }>();
defineEmits<{ (e: 'replay'): void; (e: 'setup'): void; (e: 'review'): void }>();
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
.stars {
  font-size: 2.4rem;
  line-height: 1;
  color: #cbd5e1;
  letter-spacing: 4px;
}
.stars .on {
  color: #f59e0b;
}
.reward {
  padding: 10px 14px;
  border-radius: 14px;
  background: #fff7ed;
  color: #9a3412;
}
.result-emoji {
  font-size: 4rem;
  line-height: 1;
}
</style>
