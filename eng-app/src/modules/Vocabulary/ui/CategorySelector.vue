<template>
  <div class="category-selector">
    <div class="text-h5 text-center q-mb-xs">
      <slot name="title">選擇類別</slot>
    </div>
    <div class="text-center text-muted q-mb-md">點選想練習的主題，可以選很多個</div>

    <div class="row items-center q-mb-sm">
      <span class="pill">已選 {{ modelValue.length }} 個主題</span>
      <q-space />
      <q-btn flat dense size="sm" color="grey-8" label="全部展開" @click="setAll(true)" />
      <q-btn flat dense size="sm" color="grey-8" label="全部收合" @click="setAll(false)" />
      <q-btn
        flat
        dense
        size="sm"
        color="negative"
        label="清空"
        :disable="modelValue.length === 0"
        @click="emit('update:modelValue', [])"
      />
    </div>

    <div class="levels">
      <div
        v-for="(parent, idx) in parentCategories"
        :key="parent.id"
        class="level"
        :style="{ '--level-color': levelColor(idx) }"
      >
        <div class="level__head row items-center no-wrap" @click="toggleExpand(parent.id)">
          <div class="level__badge">{{ idx + 1 }}</div>
          <div class="level__name">{{ parent.name }}</div>
          <span v-if="selectedCount(parent.id)" class="level__count">
            {{ selectedCount(parent.id) }} / {{ subsOf(parent.id).length }}
          </span>
          <q-space />
          <q-btn
            flat
            dense
            size="sm"
            :label="isAllSelected(parent.id) ? '取消全選' : '全選'"
            class="level__all"
            @click.stop="toggleParent(parent.id)"
          />
          <q-icon
            name="expand_more"
            size="24px"
            class="level__chevron"
            :class="{ open: expanded[parent.id] }"
          />
        </div>
        <div v-show="expanded[parent.id]" class="level__body">
          <button
            v-for="cat in subsOf(parent.id)"
            :key="cat.id"
            type="button"
            class="topic"
            :class="{ 'topic--on': isSelected(cat.id) }"
            :aria-pressed="isSelected(cat.id)"
            @click="toggleCategory(cat.id)"
          >
            <q-icon v-if="isSelected(cat.id)" name="check" size="16px" />
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <q-btn
      class="btn-3d full-width q-mt-lg"
      size="lg"
      color="primary"
      icon="play_arrow"
      :label="confirmLabel"
      :disable="modelValue.length === 0"
      @click="emit('confirm')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

const LEVEL_COLORS = [
  '#1677d2',
  '#0ea5e9',
  '#14b8a6',
  '#22c55e',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#b45309',
  '#0f766e',
];
const levelColor = (idx: number) => LEVEL_COLORS[idx % LEVEL_COLORS.length];

const parentCategories = computed(() => props.categories.filter((c) => !c.parentId));
const subsOf = (parentId: string) => props.categories.filter((c) => c.parentId === parentId);

const selected = computed(() => new Set(props.modelValue));
const isSelected = (id: string) => selected.value.has(id);
const selectedCount = (parentId: string) => subsOf(parentId).filter((c) => isSelected(c.id)).length;
const isAllSelected = (parentId: string) => {
  const subs = subsOf(parentId);
  return subs.length > 0 && subs.every((c) => isSelected(c.id));
};

// 預設展開有選東西的級別；都沒選就展開第一級
const expanded = ref<Record<string, boolean>>({});
for (const p of parentCategories.value) expanded.value[p.id] = selectedCount(p.id) > 0;
const first = parentCategories.value[0];
if (first && props.modelValue.length === 0) expanded.value[first.id] = true;

const toggleExpand = (id: string) => {
  expanded.value[id] = !expanded.value[id];
};
const setAll = (open: boolean) => {
  for (const p of parentCategories.value) expanded.value[p.id] = open;
};

const toggleCategory = (id: string) => {
  emit(
    'update:modelValue',
    isSelected(id) ? props.modelValue.filter((x) => x !== id) : [...props.modelValue, id],
  );
};

const toggleParent = (parentId: string) => {
  const subIds = subsOf(parentId).map((c) => c.id);
  if (isAllSelected(parentId)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((id) => !subIds.includes(id)),
    );
  } else {
    emit('update:modelValue', [...new Set([...props.modelValue, ...subIds])]);
    expanded.value[parentId] = true;
  }
};
</script>

<style scoped lang="scss">
.levels {
  max-height: 50vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px;
}
.level {
  border: 2px solid var(--app-line);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}
.level__head {
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}
.level__badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--level-color);
  color: #fff;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.level__name {
  font-weight: 800;
  font-size: 1.05rem;
}
.level__count {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--level-color);
}
.level__all {
  color: var(--level-color);
  font-weight: 800;
}
.level__chevron {
  color: var(--app-muted);
  transition: transform 0.2s;
  &.open {
    transform: rotate(180deg);
  }
}
.level__body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 12px 12px;
}
.topic {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 2px solid var(--app-line);
  background: #fff;
  font: inherit;
  font-weight: 700;
  color: var(--app-ink);
  cursor: pointer;
  transition: all 0.12s;
  &:hover {
    border-color: var(--level-color);
  }
}
.topic--on {
  background: var(--level-color);
  border-color: var(--level-color);
  color: #fff;
}
</style>
