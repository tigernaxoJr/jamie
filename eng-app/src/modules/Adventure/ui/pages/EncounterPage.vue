<template>
  <q-page padding>
    <div v-if="area && wild && store.partner" class="encounter">
      <PageTitle :emoji="area.emoji" :title="area.name" :subtitle="subtitle" back="/adventure" />

      <!-- 連續探索 Streak 提示條 -->
      <div v-if="store.encounterStreak > 0" class="streak-bar q-mb-sm row items-center justify-between q-px-md q-py-xs">
        <div class="row items-center q-gutter-xs">
          <span class="text-subtitle2 text-weight-bolder text-deep-orange">🔥 連續探索 x{{ store.encounterStreak }}</span>
          <q-badge v-if="store.encounterStreak >= 5" color="amber-9" text-color="dark">
            ✨ 色違重骰 + 稀有 x2.5
          </q-badge>
          <q-badge v-else-if="store.encounterStreak >= 3" color="orange" text-color="white">
            稀有率 x1.5 + 🍬 +1
          </q-badge>
        </div>
        <span class="text-caption text-grey-7">不逃跑累積熱度</span>
      </div>

      <!-- 遇到字靈 -->
      <template v-if="phase === 'intro'">
        <div class="scene app-card" :style="{ background: area.background }">
          <AreaScene :scene="area.id" />
          <div class="appear">
            <CreatureView :species="wild.species" :size="160" :shiny="wild.shiny" />
          </div>
        </div>
        <div class="app-card q-pa-md q-mt-md text-center">
          <div v-if="wild.shiny" class="shiny-banner">✨ 是很少見的色違字靈！</div>
          <div v-if="radarFound" class="radar-banner">📡 雷達找到了！就是牠！</div>
          <div v-else-if="night && lovesNight(wild.species)" class="night-banner">
            🌙 喜歡夜晚的字靈，晚上比較常出來！
          </div>
          <div class="text-h6">
            野生的
            <span class="text-primary">{{ wild.species.name }}</span>
            出現了！
          </div>
          <div class="row justify-center items-center q-gutter-sm q-mt-xs">
            <span class="text-weight-bold">Lv {{ wild.level }}</span>
            <ElementBadge :element="wild.species.element" />
            <span class="pill">{{ RARITY_NAME[wild.species.rarity] }}</span>
            <q-chip
              v-if="
                wild.shiny ? store.isShinyCaught(wild.species.id) : store.isCaught(wild.species.id)
              "
              dense
              color="positive"
              text-color="white"
              icon="check"
            >
              已收服過
            </q-chip>
          </div>
          <TraitTag :trait="wild.species.trait" full class="q-mt-sm" />
        </div>
        <div class="actions q-mt-md">
          <q-btn
            class="btn-3d"
            size="lg"
            color="accent"
            text-color="dark"
            icon="track_changes"
            label="捕捉"
            @click="phase = 'capture'"
          />
          <q-btn
            class="btn-3d"
            size="lg"
            color="deep-orange"
            icon="bolt"
            label="對戰"
            @click="startBattle"
          />
        </div>
        <div class="text-center text-caption text-muted q-mt-sm">
          小提示：先對戰打贏，捕捉時會多 {{ BATTLE_WIN_ENERGY }} 格能量
        </div>
        <div class="text-center q-mt-xs">
          <q-btn flat color="grey-7" icon="directions_run" label="逃跑" @click="requestEscape" />
        </div>
        <RadarCard :area="area" class="q-mt-md" />
      </template>

      <CapturePanel
        v-else-if="phase === 'capture'"
        :key="`capture-${encounterId}`"
        :species="wild.species"
        :level="wild.level"
        :words="words"
        :background="area.background"
        :scene="area.id"
        :bonus-energy="bonusEnergy"
        :shiny="wild.shiny"
        @caught="onCaught"
        @leave="requestEscape"
      />

      <BattlePanel
        v-else-if="phase === 'battle'"
        :key="`battle-${encounterId}`"
        :enemies="[wild]"
        :team="store.team"
        mode="wild"
        :intro="`野生的${wild.species.name}出現了！要用什麼招式？`"
        :words="words"
        :background="area.background"
        :scene="area.id"
        @won="onWon"
        @lost="onBattleLost"
        @leave="requestEscape"
      />

      <!-- 抓到了 -->
      <div v-else-if="phase === 'caught'" class="app-card q-pa-lg text-center">
        <div class="text-h5">
          🎉 收服了{{ wild.shiny ? '色違的' : '' }}{{ wild.species.name }}！
        </div>
        <CreatureView :species="wild.species" :size="150" :shiny="wild.shiny" class="q-my-md" />
        <div class="text-weight-bold">
          No.{{ String(wild.species.id).padStart(3, '0') }} · {{ wild.species.english }}
          <q-btn
            flat
            round
            dense
            icon="volume_up"
            color="primary"
            aria-label="發音"
            @click="WordPronunciation(wild.species.english)"
          />
          （{{ wild.species.meaning }}）
        </div>
        <div v-if="isNew" class="pill q-mt-sm">📖 新登錄到圖鑑！</div>
        <div v-if="isNewShiny" class="pill q-mt-sm q-ml-xs">✨ 圖鑑多了色違紀錄！</div>
        <div v-if="joinedTeam && releasedCandies === null" class="pill q-mt-sm q-ml-xs">
          🤝 已加入隊伍
        </div>
        <div class="text-caption text-muted q-mt-sm">{{ wild.species.description }}</div>
        <!-- 重複收服：可以放生換糖果 -->
        <div v-if="!isNew && !wild.shiny" class="release q-mt-md">
          <template v-if="releasedCandies === null">
            <div class="text-caption text-muted">
              已經有{{ wild.species.name }}了，要放生換糖果嗎？
            </div>
            <q-btn
              class="btn-3d q-mt-xs"
              color="pink-5"
              icon="volunteer_activism"
              :label="`放生，換 🍬 ${releaseReward} 顆`"
              @click="release"
            />
          </template>
          <div v-else class="text-weight-bold">
            👋 {{ wild.species.name }}回到大自然了，拿到 🍬 {{ releasedCandies }} 顆！
            <span class="text-caption text-muted">（共 {{ candyCount }} 顆）</span>
          </div>
        </div>
        <div class="column q-gutter-sm q-mt-lg">
          <q-btn
            class="btn-3d"
            size="lg"
            color="primary"
            icon="explore"
            label="繼續探索"
            @click="nextEncounter"
          />
          <q-btn flat color="primary" icon="menu_book" label="看圖鑑" to="/adventure/dex" />
          <q-btn flat color="grey-8" icon="map" label="回地圖" to="/adventure" />
        </div>
      </div>

      <!-- 對戰輸了 -->
      <div v-else-if="phase === 'lost'" class="app-card q-pa-lg text-center">
        <div style="font-size: 3rem">😴</div>
        <div class="text-h6">隊伍都累倒了，休息一下再出發吧！</div>
        <div class="text-muted">回地圖後體力會自動恢復</div>
        <div class="column q-gutter-sm q-mt-lg">
          <q-btn
            class="btn-3d"
            color="primary"
            icon="explore"
            label="繼續探索"
            @click="nextEncounter"
          />
          <q-btn flat color="grey-8" icon="map" label="回地圖" to="/adventure" />
        </div>
      </div>
    </div>

    <!-- 脫逃測驗彈窗 -->
    <EscapeQuizDialog
      v-model="showEscapeQuiz"
      :words="words"
      @escaped="onEscaped"
      @failed="onEscapeFailed"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageTitle from 'src/components/PageTitle.vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { trackQuest } from 'src/modules/Quests';
import { randomInt } from 'src/modules/Games/shared';
import { getArea } from '../../domain/areas';
import { type Species, RARITY_NAME, getSpecies } from '../../domain/species';
import { BATTLE_WIN_ENERGY, CAPTURE_XP } from '../../domain/rules';
import { RELEASE_CANDY } from '../../domain/candy';
import { canAppearInWild } from '../../domain/legend';
import { pickWithRadar } from '../../domain/radar';
import { candyCount } from '../../store/candy';
import { wordsForArea } from '../../domain/words';
import { useAdventureStore } from '../../store/useAdventureStore';
import CreatureView from '../CreatureView.vue';
import ElementBadge from '../ElementBadge.vue';
import RadarCard from '../RadarCard.vue';
import TraitTag from '../TraitTag.vue';
import CapturePanel from '../encounter/CapturePanel.vue';
import AreaScene from '../AreaScene.vue';
import { isNight, lovesNight } from '../../domain/daytime';
import { dynamicWildWeight, rollShinyWithStreak, streakBonusCandy } from '../../domain/streak';
import EscapeQuizDialog from '../encounter/EscapeQuizDialog.vue';
import BattlePanel from '../encounter/BattlePanel.vue';

const route = useRoute();
const router = useRouter();
const store = useAdventureStore();

const area = computed(() => getArea(String(route.params.areaId)));
// 沒有夥伴或地區未解鎖就回地圖
if (!store.hasStarter || !area.value || !store.isAreaUnlocked(area.value)) {
  void router.replace('/adventure');
}

const words = computed(() => (area.value ? wordsForArea(area.value) : []));

type Phase = 'intro' | 'capture' | 'battle' | 'caught' | 'lost';
const phase = ref<Phase>('intro');
const wild = shallowRef<{ species: Species; level: number; shiny: boolean } | null>(null);
const bonusEnergy = ref(0);
const isNew = ref(false);
const isNewShiny = ref(false);
const joinedTeam = ref(false);
const caughtUid = ref<string | null>(null);
/** 放生拿到的糖果；還沒放生是 null */
const releasedCandies = ref<number | null>(null);
const releaseReward = computed(() => {
  if (!wild.value) return 0;
  const base = RELEASE_CANDY[wild.value.species.rarity];
  const bonus = streakBonusCandy(store.encounterStreak);
  return base + bonus;
});
const encounterId = ref(0);
/** 這次遇到的是雷達鎖定的字靈 */
const radarFound = ref(false);
const showEscapeQuiz = ref(false);

const subtitle = computed(() =>
  area.value ? `已收服 ${store.caughtInArea(area.value)} / ${area.value.species.length} 種` : '',
);

/** 晚上喜歡夜晚的字靈比較常出現（進頁面時決定） */
const night = isNight();

/** 依稀有度權重抽出野生字靈（考量夜行性與 Streak 連勝熱度）；雷達有鎖定時，先看這次會不會直接遇到目標 */
const rollWild = () => {
  if (!area.value) return;
  const pool = area.value.species.map(getSpecies).filter(canAppearInWild);
  const byRarity = () => {
    const total = pool.reduce(
      (sum, s) => sum + dynamicWildWeight(s, night, store.encounterStreak),
      0,
    );
    let r = Math.random() * total;
    return (
      pool.find(
        (s) =>
          (r -= dynamicWildWeight(s, night, store.encounterStreak)) < 0,
      ) ?? pool[0]!
    );
  };
  const targetId = store.radarTargetIn(area.value);
  const target = targetId === null ? null : getSpecies(targetId);
  const species = pickWithRadar(target, byRarity);
  radarFound.value = species === target;

  const [min, max] = area.value.levels;
  wild.value = {
    species,
    level: min + randomInt(max - min + 1),
    shiny: rollShinyWithStreak(store.encounterStreak),
  };
  store.markSeen(species.id);
  // 出現時喊自己的英文名字
  WordPronunciation(species.english);
};

const nextEncounter = () => {
  bonusEnergy.value = 0;
  encounterId.value++;
  phase.value = 'intro';
  rollWild();
};

const requestEscape = () => {
  showEscapeQuiz.value = true;
};

const onEscaped = () => {
  store.resetStreak();
  nextEncounter();
};

const onEscapeFailed = () => {
  // 逃跑失敗，留在原遭遇畫面繼續面對
};

const startBattle = () => {
  phase.value = 'battle';
};

const onWon = () => {
  bonusEnergy.value = BATTLE_WIN_ENERGY;
  encounterId.value++;
  phase.value = 'capture';
};

const onBattleLost = () => {
  store.resetStreak();
  phase.value = 'lost';
};

const onCaught = () => {
  if (!wild.value || !store.partner) return;
  const { species, level, shiny } = wild.value;
  isNew.value = !store.isCaught(species.id);
  isNewShiny.value = shiny && !store.isShinyCaught(species.id);
  const caught = store.catchCreature(species.id, level, shiny);
  joinedTeam.value = store.isInTeam(caught.uid);
  caughtUid.value = caught.uid;
  releasedCandies.value = null;
  store.gainXp(store.partner.uid, CAPTURE_XP);
  store.incrementStreak();
  trackQuest({ type: 'catch' });
  phase.value = 'caught';
};

const release = () => {
  if (!caughtUid.value) return;
  releasedCandies.value = store.releaseDuplicate(caughtUid.value);
};

rollWild();
</script>

<style scoped>
.encounter {
  max-width: 640px;
  margin: 0 auto;
}
.scene {
  position: relative;
  height: clamp(160px, 30vh, 230px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  overflow: hidden;
}
.scene :deep(svg.creature) {
  width: min(150px, 22vh);
  height: min(150px, 22vh);
}
.appear {
  position: relative;
  animation: appear 0.6s ease-out;
}
.streak-bar {
  background: rgba(255, 237, 213, 0.85);
  border: 1px solid #fed7aa;
  border-radius: 10px;
}
.night-banner {
  font-weight: 700;
  color: #4338ca;
}
.radar-banner {
  font-weight: 700;
  color: #4f46e5;
}
.shiny-banner {
  font-weight: 700;
  color: #b45309;
  animation: glow 1.4s ease-in-out infinite;
}
@keyframes glow {
  50% {
    opacity: 0.55;
  }
}
.release {
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
  padding-top: 12px;
}
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@keyframes appear {
  from {
    transform: translateY(40px) scale(0.6);
    opacity: 0;
  }
}
</style>
