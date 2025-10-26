<template>
  <canvas id="errorChart"></canvas>
</template>

<!-- eslint-disable-next-line vue/block-lang -->
<script setup>
import { onMounted } from 'vue';
import { Chart } from 'chart.js/auto';
import { useWordStore } from 'src/pages/Word/store';
const store = useWordStore();

onMounted(() => {
  new Chart(document.getElementById('errorChart'), {
    type: 'bar',
    data: {
      labels: store.words.map((w) => w.english),
      datasets: [
        {
          label: '錯誤次數',
          data: store.words.map((w) => w.errorCount),
        },
      ],
    },
  });
});
</script>
