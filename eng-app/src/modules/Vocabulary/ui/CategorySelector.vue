<template>
  <div class="category-selector q-pa-md">
    <div class="text-h5 text-weight-bold text-center q-mb-lg text-primary">
      <slot name="title">選擇類別</slot>
    </div>

    <div class="row q-mb-md justify-between items-center">
      <div class="q-gutter-x-sm">
        <q-btn
          outline
          dense
          color="primary"
          label="全部展開"
          icon="unfold_more"
          size="sm"
          @click="expandAll"
        />
        <q-btn
          outline
          dense
          color="primary"
          label="全部收合"
          icon="unfold_less"
          size="sm"
          @click="collapseAll"
        />
      </div>
      <q-btn
        flat
        dense
        color="negative"
        label="清空選擇"
        icon="delete_sweep"
        size="sm"
        @click="clearAll"
        :disable="modelValue.length === 0"
      />
    </div>

    <q-scroll-area
      style="height: 400px; max-width: 100%"
      class="border-radius-inherit bg-grey-1 rounded-borders q-pa-sm"
    >
      <q-list separator class="rounded-borders">
        <div
          v-for="parent in parentCategories"
          :key="parent.id"
          class="q-mb-sm bg-white shadow-1 rounded-borders overflow-hidden"
        >
          <q-expansion-item
            :model-value="!!expansionState[parent.id]"
            @update:model-value="(val) => (expansionState[parent.id] = val)"
            expand-separator
            header-class="text-weight-bold text-subtitle1"
            :label="parent.name"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar
                  icon="category"
                  color="primary"
                  text-color="white"
                  size="sm"
                  font-size="16px"
                />
              </q-item-section>

              <q-item-section>
                {{ parent.name }}
              </q-item-section>

              <q-item-section side v-if="getSelectedCountText(parent.id)">
                <q-badge color="secondary" :label="getSelectedCountText(parent.id)" />
              </q-item-section>
            </template>

            <div class="q-pa-md bg-grey-1">
              <div class="row q-col-gutter-sm">
                <div
                  v-for="cat in getSubCategories(parent.id)"
                  :key="cat.id"
                  class="col-6 col-sm-4"
                >
                  <q-checkbox
                    :model-value="modelValue.includes(cat.id)"
                    @update:model-value="toggleCategory(cat.id)"
                    :label="cat.name"
                    dense
                    color="primary"
                    class="full-width"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
      </q-list>
    </q-scroll-area>

    <q-card-actions align="center" class="q-mt-lg">
      <q-btn
        unelevated
        rounded
        color="primary"
        :label="confirmLabel"
        @click="$emit('confirm')"
        :disable="modelValue.length === 0"
        class="q-px-xl text-weight-bold shadow-2"
        size="lg"
      />
    </q-card-actions>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Category } from '../domain';

const props = defineProps<{
  modelValue: string[];
  categories: Category[];
  confirmLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  (e: 'confirm'): void;
}>();

const confirmLabel = computed(() => props.confirmLabel || '開始');

const parentCategories = computed(() => {
  return props.categories.filter((c) => !c.parentId);
});

// Expansion State Management
const expansionState = ref<Record<string, boolean>>({});

// Initialize expansion state (default all expanded)
watch(
  parentCategories,
  (parents) => {
    parents.forEach((p) => {
      if (expansionState.value[p.id] === undefined) {
        expansionState.value[p.id] = true;
      }
    });
  },
  { immediate: true },
);

const expandAll = () => {
  parentCategories.value.forEach((p) => {
    expansionState.value[p.id] = true;
  });
};

const collapseAll = () => {
  parentCategories.value.forEach((p) => {
    expansionState.value[p.id] = false;
  });
};

const getSubCategories = (parentId: string) => {
  return props.categories.filter((c) => c.parentId === parentId);
};

const toggleCategory = (id: string) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(id);
  if (index === -1) {
    newValue.push(id);
  } else {
    newValue.splice(index, 1);
  }
  emit('update:modelValue', newValue);
};

const clearAll = () => {
  emit('update:modelValue', []);
};

const getSelectedCountText = (parentId: string) => {
  const subCats = getSubCategories(parentId);
  const selectedCount = subCats.filter((c) => props.modelValue.includes(c.id)).length;
  if (selectedCount === 0) return '';
  return `${selectedCount}`;
};
</script>

<style scoped>
.border-radius-inherit {
  border-radius: inherit;
}
.category-selector {
  min-width: 300px;
}
</style>
