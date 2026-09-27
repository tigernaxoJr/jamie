<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle
        emoji="🤝"
        title="隊伍管理"
        :subtitle="`收服了 ${store.creatures.length} 隻字靈，最多 ${TEAM_SIZE} 隻出戰`"
        :back="backTo"
      />

      <!-- 目前的隊伍：固定在上方 -->
      <div class="team-bar app-card q-pa-sm">
        <div class="team">
          <button
            v-for="(c, i) in slots"
            :key="c?.uid ?? `empty-${i}`"
            type="button"
            class="slot"
            :class="{
              'slot--selected': c && selectedUid === c.uid,
              'slot--swap': swapping && c,
            }"
            :disabled="!c"
            @click="c && tapSlot(c)"
          >
            <template v-if="c">
              <span v-if="i === 0" class="tag tag--leader">隊長</span>
              <CreatureSvg
                :species="getSpecies(c.speciesId)"
                :size="56"
                :animated="false"
                :evolved="(c.stage ?? 1) >= 2"
              />
              <span class="slot__name ellipsis">{{ nameOf(c) }}</span>
              <span class="row items-center no-wrap q-gutter-x-xs">
                <span class="text-caption text-weight-bold">Lv {{ c.level }}</span>
                <ElementBadge :element="getSpecies(c.speciesId).element" />
              </span>
            </template>
            <span v-else class="slot__empty">
              <q-icon name="add" size="24px" />
              <span class="text-caption">空位</span>
            </span>
          </button>
        </div>

        <!-- 換人：先選下面的字靈，再點要換下來的隊員 -->
        <div v-if="swapping && selected" class="hint hint--swap q-mt-sm">
          <span
            >要讓 <b>{{ nameOf(selected) }}</b> 換掉誰？點上面的隊員</span
          >
          <q-btn flat dense color="grey-8" label="取消" @click="swapping = false" />
        </div>

        <!-- 選到的字靈可以做什麼 -->
        <div v-else-if="selected" class="actions q-mt-sm">
          <span class="text-weight-bold ellipsis">{{ nameOf(selected) }}</span>
          <q-space />
          <template v-if="store.isInTeam(selected.uid)">
            <q-btn
              v-if="store.partner?.uid !== selected.uid"
              dense
              unelevated
              color="primary"
              label="設為隊長"
              @click="store.setPartner(selected.uid)"
            />
            <q-btn
              v-if="store.team.length > 1"
              dense
              flat
              color="grey-8"
              label="移出"
              @click="remove(selected.uid)"
            />
          </template>
          <q-btn
            v-else-if="!teamFull"
            dense
            unelevated
            color="primary"
            icon="group_add"
            label="加入隊伍"
            @click="add(selected.uid)"
          />
          <q-btn
            v-else
            dense
            unelevated
            color="primary"
            icon="swap_horiz"
            label="換上場"
            @click="swapping = true"
          />
          <q-btn
            v-if="store.evolveStatus(selected).canEvolve"
            dense
            unelevated
            color="accent"
            text-color="dark"
            icon="auto_awesome"
            label="進化"
            @click="evolve(selected.uid)"
          />
        </div>

        <div v-else class="hint q-mt-sm">點一隻字靈，可以加入隊伍、換上場或設為隊長</div>
      </div>

      <!-- 篩選與排序 -->
      <div class="row items-center q-gutter-xs q-my-md">
        <button
          type="button"
          class="filter"
          :class="{ 'filter--on': filter === null }"
          @click="filter = null"
        >
          全部
        </button>
        <button
          v-for="el in ownedElements"
          :key="el"
          type="button"
          class="filter"
          :class="{ 'filter--on': filter === el }"
          @click="filter = el"
        >
          {{ ELEMENTS[el].emoji }} {{ ELEMENTS[el].name }}
        </button>
        <q-space />
        <q-btn-toggle
          v-model="sort"
          dense
          unelevated
          rounded
          no-caps
          toggle-color="primary"
          color="grey-2"
          text-color="dark"
          :options="[
            { label: '等級', value: 'level' },
            { label: '最新', value: 'recent' },
          ]"
        />
      </div>

      <!-- 所有收服的字靈 -->
      <div class="box">
        <button
          v-for="c in list"
          :key="c.uid"
          type="button"
          class="card app-card"
          :class="{
            'card--selected': selectedUid === c.uid,
            'card--team': store.isInTeam(c.uid),
          }"
          @click="tapCard(c)"
        >
          <span v-if="store.partner?.uid === c.uid" class="tag tag--leader">隊長</span>
          <span v-else-if="store.isInTeam(c.uid)" class="tag tag--team">隊伍中</span>
          <span v-if="store.evolveStatus(c).canEvolve" class="tag tag--evolve">可以進化！</span>
          <CreatureSvg
            :species="getSpecies(c.speciesId)"
            :size="72"
            :animated="false"
            :evolved="(c.stage ?? 1) >= 2"
          />
          <span class="card__name ellipsis">{{ nameOf(c) }}</span>
          <span class="row items-center no-wrap q-gutter-x-xs">
            <span class="text-caption text-weight-bold">Lv {{ c.level }}</span>
            <ElementBadge :element="getSpecies(c.speciesId).element" />
          </span>
          <span class="card__matchup">{{ matchupText(getSpecies(c.speciesId).element) }}</span>
        </button>
      </div>
      <div v-if="list.length === 0" class="text-center text-muted q-pa-lg">
        還沒有這個屬性的字靈，去探險收服吧！
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import PageTitle from 'src/components/PageTitle.vue';
import { sfx } from 'src/modules/Games/shared';
import { type Element, ELEMENTS, strongAgainst, weakAgainst } from '../../domain/elements';
import { creatureName, getSpecies } from '../../domain/species';
import { TEAM_SIZE } from '../../domain/rules';
import { type OwnedCreature, useAdventureStore } from '../../store/useAdventureStore';
import CreatureSvg from '../CreatureSvg.vue';
import ElementBadge from '../ElementBadge.vue';

const route = useRoute();
const store = useAdventureStore();

// 從館主頁過來的，調整完回館主頁
const backTo = computed(() =>
  typeof route.query.from === 'string' && route.query.from.startsWith('/adventure')
    ? route.query.from
    : '/adventure',
);

const slots = computed(() => Array.from({ length: TEAM_SIZE }, (_, i) => store.team[i]));
const teamFull = computed(() => store.team.length >= TEAM_SIZE);

const nameOf = (c: OwnedCreature) => creatureName(getSpecies(c.speciesId), c.stage);

/** 例如「剋 ⚡ · 怕 💧」；光屬性「不怕任何屬性」 */
const matchupText = (el: Element) => {
  const strong = strongAgainst(el).map((e) => ELEMENTS[e].emoji);
  const weak = weakAgainst(el).map((e) => ELEMENTS[e].emoji);
  const parts = [
    strong.length ? `剋 ${strong.join('')}` : '',
    weak.length ? `怕 ${weak.join('')}` : '',
  ];
  return parts.filter(Boolean).join(' · ') || '不怕任何屬性';
};

// ---------- 篩選與排序 ----------

const filter = ref<Element | null>(null);
const sort = ref<'level' | 'recent'>('level');

const ownedElements = computed(() => {
  const set = new Set(store.creatures.map((c) => getSpecies(c.speciesId).element));
  return (Object.keys(ELEMENTS) as Element[]).filter((el) => set.has(el));
});

const list = computed(() => {
  const all = store.creatures.filter(
    (c) => filter.value === null || getSpecies(c.speciesId).element === filter.value,
  );
  // creatures 依收服順序排列，最新的在最後
  return sort.value === 'recent'
    ? [...all].reverse()
    : [...all].sort((a, b) => b.level - a.level || a.speciesId - b.speciesId);
});

// ---------- 選擇與操作 ----------

const selectedUid = ref<string | null>(null);
const selected = computed(() => store.creatures.find((c) => c.uid === selectedUid.value));
const swapping = ref(false);

const tapCard = (c: OwnedCreature) => {
  swapping.value = false;
  selectedUid.value = selectedUid.value === c.uid ? null : c.uid;
  sfx.click();
};

const tapSlot = (c: OwnedCreature) => {
  if (swapping.value && selectedUid.value) {
    store.replaceInTeam(c.uid, selectedUid.value);
    swapping.value = false;
    sfx.correct();
    return;
  }
  tapCard(c);
};

const add = (uid: string) => {
  if (store.addToTeam(uid)) sfx.correct();
};

const remove = (uid: string) => {
  store.removeFromTeam(uid);
  sfx.click();
};

const evolve = (uid: string) => {
  if (store.evolve(uid)) sfx.win();
};
</script>

<style scoped lang="scss">
.team-bar {
  position: sticky;
  /* 避開頂部 header（60px） */
  top: 68px;
  z-index: 2;
}
.team {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.slot,
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.slot {
  padding: 18px 6px 8px;
  border: 3px solid transparent;
  border-radius: 14px;
  background: #f5f7fa;
  &:disabled {
    cursor: default;
  }
}
.slot--swap {
  border-style: dashed;
  border-color: $primary;
  animation: pulse 1s ease-in-out infinite;
}
.slot__name,
.card__name {
  max-width: 100%;
  font-weight: 800;
}
.slot__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  color: #94a3b8;
}
.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  font-size: 0.85rem;
  color: var(--app-muted);
  text-align: center;
}
.hint--swap {
  color: inherit;
  font-weight: 700;
}
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 4px;
}
.filter {
  padding: 4px 12px;
  border: 2px solid var(--app-line);
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 800;
  color: inherit;
  cursor: pointer;
}
.filter--on {
  border-color: $primary;
  background: $primary;
  color: #fff;
}
.box {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}
.card {
  padding: 24px 8px 10px;
  border: 3px solid transparent;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-3px);
  }
}
.slot--selected,
.card--selected {
  border-color: $primary;
}
.card--team {
  background: #f0f9ff;
}
.card__matchup {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--app-muted);
}
.tag {
  position: absolute;
  top: 5px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
}
.tag--leader,
.tag--team {
  left: 6px;
}
.tag--leader {
  background: $primary;
  color: #fff;
}
.tag--team {
  background: #e0f2fe;
  color: #075985;
}
.tag--evolve {
  right: 6px;
  background: #fef3c7;
  color: #b45309;
}
@keyframes pulse {
  50% {
    transform: scale(1.04);
  }
}
</style>
