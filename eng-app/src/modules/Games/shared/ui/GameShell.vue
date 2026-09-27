<template>
  <q-page padding class="column items-center">
    <!-- 準備：玩法 + 選類別 -->
    <q-card v-if="session.phase === 'setup'" class="shell-card soft-shadow q-pa-md">
      <div class="row items-center no-wrap q-gutter-sm">
        <q-btn flat round icon="arrow_back" to="/games" aria-label="回遊戲中心" />
        <div class="text-h3">{{ info.icon }}</div>
        <div>
          <div class="text-h5 text-weight-bold">{{ info.title }}</div>
          <div class="text-caption text-grey-7">{{ info.description }}</div>
        </div>
      </div>

      <q-banner rounded class="bg-blue-1 q-mt-md">
        <div class="text-weight-bold q-mb-xs">玩法</div>
        <ul class="q-my-none q-pl-md">
          <li v-for="rule in info.rules" :key="rule">{{ rule }}</li>
        </ul>
        <div v-if="session.bestScore > 0" class="q-mt-sm text-weight-medium">
          🏅 最高分：{{ session.bestScore }}
        </div>
      </q-banner>

      <div
        class="text-center q-mt-md"
        :class="[session.canStart ? 'text-grey-7' : 'text-negative', { shake: warn }]"
      >
        已選單字 {{ session.availableCount }} 個
        <span v-if="!session.canStart">（至少需要 {{ info.minWords }} 個，請多選幾個類別）</span>
      </div>

      <CategorySelector
        :model-value="session.categories"
        @update:model-value="session.setCategories"
        :categories="Categories"
        confirm-label="開始遊戲"
        @confirm="onConfirm"
      >
        <template #title>選擇單字範圍</template>
      </CategorySelector>
    </q-card>

    <!-- 遊戲中 -->
    <div v-else-if="session.phase === 'playing'" class="shell-play">
      <div class="row items-center no-wrap q-mb-sm">
        <div class="text-subtitle1 text-weight-bold ellipsis">{{ info.icon }} {{ info.title }}</div>
        <q-space />
        <q-btn
          flat
          round
          :icon="muted ? 'volume_off' : 'volume_up'"
          :aria-label="muted ? '開啟音效' : '關閉音效'"
          @click="toggleMute"
        />
        <q-btn flat color="grey-8" icon="stop_circle" label="結束" @click="$emit('quit')" />
      </div>
      <slot />
    </div>

    <!-- 結算 -->
    <GameResultView
      v-else-if="session.result"
      :result="session.result"
      :best-score="session.bestScore"
      :is-new-best="session.isNewBest"
      @replay="session.start"
      @setup="session.toSetup"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Categories, CategorySelector } from 'src/modules/Vocabulary';
import type { GameSession } from '../useGameSession';
import { muted } from '../sfx';
import GameResultView from './GameResultView.vue';

const props = defineProps<{ session: GameSession }>();
defineEmits<{ (e: 'quit'): void }>();

const info = props.session.info;
const warn = ref(false);

const onConfirm = () => {
  if (props.session.canStart) return props.session.start();
  warn.value = true;
  setTimeout(() => (warn.value = false), 500);
};

const toggleMute = () => {
  muted.value = !muted.value;
};
</script>

<style scoped>
.shell-card {
  width: 100%;
  max-width: 640px;
}
.shell-play {
  width: 100%;
  max-width: 760px;
}
.shake {
  animation: shake 0.4s;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25%,
  75% {
    transform: translateX(-6px);
  }
  50% {
    transform: translateX(6px);
  }
}
</style>
