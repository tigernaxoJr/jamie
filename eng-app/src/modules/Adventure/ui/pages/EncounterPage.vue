<template>
  <q-page padding>
    <div v-if="area && wild && store.partner" class="encounter">
      <PageTitle :emoji="area.emoji" :title="area.name" :subtitle="subtitle" back="/adventure" />

      <!-- 遇到字靈 -->
      <template v-if="phase === 'intro'">
        <div class="scene app-card" :style="{ background: area.background }">
          <div class="appear">
            <CreatureView :species="wild.species" :size="160" :shiny="wild.shiny" />
          </div>
        </div>
        <div class="app-card q-pa-md q-mt-md text-center">
          <div v-if="wild.shiny" class="shiny-banner">✨ 是很少見的色違字靈！</div>
          <div v-if="radarFound" class="radar-banner">📡 雷達找到了！就是牠！</div>
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
          <q-btn flat color="grey-7" icon="directions_run" label="逃跑" @click="nextEncounter" />
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
        :bonus-energy="bonusEnergy"
        :shiny="wild.shiny"
        @caught="onCaught"
        @leave="nextEncounter"
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
        @won="onWon"
        @lost="phase = 'lost'"
        @leave="nextEncounter"
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
import { type Rarity, type Species, RARITY_NAME, getSpecies } from '../../domain/species';
import { BATTLE_WIN_ENERGY, CAPTURE_XP } from '../../domain/rules';
import { RELEASE_CANDY } from '../../domain/candy';
import { rollShiny } from '../../domain/shiny';
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
const releaseReward = computed(() => (wild.value ? RELEASE_CANDY[wild.value.species.rarity] : 0));
const encounterId = ref(0);
/** 這次遇到的是雷達鎖定的字靈 */
const radarFound = ref(false);

const subtitle = computed(() =>
  area.value ? `已收服 ${store.caughtInArea(area.value)} / ${area.value.species.length} 種` : '',
);

const WEIGHT: Record<Rarity, number> = { common: 6, uncommon: 3, rare: 1, legendary: 0.5 };

/** 依稀有度權重抽出野生字靈；雷達有鎖定時，先看這次會不會直接遇到目標 */
const rollWild = () => {
  if (!area.value) return;
  const pool = area.value.species.map(getSpecies).filter(canAppearInWild);
  const byRarity = () => {
    const total = pool.reduce((sum, s) => sum + WEIGHT[s.rarity], 0);
    let r = Math.random() * total;
    return pool.find((s) => (r -= WEIGHT[s.rarity]) < 0) ?? pool[0]!;
  };
  const targetId = store.radarTargetIn(area.value);
  const target = targetId === null ? null : getSpecies(targetId);
  const species = pickWithRadar(target, byRarity);
  radarFound.value = species === target;
  const [min, max] = area.value.levels;
  wild.value = { species, level: min + randomInt(max - min + 1), shiny: rollShiny() };
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

const startBattle = () => {
  phase.value = 'battle';
};

const onWon = () => {
  bonusEnergy.value = BATTLE_WIN_ENERGY;
  encounterId.value++;
  phase.value = 'capture';
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
  animation: appear 0.6s ease-out;
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
