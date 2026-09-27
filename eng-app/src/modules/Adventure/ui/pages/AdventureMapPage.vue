<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle emoji="🧭" title="字靈探險隊" subtitle="答對單字，收服各地的字靈！" back="/games">
        <template #actions>
          <q-btn
            class="btn-3d"
            color="accent"
            text-color="dark"
            icon="menu_book"
            :label="`圖鑑 ${caughtCount}/${SPECIES.length}`"
            to="/adventure/dex"
          />
        </template>
      </PageTitle>

      <!-- 第一次玩：選夥伴 -->
      <section v-if="!store.hasStarter" class="app-card q-pa-lg">
        <div class="text-h5 text-center">選擇你的第一隻夥伴</div>
        <div class="text-center text-muted q-mb-lg">牠會陪你一起探險、一起對戰</div>
        <div class="starters">
          <button
            v-for="s in starters"
            :key="s.id"
            type="button"
            class="starter"
            :class="{ 'starter--on': picked === s.id }"
            @click="pick(s.id)"
          >
            <CreatureSvg :species="s" :size="120" />
            <div class="text-h6">{{ s.name }}</div>
            <div class="text-weight-bold text-muted">
              {{ s.english }}
              <q-icon name="volume_up" size="16px" color="primary" />
            </div>
            <ElementBadge :element="s.element" class="q-mt-xs" />
            <div class="text-caption text-muted q-mt-sm">{{ s.description }}</div>
          </button>
        </div>
        <q-btn
          class="btn-3d full-width q-mt-lg"
          size="lg"
          color="primary"
          :disable="!picked"
          :label="picked ? `就決定是你了，${pickedName}！` : '先選一隻夥伴'"
          @click="confirmStarter"
        />
      </section>

      <template v-else>
        <TeamCard class="q-mb-lg" />

        <div class="row items-center q-mb-sm">
          <div class="text-h6">🗺️ 探險地圖</div>
          <q-space />
          <span class="pill">🏅 徽章 {{ store.badgeCount }} / {{ AREAS.length }}</span>
        </div>
        <div class="areas">
          <div
            v-for="(area, i) in AREAS"
            :key="area.id"
            class="area app-card"
            :class="{ 'area--locked': !store.isAreaUnlocked(area) }"
          >
            <div class="area__scene" :style="{ background: area.background }">
              <span class="area__emoji">{{ area.emoji }}</span>
              <div class="area__peek">
                <CreatureSvg
                  v-for="id in area.species.slice(0, 3)"
                  :key="id"
                  :species="getSpecies(id)"
                  :size="44"
                  :silhouette="!store.isSeen(id)"
                  :animated="false"
                />
              </div>
            </div>
            <div class="q-pa-md">
              <div class="row items-center no-wrap">
                <div class="text-h6">{{ area.name }}</div>
                <span v-if="store.hasBadge(area.id)" class="q-ml-xs" :title="area.leader.badge"
                  >🏅</span
                >
                <q-space />
                <span class="pill">第 {{ i + 1 }} 級單字</span>
              </div>
              <div class="text-muted">{{ area.description }}</div>
              <div class="row items-center q-mt-sm text-caption text-weight-bold">
                <span>字靈 Lv {{ area.levels[0] }}～{{ area.levels[1] }}</span>
                <q-space />
                <span>已收服 {{ store.caughtInArea(area) }} / {{ area.species.length }}</span>
              </div>
              <template v-if="store.isAreaUnlocked(area)">
                <q-btn
                  class="btn-3d full-width q-mt-sm"
                  color="primary"
                  icon="explore"
                  label="去探索"
                  :to="`/adventure/explore/${area.id}`"
                />
                <q-btn
                  v-if="store.canChallengeGym(area)"
                  class="full-width q-mt-sm"
                  outline
                  :color="store.hasBadge(area.id) ? 'grey-7' : 'deep-orange'"
                  icon="emoji_events"
                  :label="`${store.hasBadge(area.id) ? '再次挑戰' : '挑戰'}館主 ${area.leader.emoji} ${area.leader.name}`"
                  :to="`/adventure/gym/${area.id}`"
                />
                <div v-else class="gym-hint q-mt-sm">
                  {{ area.leader.emoji }} 在這區收服
                  {{ GYM_REQUIRED_CAUGHT }} 種字靈，就能挑戰館主{{ area.leader.name }}
                </div>
              </template>
              <div v-else class="locked q-mt-sm">
                🔒 打贏{{ getArea(area.unlockAfter!)?.name }}的館主{{
                  getArea(area.unlockAfter!)?.leader.name
                }}後解鎖
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageTitle from 'src/components/PageTitle.vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { sfx } from 'src/modules/Games/shared';
import { AREAS, getArea } from '../../domain/areas';
import { SPECIES, STARTER_IDS, getSpecies } from '../../domain/species';
import { GYM_REQUIRED_CAUGHT, STARTER_LEVEL } from '../../domain/rules';
import { useAdventureStore } from '../../store/useAdventureStore';
import CreatureSvg from '../CreatureSvg.vue';
import ElementBadge from '../ElementBadge.vue';
import TeamCard from '../TeamCard.vue';

const store = useAdventureStore();

const caughtCount = computed(() => SPECIES.filter((s) => store.isCaught(s.id)).length);

const starters = STARTER_IDS.map(getSpecies);
const picked = ref<number | null>(null);
const pickedName = computed(() => (picked.value ? getSpecies(picked.value).name : ''));

const pick = (id: number) => {
  picked.value = id;
  WordPronunciation(getSpecies(id).english);
};

const confirmStarter = () => {
  if (!picked.value) return;
  store.catchCreature(picked.value, STARTER_LEVEL);
  sfx.win();
};
</script>

<style scoped lang="scss">
.starters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.starter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 3px solid var(--app-line);
  border-radius: var(--app-radius);
  background: #fff;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
  &:hover {
    transform: translateY(-3px);
  }
}
.starter--on {
  border-color: $primary;
  background: rgba(22, 119, 210, 0.05);
}
.areas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.area {
  overflow: hidden;
}
.area__scene {
  position: relative;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.area__emoji {
  position: absolute;
  top: 10px;
  left: 14px;
  font-size: 2.2rem;
}
.area__peek {
  display: flex;
  gap: 4px;
  padding-bottom: 6px;
}
.area--locked .area__scene {
  filter: grayscale(0.9) brightness(0.8);
}
.gym-hint {
  padding: 8px 10px;
  border-radius: 12px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}
.locked {
  padding: 10px;
  border-radius: 12px;
  background: #f1f5f9;
  text-align: center;
  font-weight: 700;
  color: var(--app-muted);
}
</style>
