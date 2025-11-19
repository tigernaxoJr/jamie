<template>
  <q-page padding class="flex flex-center">
    <!-- Category Selection View -->
    <q-card v-if="!isReviewing" flat bordered style="width: 100%; max-width: 600px" class="q-pa-lg">
      <div class="text-h5 text-weight-bold text-center q-mb-md">選擇複習類別</div>

      <q-scroll-area style="height: 400px; max-width: 100%">
        <div v-for="parent in parentCategories" :key="parent.id" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ parent.name }}</div>
          <div class="row q-col-gutter-sm">
            <div v-for="cat in getSubCategories(parent.id)" :key="cat.id" class="col-6 col-sm-4">
              <q-checkbox
                :model-value="selectedCategories.includes(cat.id)"
                @update:model-value="toggleCategory(cat.id)"
                :label="cat.name"
                dense
              />
            </div>
          </div>
          <q-separator class="q-mt-md" />
        </div>
      </q-scroll-area>

      <q-card-actions align="center" class="q-mt-md">
        <q-btn
          color="primary"
          label="開始複習"
          @click="startReview"
          :disable="selectedCategories.length === 0"
        />
      </q-card-actions>
    </q-card>

    <!-- Review View -->
    <div v-else style="width: 100%; max-width: 1200px">
      <q-card flat bordered class="q-mb-md bg-grey-1">
        <q-card-section class="row items-center q-gutter-sm">
          <q-btn flat icon="arrow_back" label="重選類別" @click="isReviewing = false" />
          <q-space />
          <q-btn-toggle
            v-model="reviewMode"
            toggle-color="primary"
            :options="[
              { label: '英翻中', value: 'en-ch' },
              { label: '中翻英', value: 'ch-en' },
            ]"
          />
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md">
        <div v-for="word in reviewWords" :key="word.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card
            class="full-height cursor-pointer transition-all hover-effect no-select"
            :class="{ 'bg-blue-1': isRevealed(word.id) }"
            @click="toggleReveal(word.id)"
          >
            <q-card-section class="text-center q-py-lg">
              <!-- Question Part -->
              <div class="text-h5 text-weight-bold text-primary q-mb-sm">
                <template v-if="reviewMode === 'en-ch'">
                  {{ word.english }}
                </template>
                <template v-else>
                  {{ word.chinese }}
                </template>
              </div>

              <!-- Answer Part -->
              <div class="relative-position" style="min-height: 40px">
                <transition name="fade">
                  <div v-if="isRevealed(word.id)">
                    <div class="text-h6 text-grey-9">
                      <template v-if="reviewMode === 'en-ch'">
                        {{ word.chinese }}
                      </template>
                      <template v-else>
                        {{ word.english }}
                      </template>
                    </div>
                    <div class="q-mt-xs" @click.stop>
                      <SpeechStrip :word="word.english" />
                    </div>
                  </div>
                  <div v-else class="absolute-full flex flex-center text-grey-5">
                    <q-icon name="touch_app" size="sm" />
                    <span class="text-caption q-ml-xs">點擊查看答案</span>
                  </div>
                </transition>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import Categories from '../infra/Category';
import { GeQuiztWords } from '../infra/WordBank';
import type { QuizWord } from '../domain';
import SpeechStrip from './QuizPage/SpeechStrip.vue';

const isReviewing = ref(false);
const selectedCategories = useLocalStorage<string[]>('review-selected-categories', []);
const reviewWords = ref<QuizWord[]>([]);
const reviewMode = ref<'en-ch' | 'ch-en'>('ch-en');
const revealedWords = ref(new Set<number>());

const parentCategories = computed(() => {
  return Categories.filter((c) => !c.parentId);
});

const getSubCategories = (parentId: string) => {
  return Categories.filter((c) => c.parentId === parentId);
};

const toggleCategory = (id: string) => {
  const index = selectedCategories.value.indexOf(id);
  if (index === -1) {
    selectedCategories.value.push(id);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

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

// Reset reveals when mode changes
watch(reviewMode, () => {
  revealedWords.value.clear();
});
</script>

<style scoped>
.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.transition-all {
  transition: all 0.3s ease;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.no-select {
  user-select: none;
  -webkit-user-select: none;
}
</style>
