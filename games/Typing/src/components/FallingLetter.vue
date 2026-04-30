<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  char: string;
  x: number;
  y: number;
  isSpecial?: boolean;
  isObscured?: boolean;
}>();

const style = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}));
</script>

<template>
  <div 
    class="absolute flex items-center justify-center w-10 h-10 rounded-full font-bold text-xl shadow-lg border-2"
    :class="[
      isSpecial ? 'bg-purple-600 border-purple-400 text-white animate-pulse' : 'bg-white border-blue-400 text-blue-700',
      isObscured ? 'opacity-40 blur-[1px]' : 'opacity-100'
    ]"
    :style="style"
  >
    {{ char }}
  </div>
</template>
