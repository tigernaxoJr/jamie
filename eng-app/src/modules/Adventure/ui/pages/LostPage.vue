<template>
  <q-page padding>
    <div v-if="store.partner && opponent" class="lost">
      <PageTitle emoji="🔦" title="迷路字靈" subtitle="把答錯的單字找回來" back="/adventure" />

      <!-- 開場 -->
      <template v-if="phase === 'intro'">
        <div class="scene app-card" :style="{ background: BACKGROUND }">
          <div class="appear">
            <CreatureSvg :species="opponent.species" :size="150" class="lost__ghost" />
          </div>
        </div>
        <div class="app-card q-pa-md q-mt-md">
          <div class="text-h6 text-center">{{ opponent.species.name }}出現了！</div>
          <div class="text-muted text-center q-mb-sm">
            牠把 {{ words.length }} 個你答錯過的單字藏起來了。對戰時拼對一個，就找回一個！
          </div>
          <div class="chips">
            <span v-for="w in words" :key="w.english" class="pill">{{ w.chinese }}</span>
          </div>
        </div>
        <q-btn
          class="btn-3d full-width q-mt-md"
          size="lg"
          color="deep-orange"
          icon="bolt"
          label="開始對戰"
          @click="phase = 'battle'"
        />
      </template>

      <BattlePanel
        v-else-if="phase === 'battle'"
        :key="battleId"
        :enemies="[opponent]"
        :team="store.team"
        mode="wild"
        :intro="`${opponent.species.name}出現了！拼對迷路的單字就能找回來！`"
        :words="words"
        :choice-pool="choicePool"
        :background="BACKGROUND"
        @answered="onAnswered"
        @won="onWon"
        @lost="phase = 'lost'"
        @leave="phase = 'lost'"
      />

      <!-- 勝利 -->
      <div v-else-if="phase === 'won'" class="app-card q-pa-lg text-center">
        <div style="font-size: 3rem">🎉</div>
        <div class="text-h5">找回了 {{ found.length }} 個單字！</div>
        <div class="chips q-mt-sm">
          <span v-for="w in found" :key="w.english" class="pill">
            {{ w.answer }}（{{ w.chinese }}）
          </span>
        </div>
        <div class="text-weight-bold q-mt-md">
          拿到 🍬 {{ reward }} 顆糖果（共 {{ candyCount }} 顆）
        </div>
        <div class="text-caption text-muted q-mt-xs">{{ summary }}</div>
        <div v-if="store.lostWords.length > 0" class="text-muted q-mt-sm">
          還有 {{ store.lostWords.length }} 個單字在迷路中。
        </div>
        <div class="column q-gutter-sm q-mt-lg">
          <q-btn
            v-if="store.lostWords.length > 0"
            class="btn-3d"
            color="deep-orange"
            icon="replay"
            label="繼續找"
            @click="retry"
          />
          <q-btn class="btn-3d" color="primary" icon="map" label="回地圖" to="/adventure" />
        </div>
      </div>

      <!-- 失敗 -->
      <div v-else-if="phase === 'lost'" class="app-card q-pa-lg text-center">
        <div style="font-size: 3rem">😴</div>
        <div class="text-h6">迷路字靈躲進霧裡了…</div>
        <div v-if="found.length" class="text-muted">
          不過已經找回 {{ found.length }} 個單字了！打贏才有糖果喔。
        </div>
        <div class="column q-gutter-sm q-mt-lg">
          <q-btn
            v-if="store.lostWords.length > 0"
            class="btn-3d"
            color="deep-orange"
            icon="replay"
            label="再試一次"
            @click="retry"
          />
          <q-btn flat color="grey-8" icon="map" label="回地圖" to="/adventure" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import PageTitle from 'src/components/PageTitle.vue';
import type { GameWord } from 'src/modules/Games/shared';
import { SPECIES } from '../../domain/species';
import type { Opponent } from '../../domain/rules';
import { lostRewardCandies } from '../../domain/lost';
import { wordsForArea } from '../../domain/words';
import { useAdventureStore } from '../../store/useAdventureStore';
import { candyCount, grantBonusCandies } from '../../store/candy';
import CreatureSvg from '../CreatureSvg.vue';
import BattlePanel from '../encounter/BattlePanel.vue';

const BACKGROUND = 'linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 55%, #94a3b8 100%)';

const router = useRouter();
const store = useAdventureStore();

if (!store.hasStarter || store.lostWords.length === 0) {
  void router.replace('/adventure');
}

type Phase = 'intro' | 'battle' | 'won' | 'lost';
const phase = ref<Phase>('intro');
const battleId = ref(0);
const summary = ref('');
const reward = ref(0);
/** 這一場出題的單字（開場時的迷路清單） */
const words = shallowRef<GameWord[]>([...store.lostWords]);
/** 這一場找回的單字 */
const found = ref<GameWord[]>([]);

/** 選擇題的干擾選項：已解鎖地區的單字 */
const choicePool = computed(() => [...words.value, ...store.unlockedAreas.flatMap(wordsForArea)]);

/** 迷路字靈：從看過的字靈裡隨機挑一隻，等級和隊伍裡最高的一樣 */
const makeOpponent = (): Opponent | null => {
  const pool = SPECIES.filter((s) => s.rarity !== 'legendary' && store.isSeen(s.id));
  const base = pool[Math.floor(Math.random() * pool.length)];
  if (!base) return null;
  const level = Math.max(...store.team.map((c) => c.level));
  return { species: { ...base, name: `迷路的${base.name}` }, level };
};
const opponent = shallowRef(makeOpponent());

const onAnswered = (word: GameWord, correct: boolean) => {
  if (correct && store.findLostWord(word.english)) found.value.push(word);
};

const onWon = (text: string) => {
  reward.value = lostRewardCandies(found.value.length);
  grantBonusCandies(reward.value);
  summary.value = text;
  phase.value = 'won';
};

const retry = () => {
  words.value = [...store.lostWords];
  found.value = [];
  opponent.value = makeOpponent();
  battleId.value++;
  phase.value = 'battle';
};
</script>

<style scoped>
.lost {
  max-width: 640px;
  margin: 0 auto;
}
.scene {
  height: clamp(160px, 30vh, 230px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  overflow: hidden;
}
.lost__ghost {
  opacity: 0.8;
  filter: grayscale(0.6);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.appear {
  animation: appear 0.8s ease-out;
}
@keyframes appear {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
