<template>
  <q-dialog :model-value="creature !== null" persistent>
    <div v-if="creature && evo" class="evolve">
      <!-- 先認識新名字 -->
      <div v-if="step === 'learn'" class="app-card q-pa-lg text-center">
        <CreatureView :species="species" :size="120" :shiny="creature.shiny" />
        <div class="text-h6 q-mt-sm">{{ species.name }}要進化了！</div>
        <div class="text-muted">進化後的新名字是一個新單字，先聽聽看、記起來：</div>
        <div class="evolve__word q-mt-sm">
          {{ evo.english }}
          <q-btn
            flat
            round
            dense
            icon="volume_up"
            color="primary"
            aria-label="發音"
            @click="speak"
          />
        </div>
        <div class="text-subtitle1 text-weight-bold">（{{ evo.meaning }}）</div>
        <div v-if="missed" class="text-negative text-weight-bold q-mt-sm">
          差一點！再看一次，等一下再拼拼看
        </div>
        <q-btn
          class="btn-3d full-width q-mt-md"
          color="accent"
          text-color="dark"
          icon="auto_awesome"
          label="拼出新名字，完成進化！"
          @click="startSpelling"
        />
        <q-btn flat color="grey-7" label="等一下再說" class="q-mt-xs" @click="close" />
      </div>

      <!-- 拼出新名字 -->
      <template v-else-if="step === 'spell' && question">
        <div class="app-card q-pa-sm q-mb-sm text-center text-weight-bold">
          ✨ 拼出{{ species.name }}的新名字
        </div>
        <QuestionCard :question="question" @answered="onAnswered" />
      </template>

      <!-- 進化完成 -->
      <div v-else class="app-card q-pa-lg text-center">
        <CreatureView
          :species="species"
          :size="150"
          evolved
          :shiny="creature.shiny"
          class="evolve__reveal"
        />
        <div class="text-h5 q-mt-sm">🎉 {{ species.name }}進化成{{ evo.name }}了！</div>
        <div class="text-subtitle1 text-weight-bold">
          {{ evo.english }}
          <q-btn
            flat
            round
            dense
            icon="volume_up"
            color="primary"
            aria-label="發音"
            @click="speak"
          />
          （{{ evo.meaning }}）
        </div>
        <div class="text-caption text-muted">血量和攻擊都變強了！</div>
        <q-btn class="btn-3d full-width q-mt-md" color="primary" label="太棒了！" @click="close" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { sfx } from 'src/modules/Games/shared';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { type Question, makeQuestion } from '../domain/questions';
import { getSpecies } from '../domain/species';
import { type OwnedCreature, useAdventureStore } from '../store/useAdventureStore';
import CreatureView from './CreatureView.vue';
import QuestionCard from './QuestionCard.vue';

/**
 * 有專屬進化的字靈（初始夥伴）進化：先認識新名字（新單字），拼對了才進化。
 * 新名字不在題庫，所以不寫入單字記憶（和捕捉的名字題一樣）。
 */
const creature = defineModel<OwnedCreature | null>({ required: true });

const store = useAdventureStore();
const species = computed(() => getSpecies(creature.value?.speciesId ?? 1));
const evo = computed(() => species.value.evolution);

type Step = 'learn' | 'spell' | 'done';
const step = ref<Step>('learn');
const missed = ref(false);
const question = ref<Question | null>(null);

const speak = () => {
  if (evo.value) WordPronunciation(evo.value.english);
};

watch(creature, (c) => {
  if (!c) return;
  step.value = 'learn';
  missed.value = false;
  speak();
});

/** 每次都出新的一題（字母方塊重新打散）；新單字一律給字母方塊 */
const startSpelling = () => {
  if (!evo.value) return;
  const answer = evo.value.english.toLowerCase();
  const word = { english: answer, chinese: evo.value.meaning, answer };
  question.value = makeQuestion('zh-spell', word, [], 0);
  step.value = 'spell';
};

const onAnswered = (correct: boolean) => {
  if (!correct || !creature.value) {
    missed.value = true;
    step.value = 'learn';
    speak();
    return;
  }
  if (store.evolve(creature.value.uid)) {
    step.value = 'done';
    sfx.win();
  }
};

const close = () => {
  creature.value = null;
};
</script>

<style scoped>
.evolve {
  width: 380px;
  max-width: 92vw;
}
.evolve__word {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
.evolve__reveal {
  animation: reveal 0.8s ease-out;
}
@keyframes reveal {
  from {
    transform: scale(0.4);
    opacity: 0;
    filter: brightness(3);
  }
}
</style>
