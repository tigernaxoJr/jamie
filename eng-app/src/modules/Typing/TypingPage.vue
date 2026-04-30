<template>
  <q-page class="flex flex-center bg-grey-2 overflow-hidden">
    <!-- 
      這裡的 src 指向部署後的路徑。
      因為 deploy.yml 會將遊戲放到 dist/spa/games/typing/
      所以相對路徑是 games/typing/index.html
    -->
    <iframe
      src="games/typing/index.html"
      class="full-width full-height no-border"
      style="height: calc(100vh - 58px); border: none;"
      title="Typing Game"
    ></iframe>
  </q-page>
</template>

<script setup lang="ts">
// 不需要額外的邏輯，僅作為容器
</script>

<style scoped>
.full-width {
  width: 100%;
}
.full-height {
  height: 100%;
}
.no-border {
  border: none;
}
</style>
