<template>
  <div v-if="available" class="update-notice row items-center no-wrap q-px-md q-py-sm">
    <q-icon name="system_update" size="22px" class="q-mr-sm" />
    <div class="col text-body2 text-weight-bold">有新版本可以使用了！</div>
    <q-btn
      unelevated
      dense
      color="white"
      text-color="primary"
      label="更新"
      class="q-px-md"
      @click="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEventListener } from '@vueuse/core';

/** 與 src-pwa/register-service-worker.ts 的 UPDATE_EVENT 相同 */
const UPDATE_EVENT = 'app-update-available';

const available = ref(false);
useEventListener(window, UPDATE_EVENT, () => (available.value = true));

const reload = () => window.location.reload();
</script>

<style scoped>
.update-notice {
  background: var(--q-primary);
  color: #fff;
}
</style>
