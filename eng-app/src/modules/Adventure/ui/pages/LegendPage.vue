<template>
  <q-page padding>
    <div v-if="store.partner" class="legend">
      <PageTitle
        emoji="⭐"
        title="傳說挑戰"
        :subtitle="`傳說字靈${LEGEND.name}`"
        back="/adventure"
      />

      <!-- 開場 -->
      <template v-if="phase === 'intro'">
        <div class="scene app-card q-pa-lg text-center" :style="{ background: BACKGROUND }">
          <CreatureSvg :species="LEGEND" :size="160" evolved />
          <div class="speech q-mt-sm">
            集滿 {{ AREAS.length }} 個徽章的探險家，你終於來了！<br />
            我只接受<b>沒有提示的拼字</b>，所有招式都要自己拼出來喔！
          </div>
        </div>
        <div class="app-card q-pa-md q-mt-md text-center">
          <div class="text-weight-bold">
            {{ LEGEND.name }} · {{ LEGEND.english }}（{{ LEGEND.meaning }}） · Lv {{ LEGEND_LEVEL }}
          </div>
          <div class="text-caption text-muted q-mt-xs">
            {{
              caughtBefore
                ? `已經收服過${LEGEND.name}了，再打贏可以拿 🍬 ${LEGEND_REPEAT_CANDY} 顆。`
                : `打贏就能收服${LEGEND.name}！`
            }}
          </div>
        </div>
        <q-btn
          class="btn-3d full-width q-mt-md"
          size="lg"
          color="deep-orange"
          icon="emoji_events"
          label="開始挑戰"
          @click="phase = 'battle'"
        />
      </template>

      <BattlePanel
        v-else-if="phase === 'battle'"
        :key="battleId"
        :enemies="[{ species: LEGEND, level: LEGEND_LEVEL }]"
        :team="store.team"
        mode="gym"
        hard
        :intro="`傳說字靈${LEGEND.name}出現了！所有招式都要拼字，沒有提示！`"
        :words="words"
        :background="BACKGROUND"
        @won="onWon"
        @lost="phase = 'lost'"
        @leave="phase = 'lost'"
      />

      <!-- 勝利 -->
      <div v-else-if="phase === 'won'" class="app-card q-pa-lg text-center">
        <template v-if="!caughtBefore">
          <div class="text-h5">🎉 {{ LEGEND.name }}認同你了，收服成功！</div>
          <CreatureSvg :species="LEGEND" :size="150" class="q-my-md" />
          <div class="pill">📖 傳說字靈登錄到圖鑑！</div>
          <div v-if="joinedTeam" class="pill q-ml-xs">🤝 已加入隊伍</div>
        </template>
        <template v-else>
          <div class="text-h5">⭐ 又贏了{{ LEGEND.name }}！</div>
          <div class="text-weight-bold q-mt-sm">
            拿到 🍬 {{ LEGEND_REPEAT_CANDY }} 顆糖果（共 {{ candyCount }} 顆）
          </div>
        </template>
        <div class="text-caption text-muted q-mt-sm">{{ summary }}</div>
        <q-btn
          class="btn-3d full-width q-mt-lg"
          color="primary"
          icon="map"
          label="回地圖"
          to="/adventure"
        />
      </div>

      <!-- 失敗 -->
      <div v-else-if="phase === 'lost'" class="app-card q-pa-lg text-center">
        <div style="font-size: 3rem">✨</div>
        <div class="text-h6">{{ LEGEND.name }}飛回星空了…</div>
        <div class="text-muted">多練習拼字、讓隊伍升級，再來挑戰吧！</div>
        <div class="column q-gutter-sm q-mt-lg">
          <q-btn
            class="btn-3d"
            color="deep-orange"
            icon="replay"
            label="再挑戰一次"
            @click="retry"
          />
          <q-btn flat color="grey-8" icon="map" label="回地圖" to="/adventure" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageTitle from 'src/components/PageTitle.vue';
import { AREAS } from '../../domain/areas';
import { LEGEND, LEGEND_LEVEL, LEGEND_REPEAT_CANDY, isLegendUnlocked } from '../../domain/legend';
import { wordsForArea } from '../../domain/words';
import { useAdventureStore } from '../../store/useAdventureStore';
import { candyCount, grantBonusCandies } from '../../store/candy';
import CreatureSvg from '../CreatureSvg.vue';
import BattlePanel from '../encounter/BattlePanel.vue';

const BACKGROUND = 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 55%, #f59e0b 100%)';

const router = useRouter();
const store = useAdventureStore();

if (!store.hasStarter || !isLegendUnlocked(store.badgeCount)) {
  void router.replace('/adventure');
}

/** 進頁面時有沒有收服過（打贏後收服也不會改變這一場的結果畫面） */
const caughtBefore = store.isCaught(LEGEND.id);
/** 出題：所有地區的單字 */
const words = computed(() => store.unlockedAreas.flatMap(wordsForArea));

type Phase = 'intro' | 'battle' | 'won' | 'lost';
const phase = ref<Phase>('intro');
const battleId = ref(0);
const summary = ref('');
const joinedTeam = ref(false);

const onWon = (text: string) => {
  if (caughtBefore) grantBonusCandies(LEGEND_REPEAT_CANDY);
  else joinedTeam.value = store.isInTeam(store.catchCreature(LEGEND.id, LEGEND_LEVEL).uid);
  summary.value = text;
  phase.value = 'won';
};

const retry = () => {
  battleId.value++;
  phase.value = 'battle';
};
</script>

<style scoped>
.legend {
  max-width: 640px;
  margin: 0 auto;
}
.speech {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  line-height: 1.6;
}
</style>
