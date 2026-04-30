<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import FallingLetter from './FallingLetter.vue';
import GameHUD from './GameHUD.vue';
import GameOverlay from './GameOverlay.vue';
import { useGameLogic } from '../composables/useGameLogic';

const {
  gameState,
  letters,
  score,
  combo,
  hp,
  currentLevelConfig,
  resetGame,
  handleKeydown,
} = useGameLogic();

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const onStart = () => {
  resetGame();
};

const onRestart = () => {
  resetGame();
};

</script>

<template>
  <div 
    class="relative w-full max-w-[800px] h-[600px] mx-auto bg-slate-50 rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-200 transition-colors duration-1000"
    :class="[
      currentLevelConfig.level === 2 ? 'bg-indigo-50 border-indigo-200' : '',
      currentLevelConfig.level === 3 ? 'bg-rose-50 border-rose-200' : ''
    ]"
  >
    <!-- HUD -->
    <div class="absolute top-4 left-4 right-4 z-20">
      <GameHUD 
        :score="score" 
        :combo="combo" 
        :hp="hp" 
        :levelName="currentLevelConfig.name" 
      />
    </div>

    <!-- Letters -->
    <FallingLetter
      v-for="letter in letters"
      :key="letter.id"
      :char="letter.char"
      :x="letter.x"
      :y="letter.y"
      :isSpecial="letter.isSpecial"
      :isObscured="letter.isObscured"
    />

    <!-- Overlays (Start, Level Up, Game Over) -->
    <GameOverlay 
      :gameState="gameState" 
      :score="score"
      @start="onStart"
      @restart="onRestart"
    />
    
    <!-- Ground indicator -->
    <div class="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-red-500/20 to-transparent"></div>
  </div>
</template>
