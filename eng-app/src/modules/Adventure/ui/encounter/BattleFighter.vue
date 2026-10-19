<template>
  <div class="fighter" :class="{ hit: fx === 'hit', lunge: fx === 'lunge', faint: fainted }">
    <CreatureSvg
      :key="creatureKey"
      :species="species"
      :size="120"
      :evolved="evolved"
      :flip="flip"
    />
    <span v-if="popup" :key="popup.id" class="popup">{{ popup.text }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Species } from '../../domain/species';
import CreatureSvg from '../CreatureSvg.vue';

/** 對戰場上的字靈：受擊、衝撞、倒下的動畫，以及飄出來的傷害數字 */
withDefaults(
  defineProps<{
    species: Species;
    /** 換人上場時換 key，讓圖重新出現 */
    creatureKey: string | number;
    evolved?: boolean;
    /** 面向左邊（我方字靈） */
    flip?: boolean;
    fx: '' | 'hit' | 'lunge';
    fainted: boolean;
    /** 換新的 id 就會重播飄字動畫 */
    popup: { id: number; text: string } | null;
  }>(),
  { evolved: false, flip: false },
);
</script>

<style scoped lang="scss">
.fighter {
  position: relative;
  transition:
    transform 0.25s,
    opacity 0.4s;
}
.fighter.hit {
  animation: hit 0.4s;
}
.fighter.lunge {
  transform: translate(30px, -20px);
}
.fighter.faint {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.popup {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  font-weight: 900;
  color: #dc2626;
  text-shadow: 0 2px 0 #fff;
  white-space: nowrap;
  animation: float 1s forwards;
}
@keyframes hit {
  0%,
  100% {
    transform: none;
    filter: none;
  }
  30% {
    transform: translateX(10px);
    filter: brightness(2);
  }
  60% {
    transform: translateX(-6px);
  }
}
@keyframes float {
  to {
    transform: translate(-50%, -40px);
    opacity: 0;
  }
}
</style>
