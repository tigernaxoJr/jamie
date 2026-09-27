<template>
  <div class="not-found fullscreen flex flex-center text-center q-pa-md">
    <div>
      <div class="not-found__emoji">🦉❓</div>
      <div class="text-h3 q-mt-md">找不到這一頁</div>
      <div class="text-muted text-subtitle1 q-mt-sm">貓頭鷹找遍了森林，還是找不到你要的頁面。</div>
      <q-btn
        class="btn-3d q-mt-xl q-px-lg"
        size="lg"
        color="primary"
        icon="home"
        label="回到首頁"
        to="/"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
.not-found {
  background: var(--app-bg);
}
.not-found__emoji {
  font-size: 6rem;
  line-height: 1;
}
</style>
