<template>
  <div class="partner app-card q-pa-md row items-center no-wrap">
    <CreatureSvg :species="species" :size="100" />
    <div class="col q-ml-md">
      <div class="text-caption text-muted text-weight-bold">我的夥伴</div>
      <div class="row items-center q-gutter-x-sm">
        <span class="text-h6">{{ species.name }}</span>
        <span class="text-muted text-weight-bold">{{ species.english }}</span>
        <ElementBadge :element="species.element" />
      </div>
      <div class="text-weight-bold q-mt-xs">
        Lv {{ creature.level }}
        <span class="text-muted text-caption q-ml-sm">
          ❤️ {{ maxHp(species, creature.level) }} · ⚔️ {{ attack(species, creature.level) }}
        </span>
      </div>
      <q-linear-progress
        :value="creature.xp / xpToNext(creature.level)"
        color="accent"
        track-color="grey-3"
        size="8px"
        rounded
        class="q-mt-xs"
      />
      <div class="text-caption text-muted">
        經驗值 {{ creature.xp }} / {{ xpToNext(creature.level) }}
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getSpecies } from '../domain/species';
import { attack, maxHp, xpToNext } from '../domain/rules';
import type { OwnedCreature } from '../store/useAdventureStore';
import CreatureSvg from './CreatureSvg.vue';
import ElementBadge from './ElementBadge.vue';

const props = defineProps<{ creature: OwnedCreature }>();
const species = computed(() => getSpecies(props.creature.speciesId));
</script>
