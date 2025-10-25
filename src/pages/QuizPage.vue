<!-- eslint-disable vue/block-lang -->
<template>
  <div class="p-4 text-center">
    <h2 class="text-xl font-bold mb-4">英文測驗</h2>

    <div v-if="currentWord">
      <img
        v-if="currentWord.image"
        :src="currentWord.image"
        class="w-48 h-48 object-cover mx-auto mb-2"
      />
      <p class="text-lg mb-2">{{ currentWord.chinese }}</p>

      <input
        v-model="answer"
        placeholder="輸入英文單字"
        class="border px-3 py-1 rounded"
        @keyup.enter="checkAnswer"
      />

      <div class="mt-2">
        <button @click="checkAnswer" class="bg-blue-500 text-white px-4 py-1 rounded">確認</button>
      </div>

      <div v-if="result" class="mt-4">
        <p :class="result.correct ? 'text-green-600' : 'text-red-600'">
          {{ result.correct ? '✅ 正確！' : `❌ 錯誤，正確答案是：${currentWord.english}` }}
        </p>
        <button @click="nextQuestion" class="mt-2 bg-gray-200 px-3 py-1 rounded">下一題</button>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/block-lang -->
<script setup>
import { useWordStore } from 'src/stores/wordStore';
import { ref } from 'vue';

const store = useWordStore();
const currentWord = ref(store.getWeightedRandomWord());
const answer = ref('');
const result = ref(null);

function checkAnswer() {
  if (!currentWord.value) return;
  const correct = answer.value.trim().toLowerCase() === currentWord.value.english.toLowerCase();
  if (!correct) store.recordError(currentWord.value.id);
  result.value = { correct };
}

function nextQuestion() {
  currentWord.value = store.getWeightedRandomWord();
  result.value = null;
  answer.value = '';
}
</script>
