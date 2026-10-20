<template>
  <!-- 可以互動的字靈：點一下會跳、轉圈或扭一扭並唸出名字；餵糖果時糖果飛進嘴裡 -->
  <span
    class="pet"
    :class="{ 'pet--tappable': tappable }"
    :role="tappable ? 'button' : undefined"
    :aria-label="tappable ? `摸摸${creatureName(species, stage)}` : undefined"
    @click="tappable && pet()"
  >
    <span class="pet__body" :class="kind && `pet__body--${kind}`">
      <CreatureView
        :species="species"
        :size="size"
        :evolved="stage >= 2"
        :shiny="shiny"
        :animated="animated"
      />
    </span>
    <span
      v-for="f in floats"
      :key="f.id"
      class="pet__float"
      :style="{ '--x': `${f.x}px` }"
      aria-hidden="true"
      >{{ f.text }}</span
    >
    <span v-if="candyId" :key="candyId" class="pet__candy" aria-hidden="true">🍬</span>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTimers } from 'src/modules/Games/shared';
import { WordPronunciation } from 'src/modules/Vocabulary';
import { type Species, creatureEnglish, creatureName } from '../../domain/species';
import CreatureView from '../CreatureView.vue';

const props = withDefaults(
  defineProps<{
    species: Species;
    stage?: number;
    size: number;
    shiny?: boolean | undefined;
    animated?: boolean;
    /** 自己處理點擊（放在按鈕裡面時關掉，由外面呼叫 greet） */
    tappable?: boolean;
  }>(),
  { stage: 1, shiny: false, animated: true, tappable: true },
);

type Reaction = 'hop' | 'spin' | 'wiggle' | 'eat';
const PET_REACTIONS: Reaction[] = ['hop', 'spin', 'wiggle'];

const timers = useTimers();
const kind = ref<Reaction | null>(null);
const floats = ref<{ id: number; x: number; text: string }[]>([]);
const candyId = ref(0);
let seq = 0;
/** 動作的編號：新的動作開始後，舊的計時不會把它關掉 */
let playing = 0;

/** 播一次動作；同一個動作連點也會重播 */
const play = (k: Reaction, ms = 700) => {
  const token = ++playing;
  kind.value = null;
  requestAnimationFrame(() => {
    if (token === playing) kind.value = k;
  });
  timers.later(() => {
    if (token === playing) kind.value = null;
  }, ms);
};

/** 頭上飄出一個表情 */
const float = (text: string) => {
  const id = ++seq;
  floats.value.push({ id, x: Math.round(Math.random() * 32 - 16), text });
  timers.later(() => (floats.value = floats.value.filter((f) => f.id !== id)), 1000);
};

const say = () => WordPronunciation(creatureEnglish(props.species, props.stage));

/** 摸摸：隨機一個動作、飄出愛心、唸出英文名字 */
const pet = () => {
  play(PET_REACTIONS[Math.floor(Math.random() * PET_REACTIONS.length)]!);
  float('❤️');
  say();
};

/** 打招呼：跳一下、唸出名字（隊伍管理選到牠時） */
const greet = () => {
  play('hop');
  say();
};

/** 餵糖果：糖果飛進嘴裡，嚼一嚼 */
const feed = () => {
  candyId.value = ++seq;
  timers.later(() => {
    play('eat', 800);
    float('😋');
  }, 450);
};

defineExpose({ pet, greet, feed });
</script>

<style scoped lang="scss">
.pet {
  position: relative;
  display: inline-flex;
  justify-content: center;
}
.pet--tappable {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.pet__body {
  display: inline-flex;
  transform-origin: 50% 100%;
}
.pet__body--hop {
  animation: hop 0.6s ease-out;
}
.pet__body--spin {
  animation: spin 0.7s ease-in-out;
}
.pet__body--wiggle {
  animation: wiggle 0.6s ease-in-out;
}
.pet__body--eat {
  animation: eat 0.8s ease-in-out;
}
.pet__float {
  position: absolute;
  top: 10%;
  left: calc(50% + var(--x));
  font-size: 1.3rem;
  pointer-events: none;
  animation: float 1s ease-out forwards;
}
.pet__candy {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 1.4rem;
  pointer-events: none;
  animation: candy 0.5s ease-in forwards;
}

@keyframes hop {
  0%,
  100% {
    transform: none;
  }
  15% {
    transform: scale(1.1, 0.9);
  }
  45% {
    transform: translateY(-22%) scale(0.95, 1.05);
  }
  75% {
    transform: scale(1.06, 0.94);
  }
}
@keyframes spin {
  to {
    transform: rotateY(360deg);
  }
}
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0);
  }
  20%,
  60% {
    transform: rotate(-12deg);
  }
  40%,
  80% {
    transform: rotate(12deg);
  }
}
@keyframes eat {
  0%,
  100% {
    transform: none;
  }
  15%,
  55% {
    transform: scale(1.12, 0.86);
  }
  35%,
  75% {
    transform: scale(0.94, 1.06);
  }
}
@keyframes float {
  from {
    transform: translate(-50%, 0) scale(0.6);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -40px) scale(1.1);
    opacity: 0;
  }
}
/* 從下面（餵糖果按鈕）飛到嘴巴，然後被吃掉 */
@keyframes candy {
  0% {
    transform: translate(-50%, 70px) scale(0.7) rotate(0);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -10px) scale(1) rotate(200deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -6px) scale(0) rotate(240deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pet__body,
  .pet__candy {
    animation: none !important;
  }
}
</style>
