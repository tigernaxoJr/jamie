<template>
  <q-page padding>
    <!-- 選擇類別 -->
    <div v-if="!isReviewing" class="page-container page-container--narrow">
      <PageTitle emoji="📖" title="單字複習" subtitle="翻翻單字卡，先看再想" />
      <div class="app-card q-pa-lg">
        <CategorySelector
          v-model="selectedCategories"
          :categories="Categories"
          confirm-label="開始複習"
          @confirm="startReview"
        >
          <template #title>選擇複習主題</template>
        </CategorySelector>
      </div>
    </div>

    <!-- 單字卡 -->
    <div v-else class="page-container">
      <PageTitle
        emoji="📖"
        title="單字複習"
        :subtitle="`${reviewWords.length} 張單字卡 · 已翻開 ${revealedWords.size} 張`"
      >
        <template #actions>
          <q-btn flat color="primary" icon="category" label="換主題" @click="isReviewing = false" />
        </template>
      </PageTitle>

      <div class="toolbar app-card q-pa-sm q-mb-lg row items-center q-gutter-sm">
        <q-btn-toggle
          v-model="reviewMode"
          rounded
          unelevated
          toggle-color="primary"
          color="grey-2"
          text-color="grey-8"
          :options="[
            { label: '看中文想英文', value: 'ch-en' },
            { label: '看英文想中文', value: 'en-ch' },
          ]"
        />
        <q-space />
        <q-btn flat color="grey-8" icon="shuffle" label="洗牌" @click="shuffleWords" />
        <q-btn
          flat
          color="grey-8"
          :icon="allRevealed ? 'visibility_off' : 'visibility'"
          :label="allRevealed ? '全部蓋上' : '全部翻開'"
          @click="toggleAll"
        />
      </div>

      <div class="cards">
        <div
          v-for="word in reviewWords"
          :key="word.id"
          role="button"
          tabindex="0"
          class="flash"
          :class="{ 'flash--open': isRevealed(word.id) }"
          :aria-pressed="isRevealed(word.id)"
          @click="toggleReveal(word.id)"
          @keydown.enter.prevent="toggleReveal(word.id)"
          @keydown.space.prevent="toggleReveal(word.id)"
        >
          <span class="flash__inner">
            <span class="flash__face flash__front">
              <span class="flash__text">
                {{ reviewMode === 'en-ch' ? word.english : word.chinese }}
              </span>
              <span class="flash__tap"> <q-icon name="touch_app" size="16px" /> 點一下翻面 </span>
            </span>
            <span class="flash__face flash__back">
              <span class="flash__question">
                {{ reviewMode === 'en-ch' ? word.english : word.chinese }}
              </span>
              <span class="flash__text flash__answer">
                {{ reviewMode === 'en-ch' ? word.chinese : word.english }}
              </span>
              <SpeechStrip :word="word.english" />
            </span>
          </span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import PageTitle from 'src/components/PageTitle.vue';
import Categories from '../infra/Category';
import { GeQuiztWords } from '../infra/WordBank';
import type { QuizWord } from '../domain';
import SpeechStrip from './QuizPage/SpeechStrip.vue';
import CategorySelector from './CategorySelector.vue';

const isReviewing = ref(false);
const selectedCategories = useLocalStorage<string[]>('review-selected-categories', []);
const reviewWords = ref<QuizWord[]>([]);
const reviewMode = ref<'en-ch' | 'ch-en'>('ch-en');
const revealedWords = ref(new Set<number>());

const startReview = () => {
  reviewWords.value = GeQuiztWords(new Set(selectedCategories.value));
  revealedWords.value.clear();
  isReviewing.value = true;
};

const toggleReveal = (wordId: number) => {
  if (revealedWords.value.has(wordId)) {
    revealedWords.value.delete(wordId);
  } else {
    revealedWords.value.add(wordId);
  }
};

const isRevealed = (wordId: number) => revealedWords.value.has(wordId);

const allRevealed = computed(
  () => reviewWords.value.length > 0 && revealedWords.value.size === reviewWords.value.length,
);

const toggleAll = () => {
  revealedWords.value = allRevealed.value ? new Set() : new Set(reviewWords.value.map((w) => w.id));
};

const shuffleWords = () => {
  const arr = [...reviewWords.value];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j] as QuizWord, arr[i] as QuizWord];
  }
  reviewWords.value = arr;
  revealedWords.value = new Set();
};

// Reset reveals when mode changes
watch(reviewMode, () => {
  revealedWords.value.clear();
});
</script>

<style scoped lang="scss">
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.flash {
  height: 170px;
  perspective: 900px;
  cursor: pointer;
  border-radius: var(--app-radius);
  outline-offset: 4px;
}
.flash__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}
.flash--open .flash__inner {
  transform: rotateY(180deg);
}
.flash__face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
  backface-visibility: hidden;
  text-align: center;
}
.flash__front {
  background: #fff;
  border-bottom: 6px solid $primary;
}
.flash__back {
  background: linear-gradient(135deg, #e8f3fd, #eafaf6);
  border-bottom: 6px solid $secondary;
  transform: rotateY(180deg);
}
.flash__text {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--app-ink);
  line-height: 1.25;
  word-break: break-word;
}
.flash__answer {
  color: $primary;
}
.flash__question {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--app-muted);
}
.flash__tap {
  font-size: 0.75rem;
  font-weight: 700;
  color: #a9b4c0;
}
@media (max-width: 599px) {
  .cards {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .flash {
    height: 140px;
  }
  .flash__text {
    font-size: 1.2rem;
  }
}
</style>
