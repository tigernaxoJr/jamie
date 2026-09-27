<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle
        emoji="📖"
        title="字靈圖鑑"
        :subtitle="`發現 ${seenCount} 種 · 收服 ${caughtCount} / ${SPECIES.length} 種`"
        back="/adventure"
      />

      <q-linear-progress
        :value="caughtCount / SPECIES.length"
        color="accent"
        track-color="grey-3"
        size="12px"
        rounded
        class="q-mb-lg"
      />

      <div class="dex">
        <button
          v-for="s in SPECIES"
          :key="s.id"
          type="button"
          class="entry app-card"
          :class="{ 'entry--unknown': !store.isSeen(s.id) }"
          :disabled="!store.isSeen(s.id)"
          @click="open(s)"
        >
          <span class="entry__no">No.{{ pad(s.id) }}</span>
          <span v-if="store.isCaught(s.id)" class="entry__caught" title="已收服">✔</span>
          <CreatureSvg
            :species="s"
            :size="84"
            :silhouette="!store.isSeen(s.id)"
            :animated="false"
          />
          <span class="entry__name">{{ store.isSeen(s.id) ? s.name : '？？？' }}</span>
          <ElementBadge v-if="store.isSeen(s.id)" :element="s.element" />
        </button>
      </div>
    </div>

    <q-dialog v-model="dialog">
      <q-card v-if="selected" class="detail q-pa-md">
        <div class="row items-center">
          <span class="text-muted text-weight-bold">No.{{ pad(selected.id) }}</span>
          <q-space />
          <q-btn flat round icon="close" v-close-popup aria-label="關閉" />
        </div>
        <div class="text-center">
          <CreatureSvg :species="selected" :size="160" />
          <div class="text-h5 q-mt-sm">{{ selected.name }}</div>
          <div class="text-subtitle1 text-weight-bold">
            {{ selected.english }}
            <q-btn
              flat
              round
              dense
              icon="volume_up"
              color="primary"
              aria-label="發音"
              @click="WordPronunciation(selected.english)"
            />
            <span class="text-muted">（{{ selected.meaning }}）</span>
          </div>
          <div class="row justify-center q-gutter-sm q-mt-xs">
            <ElementBadge :element="selected.element" />
            <span class="pill">{{ RARITY_NAME[selected.rarity] }}</span>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="text-caption text-muted text-weight-bold">棲息地</div>
          <div>{{ habitatsOf(selected.id).join('、') || '未知' }}</div>
          <div class="text-caption text-muted text-weight-bold q-mt-sm">介紹</div>
          <div v-if="store.isCaught(selected.id)">{{ selected.description }}</div>
          <div v-else class="text-muted">收服後才能看到介紹喔！</div>
        </div>

        <div v-if="owned.length" class="q-mt-md">
          <div class="text-caption text-muted text-weight-bold q-mb-xs">
            我收服的{{ selected.name }}
          </div>
          <div v-for="c in owned" :key="c.uid" class="owned">
            <div class="row items-center no-wrap">
              <CreatureSvg
                :species="selected"
                :size="44"
                :animated="false"
                :evolved="(c.stage ?? 1) >= 2"
              />
              <div class="q-ml-sm">
                <div class="text-weight-bold">{{ creatureName(selected, c.stage) }}</div>
                <div class="text-caption text-muted">Lv {{ c.level }}</div>
              </div>
              <q-space />
              <q-chip v-if="store.partner?.uid === c.uid" dense color="primary" text-color="white">
                隊長
              </q-chip>
              <template v-else-if="store.isInTeam(c.uid)">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="設為隊長"
                  @click="store.setPartner(c.uid)"
                />
                <q-btn
                  flat
                  dense
                  color="grey-7"
                  label="移出"
                  @click="store.removeFromTeam(c.uid)"
                />
              </template>
              <q-btn
                v-else
                flat
                dense
                color="primary"
                icon="group_add"
                :label="teamFull ? '隊伍已滿' : '加入隊伍'"
                :disable="teamFull"
                @click="store.addToTeam(c.uid)"
              />
            </div>

            <!-- 進化 -->
            <div v-if="!evolveOf(c).evolved" class="evolve q-mt-xs">
              <div class="text-caption text-weight-bold">✨ 進化條件</div>
              <div class="evolve__row">
                <span>等級 Lv {{ evolveOf(c).needLevel }}</span>
                <span :class="c.level >= evolveOf(c).needLevel ? 'text-positive' : 'text-muted'">
                  {{ Math.min(c.level, evolveOf(c).needLevel) }} / {{ evolveOf(c).needLevel }}
                </span>
              </div>
              <div class="evolve__row">
                <span>熟練{{ evolveOf(c).wordLevelName }}單字</span>
                <span
                  :class="
                    evolveOf(c).mastered >= evolveOf(c).needMastered
                      ? 'text-positive'
                      : 'text-muted'
                  "
                >
                  {{ Math.min(evolveOf(c).mastered, evolveOf(c).needMastered) }} /
                  {{ evolveOf(c).needMastered }}
                </span>
              </div>
              <div class="text-caption text-muted">
                單字連續答對 3 次就算熟練，去單字測驗多練習吧！
              </div>
              <q-btn
                v-if="evolveOf(c).canEvolve"
                class="btn-3d full-width q-mt-sm"
                color="accent"
                text-color="dark"
                icon="auto_awesome"
                :label="`進化成${creatureName(selected, 2)}！`"
                @click="doEvolve(c)"
              />
            </div>
            <div v-else class="text-caption text-weight-bold text-orange-9 q-mt-xs">
              ✨ 已經進化，能力提升 30%
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageTitle from 'src/components/PageTitle.vue';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { habitatsOf } from '../../domain/areas';
import { RARITY_NAME, SPECIES, type Species, creatureName } from '../../domain/species';
import { TEAM_SIZE } from '../../domain/rules';
import { sfx } from 'src/modules/Games/shared';
import { type OwnedCreature, useAdventureStore } from '../../store/useAdventureStore';
import CreatureSvg from '../CreatureSvg.vue';
import ElementBadge from '../ElementBadge.vue';

const store = useAdventureStore();

const seenCount = computed(() => SPECIES.filter((s) => store.isSeen(s.id)).length);
const caughtCount = computed(() => SPECIES.filter((s) => store.isCaught(s.id)).length);

const pad = (n: number) => String(n).padStart(3, '0');

const dialog = ref(false);
const selected = ref<Species | null>(null);
const owned = computed(() =>
  selected.value ? store.creatures.filter((c) => c.speciesId === selected.value!.id) : [],
);

const teamFull = computed(() => store.team.length >= TEAM_SIZE);
const evolveOf = (c: OwnedCreature) => store.evolveStatus(c);
const doEvolve = (c: OwnedCreature) => {
  if (store.evolve(c.uid)) sfx.win();
};

const open = (s: Species) => {
  selected.value = s;
  dialog.value = true;
  WordPronunciation(s.english);
};
</script>

<style scoped lang="scss">
.dex {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}
.entry {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 22px 8px 12px;
  border: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: transform 0.15s;
  &:hover:not(:disabled) {
    transform: translateY(-3px);
  }
}
.entry--unknown {
  cursor: default;
  background: #eef1f5;
}
.entry__no {
  position: absolute;
  top: 8px;
  left: 10px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--app-muted);
}
.entry__caught {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: $positive;
  color: #fff;
  font-size: 0.75rem;
  line-height: 22px;
}
.entry__name {
  font-weight: 800;
}
.detail {
  width: 100%;
  max-width: 420px;
}
.owned {
  padding: 8px 10px;
  border-radius: 12px;
  background: #f5f7fa;
  margin-bottom: 8px;
}
.evolve {
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
}
.evolve__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
