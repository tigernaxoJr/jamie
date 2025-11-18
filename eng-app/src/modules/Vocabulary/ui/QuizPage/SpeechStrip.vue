<template>
  <q-btn
    round
    icon="volume_up"
    size="sm"
    @click="WordPronunciation(word)"
    title="內建發音 (瀏覽器 TTS)"
    class="q-ml-xs"
  />
  <q-btn
    round
    icon="headphones"
    color="secondary"
    size="sm"
    @click="OpenGoogleTranslateTTS(word)"
    title="Google 翻譯發音 (新分頁)"
    class="q-ml-xs"
  />
</template>

<script setup lang="ts">
import { OpenGoogleTranslateTTS, WordPronunciation } from '../../utils';
interface IProps {
  word: string;
}
withDefaults(defineProps<IProps>(), {
  word: '',
});
</script>

<style scoped></style>
