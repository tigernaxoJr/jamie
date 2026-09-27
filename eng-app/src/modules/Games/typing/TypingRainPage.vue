<template>
  <GameShell :session="session" @quit="typing.quit">
    <!-- HUD -->
    <div class="hud app-card">
      <LivesBar :lives="state.hp" :max="typing.maxHp" />
      <div class="hud__level">
        <div class="text-weight-bold">第 {{ state.level + 1 }} 關・{{ level.name }}</div>
        <q-linear-progress
          :value="typing.levelProgress.value"
          color="blue-grey"
          track-color="grey-3"
          size="8px"
          rounded
        />
      </div>
      <div class="hud__score">
        <span v-if="state.combo >= 3" class="combo">🔥 {{ state.combo }}</span>
        ⭐ {{ state.score }}
      </div>
    </div>

    <!-- 掉落區 -->
    <div class="field" :class="{ 'field--miss': flash }">
      <div
        v-for="it in state.items"
        :key="it.id"
        class="item"
        :class="{
          'item--letter': !it.word,
          'item--locked': it.id === state.lockedId,
          'item--danger': it.y > 75,
        }"
        :style="{ left: `${it.x}%`, top: `${it.y}%` }"
      >
        <template v-if="!it.word">{{ it.text }}</template>
        <template v-else-if="level.hideEnglish">
          <div class="item__zh">{{ it.word.chinese }}</div>
          <div class="item__en">
            <span
              v-for="(ch, i) in it.text"
              :key="i"
              :class="{ typed: i < it.typed, gap: ch === ' ' }"
              >{{ ch === ' ' ? ' ' : i < it.typed ? ch : '_' }}</span
            >
          </div>
        </template>
        <template v-else>
          <div class="item__en">
            <span class="typed">{{ it.text.slice(0, it.typed) }}</span
            >{{ it.text.slice(it.typed) }}
          </div>
          <div class="item__zh">{{ it.word.chinese }}</div>
        </template>
      </div>

      <div v-if="state.levelBreak" class="level-break absolute-full flex flex-center column">
        <div class="text-h4 text-weight-bold">🎉 第 {{ state.level + 1 }} 關完成！</div>
        <div class="text-h6 q-mt-sm">下一關：{{ nextLevelName }}</div>
      </div>
      <PauseOverlay v-if="typing.loop.paused.value" @resume="typing.loop.resume" />
    </div>

    <div class="text-caption text-muted text-center q-mt-xs">
      打錯單字想換一個？按 <kbd>Backspace</kbd> 取消鎖定
    </div>
  </GameShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { GameShell, LivesBar, PauseOverlay, useGameSession } from '../shared';
import { typingInfo } from './info';
import { TYPING_LEVELS } from './levels';
import { useTyping } from './useTyping';

const session = useGameSession(typingInfo, (words) => typing.start(words));
const typing = useTyping(session);
const state = typing.state;
const level = typing.level;

const nextLevelName = computed(() => TYPING_LEVELS[state.level + 1]?.name ?? '');

// 按錯時畫面邊框閃一下
const flash = ref(false);
watch(
  () => state.misKey,
  () => {
    flash.value = true;
    setTimeout(() => (flash.value = false), 150);
  },
);

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (session.phase !== 'playing' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Backspace') {
    e.preventDefault();
    return typing.unlock();
  }
  const key = e.key.toLowerCase();
  if (!/^[a-z ]$/.test(key)) return;
  e.preventDefault(); // 空白鍵不要捲動頁面
  typing.press(key);
});
</script>

<style scoped lang="scss">
.hud {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding: 6px 12px;
  margin-bottom: 10px;
}
.hud__level {
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
}
.hud__score {
  font-weight: 900;
  white-space: nowrap;
}
.combo {
  color: #ea580c;
  margin-right: 6px;
}
.field {
  position: relative;
  flex: 1;
  min-height: 260px;
  border-radius: 16px;
  overflow: hidden;
  background:
    linear-gradient(180deg, transparent 88%, rgba(239, 68, 68, 0.12) 100%),
    linear-gradient(180deg, #e0f2fe 0%, #f8fafc 100%);
  border: 3px solid #cbd5e1;
  transition: border-color 0.1s;
}
.field--miss {
  border-color: $negative;
}
.item {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 4px 12px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  text-align: center;
  white-space: nowrap;
  border: 3px solid transparent;
}
.item--letter {
  width: 52px;
  height: 52px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  color: #1e3a8a;
}
.item--locked {
  border-color: $accent;
  transform: translate(-50%, -100%) scale(1.08);
  z-index: 2;
}
.item--danger {
  background: #fff1f2;
}
.item__en {
  font-family: monospace;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #334155;
  .typed {
    color: $positive;
  }
  span {
    margin: 0 1px;
  }
  .gap {
    display: inline-block;
    width: 0.6em;
  }
}
.item__zh {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--app-muted);
}
.level-break {
  background: rgba(255, 255, 255, 0.88);
  z-index: 5;
}
kbd {
  padding: 1px 6px;
  border: 1px solid #cbd5e1;
  border-bottom-width: 2px;
  border-radius: 4px;
  background: #fff;
  font-size: 0.75rem;
}
</style>
