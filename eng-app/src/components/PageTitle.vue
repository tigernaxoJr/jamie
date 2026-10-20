<template>
  <div class="page-title row items-center q-mb-lg">
    <q-btn
      v-if="back"
      flat
      round
      icon="arrow_back"
      color="grey-8"
      class="q-mr-sm"
      :to="back"
      aria-label="返回"
    />
    <div v-if="emoji" class="page-title__emoji">{{ emoji }}</div>
    <div class="col page-title__main">
      <h1 class="page-title__text">{{ title }}</h1>
      <div v-if="subtitle" class="text-muted">{{ subtitle }}</div>
    </div>
    <div v-if="$slots.actions" class="page-title__actions row items-center no-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; emoji?: string; back?: string }>();
</script>

<style scoped>
.page-title__emoji {
  font-size: 2.4rem;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: var(--app-shadow);
  margin-right: 14px;
  flex-shrink: 0;
}
.page-title__text {
  font-size: 1.75rem;
  line-height: 1.2;
  margin: 0;
}
.page-title__main {
  min-width: 9rem;
}
@media (max-width: 599px) {
  .page-title__actions {
    flex: 1 0 100%;
    margin-top: 10px;
  }
  .page-title__actions > :deep(.q-btn:last-child) {
    margin-right: 0;
  }
  .page-title__text {
    font-size: 1.4rem;
  }
  .page-title__emoji {
    font-size: 1.9rem;
    width: 3rem;
    height: 3rem;
  }
}
</style>
