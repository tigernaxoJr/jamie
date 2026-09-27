<template>
  <div class="egg-card app-card q-pa-md">
    <div class="egg-card__egg" aria-hidden="true">🥚</div>
    <div class="col">
      <div class="text-subtitle1 text-weight-bold">字靈蛋</div>
      <div class="text-caption text-muted">
        用 {{ EGG_COST }} 顆糖果孵一顆蛋，常常會孵出還沒收服的字靈！
      </div>
    </div>
    <q-btn
      unelevated
      no-caps
      color="orange"
      class="text-weight-bold"
      :disable="candyCount < EGG_COST"
      :label="`🍬 ${EGG_COST} 孵蛋`"
      @click="hatch"
    />
    <div v-if="candyCount < EGG_COST" class="egg-card__need text-caption">
      還差 {{ EGG_COST - candyCount }} 顆糖果
    </div>

    <q-dialog v-model="open" persistent>
      <q-card class="hatch q-pa-lg text-center">
        <template v-if="phase === 'shaking'">
          <div class="hatch__egg">🥚</div>
          <div class="text-h6 q-mt-md">蛋在動了……</div>
        </template>
        <template v-else-if="result">
          <div class="text-h5">🎉 孵出了{{ species!.name }}！</div>
          <CreatureSvg :species="species!" :size="150" class="q-my-md hatch__reveal" />
          <div class="text-weight-bold">
            {{ species!.english }}（{{ species!.meaning }}） · Lv {{ result.creature.level }}
          </div>
          <div class="row justify-center q-gutter-xs q-mt-sm">
            <span v-if="result.isNew" class="pill">📖 新登錄到圖鑑！</span>
            <span v-if="store.isInTeam(result.creature.uid)" class="pill">🤝 已加入隊伍</span>
          </div>
          <q-btn class="btn-3d q-mt-lg" color="primary" label="太好了！" @click="open = false" />
        </template>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { sfx, useTimers } from 'src/modules/Games/shared';
import { EGG_COST } from '../domain/egg';
import { getSpecies } from '../domain/species';
import { candyCount } from '../store/candy';
import { useAdventureStore } from '../store/useAdventureStore';
import CreatureSvg from './CreatureSvg.vue';

const store = useAdventureStore();
const timers = useTimers();

const open = ref(false);
const phase = ref<'shaking' | 'done'>('shaking');
const result = ref<ReturnType<typeof store.hatch>>(null);
const species = computed(() => (result.value ? getSpecies(result.value.creature.speciesId) : null));

const hatch = () => {
  const r = store.hatch();
  if (!r) return;
  result.value = r;
  phase.value = 'shaking';
  open.value = true;
  sfx.click();
  timers.later(() => {
    phase.value = 'done';
    sfx.win();
    WordPronunciation(getSpecies(r.creature.speciesId).english);
  }, 1600);
};
</script>

<style scoped>
.egg-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.egg-card__egg {
  font-size: 2.4rem;
  animation: wobble 2.4s ease-in-out infinite;
}
.egg-card__need {
  width: 100%;
  text-align: right;
  color: #b45309;
  font-weight: 700;
}
.hatch {
  width: 360px;
  max-width: 92vw;
}
.hatch__egg {
  font-size: 6rem;
  animation: shake 0.4s ease-in-out infinite;
}
.hatch__reveal {
  animation: pop 0.5s ease-out;
}
@keyframes wobble {
  0%,
  80%,
  100% {
    transform: none;
  }
  85% {
    transform: rotate(-10deg);
  }
  95% {
    transform: rotate(10deg);
  }
}
@keyframes shake {
  25% {
    transform: rotate(-14deg);
  }
  75% {
    transform: rotate(14deg);
  }
}
@keyframes pop {
  from {
    transform: scale(0.3);
    opacity: 0;
  }
}
</style>
