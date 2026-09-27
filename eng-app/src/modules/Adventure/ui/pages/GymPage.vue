<template>
  <q-page padding>
    <div v-if="area && store.partner" class="gym">
      <PageTitle
        :emoji="area.emoji"
        :title="`${area.name}館主`"
        :subtitle="area.leader.badge"
        back="/adventure"
      />

      <!-- 開場 -->
      <template v-if="phase === 'intro'">
        <div class="leader app-card q-pa-lg text-center" :style="{ background: area.background }">
          <div class="leader__avatar">{{ area.leader.emoji }}</div>
          <div class="leader__speech">
            我是館主<b>{{ area.leader.name }}</b
            >！<br />
            打贏我的 {{ opponents.length }} 隻字靈，就把<b>{{ area.leader.badge }}</b
            >送給你！
          </div>
          <div class="row justify-center q-gutter-md q-mt-md">
            <div v-for="(o, i) in opponents" :key="i" class="opponent">
              <CreatureSvg :species="o.species" :size="72" :animated="false" />
              <div class="text-caption text-weight-bold">{{ o.species.name }} Lv {{ o.level }}</div>
              <ElementBadge :element="o.species.element" />
            </div>
          </div>
        </div>

        <div class="app-card q-pa-md q-mt-md">
          <div class="row items-center q-mb-xs">
            <div class="text-weight-bold">出戰隊伍</div>
            <q-space />
            <q-btn
              flat
              dense
              color="primary"
              icon="groups"
              label="調整隊伍"
              :to="{ path: '/adventure/team', query: { from: route.path } }"
            />
          </div>
          <div class="row q-gutter-md">
            <div v-for="c in store.team" :key="c.uid" class="text-center">
              <CreatureSvg
                :species="getSpecies(c.speciesId)"
                :size="60"
                :animated="false"
                :evolved="(c.stage ?? 1) >= 2"
              />
              <div class="text-caption text-weight-bold">
                {{ creatureName(getSpecies(c.speciesId), c.stage) }} Lv {{ c.level }}
              </div>
              <div class="column items-center q-gutter-y-xs q-mt-xs">
                <MatchupTag
                  v-for="m in matchupsOf(getSpecies(c.speciesId).element)"
                  :key="m.text"
                  :good="m.good"
                  >{{ m.text }}</MatchupTag
                >
              </div>
            </div>
          </div>
          <div v-if="store.team.length < TEAM_SIZE" class="text-caption text-muted q-mt-xs">
            隊伍最多 {{ TEAM_SIZE }} 隻，點「調整隊伍」可以加入更多字靈。
          </div>
          <div v-else class="text-caption text-muted q-mt-xs">選剋制對手屬性的字靈，傷害加倍！</div>
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
        :enemies="opponents"
        :team="store.team"
        mode="gym"
        :intro="`館主${area.leader.name}派出了${opponents[0]?.species.name}！`"
        :words="words"
        :background="area.background"
        @won="onWon"
        @lost="phase = 'lost'"
        @leave="phase = 'lost'"
      />

      <!-- 勝利 -->
      <div v-else-if="phase === 'won'" class="app-card q-pa-lg text-center">
        <div class="badge-icon">🏅</div>
        <div class="text-h5 q-mt-sm">得到了{{ area.leader.badge }}！</div>
        <div class="text-muted q-mt-xs">{{ summary }}</div>
        <div v-if="nextArea && firstWin" class="pill q-mt-md">
          🔓 解鎖新地區：{{ nextArea.emoji }} {{ nextArea.name }}
        </div>
        <div class="column q-gutter-sm q-mt-lg">
          <q-btn
            class="btn-3d"
            size="lg"
            color="primary"
            icon="map"
            label="回地圖"
            to="/adventure"
          />
        </div>
      </div>

      <!-- 失敗 -->
      <div v-else-if="phase === 'lost'" class="app-card q-pa-lg text-center">
        <div style="font-size: 3rem">😤</div>
        <div class="text-h6">差一點！館主{{ area.leader.name }}太強了</div>
        <div class="text-muted">多練幾個單字、讓字靈升級或進化，再來挑戰吧！</div>
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
import { useRoute, useRouter } from 'vue-router';
import PageTitle from 'src/components/PageTitle.vue';
import { AREAS, getArea, leaderLevels } from '../../domain/areas';
import { creatureName, getSpecies } from '../../domain/species';
import { type Opponent, TEAM_SIZE } from '../../domain/rules';
import { wordsForArea } from '../../domain/words';
import { useAdventureStore } from '../../store/useAdventureStore';
import { type Element, effectiveness } from '../../domain/elements';
import CreatureSvg from '../CreatureSvg.vue';
import ElementBadge from '../ElementBadge.vue';
import MatchupTag from '../MatchupTag.vue';
import BattlePanel from '../encounter/BattlePanel.vue';

const route = useRoute();
const router = useRouter();
const store = useAdventureStore();

const area = computed(() => getArea(String(route.params.areaId)));
// 條件不符就回地圖
if (
  !store.hasStarter ||
  !area.value ||
  !store.isAreaUnlocked(area.value) ||
  !store.canChallengeGym(area.value)
) {
  void router.replace('/adventure');
}

const words = computed(() => (area.value ? wordsForArea(area.value) : []));
const opponents = computed<Opponent[]>(() => {
  if (!area.value) return [];
  const levels = leaderLevels(area.value);
  return area.value.leader.team.map((id, i) => ({ species: getSpecies(id), level: levels[i]! }));
});

/** 這隻隊員剋幾隻對手、怕幾隻對手 */
const matchupsOf = (el: Element) => {
  const species = opponents.value.map((o) => o.species);
  const strong = species.filter((s) => effectiveness(el, s.element) > 1).length;
  const weak = species.filter((s) => effectiveness(s.element, el) > 1).length;
  return [
    ...(strong ? [{ text: `剋 ${strong} 隻`, good: true }] : []),
    ...(weak ? [{ text: `怕 ${weak} 隻`, good: false }] : []),
  ];
};

const nextArea = computed(() => AREAS.find((a) => a.unlockAfter === area.value?.id));

type Phase = 'intro' | 'battle' | 'won' | 'lost';
const phase = ref<Phase>('intro');
const battleId = ref(0);
const summary = ref('');
const firstWin = ref(false);

const onWon = (text: string) => {
  if (!area.value) return;
  firstWin.value = !store.hasBadge(area.value.id);
  store.earnBadge(area.value.id);
  summary.value = text;
  phase.value = 'won';
};

const retry = () => {
  battleId.value++;
  phase.value = 'battle';
};
</script>

<style scoped>
.gym {
  max-width: 640px;
  margin: 0 auto;
}
.leader__avatar {
  font-size: 4.5rem;
  line-height: 1;
}
.leader__speech {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  line-height: 1.6;
}
.opponent {
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
}
.badge-icon {
  font-size: 5rem;
  line-height: 1;
  animation: pop 0.6s ease-out;
}
@keyframes pop {
  from {
    transform: scale(0.2) rotate(-30deg);
    opacity: 0;
  }
}
</style>
