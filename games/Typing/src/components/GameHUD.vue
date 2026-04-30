<script setup lang="ts">
defineProps<{
  score: number;
  combo: number;
  hp: number;
  levelName: string;
}>();
</script>

<template>
  <div class="flex justify-between items-center w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-gray-100 z-10 relative">
    <div class="flex items-center space-x-6">
      <div class="flex flex-col">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Score</span>
        <span class="text-2xl font-black text-blue-600">{{ score }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Combo</span>
        <span class="text-2xl font-black" :class="combo > 5 ? 'text-orange-500' : 'text-gray-700'">{{ combo }}</span>
      </div>
    </div>
    
    <div class="flex flex-col items-center">
      <span class="text-sm font-bold text-gray-700 px-3 py-1 bg-gray-100 rounded-full">
        Level: {{ levelName }}
      </span>
    </div>

    <div class="flex flex-col items-end min-w-[120px]">
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">HP</span>
      <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full transition-all duration-300"
          :class="hp > 50 ? 'bg-green-500' : hp > 20 ? 'bg-yellow-500' : 'bg-red-500'"
          :style="{ width: `${hp}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
