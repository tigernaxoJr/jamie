<template>
  <!-- 換人：先選下面的字靈，再點要換下來的隊員 -->
  <div v-if="swapping && selected" class="hint hint--swap">
    <span
      >要讓 <b>{{ nameOf(selected) }}</b> 換掉誰？點上面的隊員</span
    >
    <q-btn flat dense color="grey-8" label="取消" @click="swapping = false" />
  </div>

  <!-- 選到的字靈可以做什麼 -->
  <div v-else-if="selected" class="actions">
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
      v-else-if="store.team.length < TEAM_SIZE"
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
      @click="evolve(selected)"
    />
    <EvolveDialog v-model="evolving" />
  </div>

  <div v-else class="hint">點一隻字靈，可以加入隊伍、換上場或設為隊長</div>
</template>

<script setup lang="ts">
import { sfx } from 'src/modules/Games/shared';
import { creatureName, getSpecies } from '../../domain/species';
import { TEAM_SIZE } from '../../domain/rules';
import { ref } from 'vue';
import EvolveDialog from '../EvolveDialog.vue';
import { type OwnedCreature, useAdventureStore } from '../../store/useAdventureStore';

/** 隊伍列下方的操作：加入、移出、設為隊長、換上場、進化 */
defineProps<{ selected: OwnedCreature | undefined }>();
/** 隊伍滿了要換人時為 true，等使用者點要換下來的隊員 */
const swapping = defineModel<boolean>('swapping', { required: true });

const store = useAdventureStore();

const nameOf = (c: OwnedCreature) => creatureName(getSpecies(c.speciesId), c.stage);

const add = (uid: string) => {
  if (store.addToTeam(uid)) sfx.correct();
};

const remove = (uid: string) => {
  store.removeFromTeam(uid);
  sfx.click();
};

/** 有專屬進化的字靈（初始夥伴）要先拼出新名字，其他的直接進化 */
const evolving = ref<OwnedCreature | null>(null);
const evolve = (c: OwnedCreature) => {
  if (getSpecies(c.speciesId).evolution) evolving.value = c;
  else if (store.evolve(c.uid)) sfx.win();
};
</script>

<style scoped lang="scss">
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
</style>
