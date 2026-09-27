<template>
  <span class="speech">
    <q-btn
      round
      flat
      dense
      color="primary"
      icon="volume_up"
      title="聽發音"
      aria-label="聽發音"
      @click.stop="WordPronunciation(word)"
    />
    <q-btn
      round
      flat
      dense
      color="secondary"
      icon="translate"
      title="用 Google 翻譯聽發音（開新分頁）"
      aria-label="用 Google 翻譯聽發音"
      @click.stop="OpenGoogleTranslateTTS(word)"
    />
  </span>
</template>

<script setup lang="ts">
import { OpenGoogleTranslateTTS, WordPronunciation } from '../../speech';

withDefaults(defineProps<{ word?: string }>(), { word: '' });
</script>

<style scoped>
.speech {
  display: inline-flex;
  gap: 2px;
  vertical-align: middle;
}
</style>
