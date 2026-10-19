<template>
  <div class="feedback">
    <template v-if="result === 'correct'">
      <div class="feedback__emoji">🎉</div>
      <div class="feedback__title text-positive">答對了！</div>
    </template>
    <template v-else-if="result === 'wrong'">
      <div class="feedback__emoji">😅</div>
      <div class="feedback__title text-negative">差一點！</div>
    </template>
    <template v-else>
      <div class="feedback__emoji">👍</div>
      <div class="feedback__title text-primary">答對了（有用提示）</div>
    </template>
    <div v-if="goalReached" class="goal-reached q-mt-sm">
      🎯 今日目標達成！答對 {{ DAILY_GOAL }} 題了，太厲害了！
    </div>
    <div class="q-mt-xs">
      正確答案：<b class="feedback__answer">{{ word }}</b>
      <SpeechStrip :word="word" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DAILY_GOAL } from '../../index';
import SpeechStrip from './SpeechStrip.vue';

/** 檢查答案後的結果；hinted = 答對但用了提示，不算分 */
defineProps<{
  result: 'correct' | 'wrong' | 'hinted';
  word: string;
  /** 這一題剛好達成每日目標 */
  goalReached: boolean;
}>();
</script>

<style scoped lang="scss">
.feedback {
  text-align: center;
  font-size: 1.05rem;
}
.goal-reached {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: #fff7ed;
  color: #c2410c;
  font-weight: 900;
  animation: pop 0.5s;
}
.feedback__emoji {
  font-size: 2.6rem;
  line-height: 1;
}
.feedback__title {
  font-size: 1.4rem;
  font-weight: 900;
}
.feedback__answer {
  font-size: 1.3rem;
  color: $primary;
}
@keyframes pop {
  50% {
    transform: scale(1.02);
  }
}
</style>
