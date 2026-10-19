<template>
  <div class="row items-center q-gutter-xs">
    <button
      type="button"
      class="filter"
      :class="{ 'filter--on': filter === null }"
      @click="filter = null"
    >
      全部
    </button>
    <button
      v-for="el in elements"
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
</template>

<script setup lang="ts">
import { type Element, ELEMENTS } from '../../domain/elements';

/** 依屬性篩選（只列出有收服的屬性）與排序 */
defineProps<{ elements: Element[] }>();
const filter = defineModel<Element | null>('filter', { required: true });
const sort = defineModel<'level' | 'recent'>('sort', { required: true });
</script>

<style scoped lang="scss">
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
</style>
