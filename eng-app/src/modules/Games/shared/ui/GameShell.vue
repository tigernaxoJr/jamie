<template>
  <!-- 標題畫面 -->
  <q-page v-if="session.phase === 'setup'" padding>
    <div class="title-screen">
      <section class="hero" :class="`bg-${info.color}`">
        <q-btn
          flat
          round
          color="white"
          icon="arrow_back"
          class="hero__back"
          to="/games"
          aria-label="回遊戲中心"
        />
        <span v-if="session.bestScore > 0" class="hero__best"
          >🏅 {{ info.stageBased ? '無盡模式' : '' }}最高分 {{ session.bestScore }}</span
        >

        <div class="hero__icon">{{ info.icon }}</div>
        <h1 class="hero__title">{{ info.title }}</h1>
        <div class="hero__desc">{{ info.description }}</div>

        <!-- 各遊戲自己的設定，例如速度 -->
        <div v-if="$slots.settings" class="hero__settings">
          <slot name="settings" />
        </div>

        <q-btn
          class="btn-3d hero__start"
          size="xl"
          color="white"
          :text-color="info.color"
          icon="play_arrow"
          :label="session.canStart ? '開始遊戲' : '先選單字範圍'"
          @click="onStart"
        />

        <button type="button" class="hero__words" @click="pickerOpen = true">
          <q-icon name="menu_book" size="18px" />
          <span class="ellipsis">{{ wordSummary }}</span>
          <b class="hero__change">更改</b>
        </button>
      </section>

      <section class="rules">
        <div v-for="(rule, i) in info.rules" :key="rule" class="rule app-card">
          <span class="rule__no" :class="`bg-${info.color}`">{{ i + 1 }}</span>
          <span>{{ rule }}</span>
        </div>
      </section>
    </div>

    <q-dialog v-model="pickerOpen">
      <q-card class="picker q-pa-md">
        <div class="row justify-end">
          <q-btn flat round icon="close" v-close-popup aria-label="關閉" />
        </div>
        <CategorySelector
          :model-value="session.categories"
          @update:model-value="session.setCategories"
          :categories="Categories"
          confirm-label="選好了"
          @confirm="onPicked"
        >
          <template #title>選擇單字範圍</template>
        </CategorySelector>
        <div
          class="text-center text-weight-bold q-mt-sm"
          :class="[session.canStart ? 'text-muted' : 'text-negative', { shake: warn }]"
        >
          已選 {{ session.availableCount }} 個單字
          <span v-if="!session.canStart">（至少要 {{ info.minWords }} 個）</span>
        </div>
      </q-card>
    </q-dialog>
  </q-page>

  <!-- 遊戲舞台：全螢幕，不用捲動就能玩 -->
  <div v-else class="stage">
    <header class="stage__bar" :class="`bg-${info.color}`">
      <q-btn
        flat
        round
        color="white"
        icon="close"
        :aria-label="session.phase === 'playing' ? '結束遊戲' : '回標題畫面'"
        @click="session.phase === 'playing' ? $emit('quit') : session.toSetup()"
      />
      <div class="stage__title ellipsis">{{ info.icon }} {{ info.title }}</div>
      <span v-if="session.reviewing && session.phase === 'playing'" class="stage__review"
        >🔁 複習答錯的字</span
      >
      <q-space />
      <q-btn
        flat
        round
        color="white"
        :icon="muted ? 'volume_off' : 'volume_up'"
        :aria-label="muted ? '開啟音效' : '關閉音效'"
        @click="toggleMute"
      />
    </header>

    <main class="stage__body">
      <div v-if="session.phase === 'playing'" class="stage__play">
        <slot />
      </div>
      <GameResultView
        v-else-if="session.result"
        :result="session.result"
        :best-score="session.bestScore"
        :is-new-best="session.isNewBest"
        @replay="session.start"
        @setup="session.toSetup"
        @review="session.result && session.startReview(session.result.missed)"
      >
        <template v-if="$slots['result-actions']" #actions>
          <slot name="result-actions" />
        </template>
      </GameResultView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Categories, CategorySelector } from 'src/modules/Vocabulary';
import type { GameSession } from '../useGameSession';
import { muted } from '../sfx';
import GameResultView from './GameResultView.vue';

const props = defineProps<{ session: GameSession }>();
defineEmits<{ (e: 'quit'): void }>();

const info = props.session.info;
const warn = ref(false);
const pickerOpen = ref(false);

/** 單字範圍摘要，例如「第一級：數字、動物 · 29 字」 */
const wordSummary = computed(() => {
  const ids = new Set(props.session.categories);
  if (ids.size === 0) return '還沒選單字範圍';
  const topics = Categories.filter((c) => ids.has(c.id));
  const levels = [...new Set(topics.map((c) => c.parentId))]
    .map((pid) => Categories.find((c) => c.id === pid)?.name)
    .filter(Boolean);
  const detail =
    topics.length <= 3
      ? `${levels.join('、')}：${topics.map((c) => c.name).join('、')}`
      : `${levels.join('、')} · ${topics.length} 個主題`;
  return `${detail} · ${props.session.availableCount} 字`;
});

const flashWarn = () => {
  warn.value = true;
  setTimeout(() => (warn.value = false), 500);
};

const onStart = () => {
  if (props.session.canStart) return props.session.start();
  pickerOpen.value = true;
};

const onPicked = () => {
  if (!props.session.canStart) return flashWarn();
  pickerOpen.value = false;
};

const toggleMute = () => {
  muted.value = !muted.value;
};
</script>

<style scoped lang="scss">
.title-screen {
  max-width: 720px;
  margin: 0 auto;
}
.hero {
  position: relative;
  padding: 28px 20px 20px;
  border-radius: 28px;
  color: #fff;
  text-align: center;
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 2px, transparent 2px);
  background-size: 22px 22px;
  box-shadow: var(--app-shadow-lg);
}
.hero__back {
  position: absolute;
  top: 10px;
  left: 10px;
}
.hero__best {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
  font-weight: 800;
  font-size: 0.85rem;
}
.hero__icon {
  font-size: 5rem;
  line-height: 1.1;
  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.25));
  animation: bob 2.6s ease-in-out infinite;
}
.hero__title {
  margin: 6px 0 0;
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1.2;
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.15);
}
.hero__desc {
  font-weight: 700;
  opacity: 0.92;
}
.hero__settings {
  margin-top: 14px;
}
.hero__start {
  margin-top: 18px;
  min-width: 240px;
  font-size: 1.2rem;
}
.hero__words {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  margin: 16px auto 0;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.hero__change {
  flex-shrink: 0;
  padding: 0 8px;
  border-radius: 999px;
  background: #fff;
  color: var(--app-ink);
  font-size: 0.8rem;
}
.rules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.rule {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  font-weight: 600;
  line-height: 1.5;
}
.rule__no {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  color: #fff;
  font-weight: 900;
  text-align: center;
  line-height: 24px;
}
.picker {
  width: 640px;
  max-width: 95vw;
}

// ---------- 舞台 ----------
.stage {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg);
  background-image: radial-gradient(rgba(22, 119, 210, 0.06) 1.5px, transparent 1.5px);
  background-size: 22px 22px;
}
.stage__bar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 52px;
  padding: 0 8px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.stage__title {
  font-weight: 900;
  font-size: 1.1rem;
}
.stage__review {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 0.8rem;
  font-weight: 800;
}
.stage__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
}
.stage__play {
  max-width: 760px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
.shake {
  animation: shake 0.4s;
}
@keyframes bob {
  50% {
    transform: translateY(-8px) rotate(-5deg);
  }
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
@media (max-width: 599px) {
  .hero__title {
    font-size: 1.9rem;
  }
  .hero__icon {
    font-size: 4rem;
  }
}
</style>
