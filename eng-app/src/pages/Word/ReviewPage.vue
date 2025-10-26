<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-2">單字複習</h2>
    <div v-for="word in words" :key="word.id" class="mb-4 p-4 border rounded-lg">
      <img v-if="word.image" :src="word.image" class="w-32 h-32 object-cover mb-2" />
      <div class="text-lg font-semibold">{{ word.english }}</div>
      <div class="text-gray-600">{{ word.chinese }}</div>
      <a
        :href="`https://translate.google.com/translate_tts?ie=UTF-8&q=${word.english}&tl=en&client=tw-ob`"
        target="_blank"
        >google 發音</a
      >
      <!-- <iframe
        :src="`https://translate.google.com/translate_tts?ie=UTF-8&q=${word.english}&tl=en&client=tw-ob`"
      ></iframe> -->
      <!-- <iframe src="https://translate.google.com/?sl=en&tl=zh-TW&text=apple&op=translate"></iframe> -->
      <!-- {{
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${word.english}&tl=en&client=tw-ob`
      }} -->
      1<audio :src="'data:audio/mp3;base64,' + sound">test</audio>1
      <a
        :href="`https://translate.google.com/?sl=en&tl=zh-TW&text=${word.english}`"
        target="_blank"
        class="text-blue-500 underline"
        >Google 翻譯</a
      >
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/block-lang -->
<script setup>
import { sound } from './tmp';
import { useWordStore } from './wordStore';
const store = useWordStore();
const words = store.words;
</script>
