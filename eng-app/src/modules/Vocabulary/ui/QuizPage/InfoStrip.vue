<template>
  <div class="absolute-bottom q-pa-md full-width">
    <q-separator inset class="q-my-md" />
    <div class="text-subtitle1 q-mb-sm text-grey-8 text-center">測驗進度</div>

    <div class="row q-col-gutter-sm justify-center">
      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">總單字數</div>
        <div class="text-body1 text-weight-medium">{{ meta.count }}</div>
      </div>

      <q-separator vertical spaced inset class="gt-sm" />

      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">連答錯 1 次</div>
        <div class="text-body1 text-negative text-weight-medium">{{ meta.e1 }}</div>
      </div>

      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">連答錯 2 次</div>
        <div class="text-body1 text-negative text-weight-medium">{{ meta.e2 }}</div>
      </div>

      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">連答錯 3+ 次</div>
        <div class="text-body1 text-negative text-weight-medium">{{ meta.e3 }}</div>
      </div>

      <q-separator vertical spaced inset class="gt-sm" />

      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">連答對 1 次</div>
        <div class="text-body1 text-positive text-weight-medium">{{ meta.c1 }}</div>
      </div>
      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">連答對 2 次</div>
        <div class="text-body1 text-positive text-weight-medium">{{ meta.c2 }}</div>
      </div>
      <div class="col-6 col-md-auto text-center">
        <div class="text-caption text-grey-7">連答對 3 次</div>
        <div class="text-body1 text-positive text-weight-medium">{{ meta.c3 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuizMeta } from '../../domain';
export interface IProps {
  meta: IQuizMeta;
}
withDefaults(defineProps<IProps>(), {});
</script>

<style scoped></style>
