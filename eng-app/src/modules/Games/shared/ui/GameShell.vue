<template>
  <q-page padding>
    <!-- 準備：玩法 + 選類別 -->
    <div v-if="session.phase === 'setup'" class="shell-setup">
      <PageTitle
        :emoji="info.icon"
        :title="info.title"
        :subtitle="info.description"
        back="/games"
      />

      <div class="app-card q-pa-lg q-mb-md">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">📜 怎麼玩</div>
          <q-space />
          <span v-if="session.bestScore > 0" class="pill">🏅 最高分 {{ session.bestScore }}</span>
        </div>
        <ol class="rules">
          <li v-for="rule in info.rules" :key="rule">{{ rule }}</li>
        </ol>
      </div>

      <div class="app-card q-pa-lg">
        <CategorySelector
          :model-value="session.categories"
          @update:model-value="session.setCategories"
          :categories="Categories"
          confirm-label="開始遊戲"
          @confirm="onConfirm"
        >
          <template #title>選擇單字主題</template>
        </CategorySelector>
        <div
          class="text-center text-weight-bold q-mt-sm"
          :class="[session.canStart ? 'text-muted' : 'text-negative', { shake: warn }]"
        >
          已選 {{ session.availableCount }} 個單字
          <span v-if="!session.canStart">（至少要 {{ info.minWords }} 個，請多選幾個主題）</span>
        </div>
      </div>
    </div>

    <!-- 遊戲中 -->
    <div v-else-if="session.phase === 'playing'" class="shell-play">
      <div class="play-bar app-card row items-center no-wrap q-mb-md">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="grey-8"
          aria-label="結束遊戲"
          @click="$emit('quit')"
        />
        <div class="text-subtitle1 text-weight-bold ellipsis">{{ info.icon }} {{ info.title }}</div>
        <q-space />
        <q-btn
          flat
          round
          :icon="muted ? 'volume_off' : 'volume_up'"
          :aria-label="muted ? '開啟音效' : '關閉音效'"
          @click="toggleMute"
        />
        <q-btn flat color="negative" icon="stop_circle" label="結束" @click="$emit('quit')" />
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
import PageTitle from 'src/components/PageTitle.vue';
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
.shell-setup {
  max-width: 640px;
  margin: 0 auto;
}
.shell-play {
  max-width: 760px;
  margin: 0 auto;
}
.play-bar {
  padding: 4px 8px;
  border-radius: 16px;
}
.rules {
  list-style: decimal;
  margin: 0;
  padding-left: 1.4em;
  line-height: 1.8;
  font-weight: 600;
}
.rules li::marker {
  color: var(--q-primary);
  font-weight: 900;
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
