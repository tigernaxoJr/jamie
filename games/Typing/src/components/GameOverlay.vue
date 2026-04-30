<script setup lang="ts">
import type { GameState } from '../types/game';

defineProps<{
  gameState: GameState;
  score: number;
}>();

defineEmits<{
  (e: 'start'): void;
  (e: 'restart'): void;
}>();
</script>

<template>
  <div v-if="gameState !== 'PLAYING'" class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
    
    <div v-if="gameState === 'START'" class="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 transform transition-all">
      <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
        Typing Master
      </h1>
      <p class="text-gray-600 mb-8">Test your typing speed and accuracy. Destroy the falling letters before they hit the ground!</p>
      <button 
        @click="$emit('start')"
        class="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
      >
        Start Game
      </button>
    </div>

    <div v-if="gameState === 'LEVEL_UP'" class="text-center animate-bounce">
      <h2 class="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
        LEVEL UP!
      </h2>
      <p class="text-xl text-white mt-4 font-bold tracking-widest">Get Ready...</p>
    </div>

    <div v-if="gameState === 'GAME_OVER'" class="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4">
      <h2 class="text-4xl font-black text-red-500 mb-2">Game Over</h2>
      <div class="py-6 my-4 bg-gray-50 rounded-xl">
        <p class="text-sm text-gray-500 uppercase font-bold tracking-wide">Final Score</p>
        <p class="text-5xl font-black text-gray-800">{{ score }}</p>
      </div>
      <button 
        @click="$emit('restart')"
        class="w-full py-4 bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        Play Again
      </button>
    </div>

  </div>
</template>
