<template>
  <GameShell :session="session" @quit="typing.quit">
    <!-- 標題畫面：選關卡 -->
    <template #settings>
      <StagePicker v-model="typing.mode.value" :stages="TYPING_LEVELS" :stars="typing.stars.value">
        <div class="stage-tags q-mt-sm">
          <template v-if="picked">
            <span v-if="picked.kind === 'letters'">⌨️ {{ picked.chars!.toUpperCase() }}</span>
            <span v-else-if="picked.kind === 'mixed'">⌨️ 字母和單字一起掉</span>
            <span v-else-if="picked.hideEnglish">🀄 只看中文拼英文</span>
            <span v-else
              >📝 {{ picked.maxLetters ? `${picked.maxLetters} 個字母以內的` : '' }}單字</span
            >
            <span>🎯 {{ picked.target }} 分過關</span>
          </template>
          <span v-else>♾️ 一直掉單字，越打越快</span>
          <span v-if="!picked || picked.powerUps">❄️💖💣 會掉道具</span>
        </div>
      </StagePicker>
    </template>

    <!-- HUD -->
    <div class="hud app-card">
      <LivesBar :lives="state.hp" :max="typing.maxHp" />
      <div class="hud__level">
        <div class="text-weight-bold">{{ level.emoji }} {{ level.name }}</div>
        <q-linear-progress
          v-if="typing.mode.value.kind === 'stage'"
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
    <div class="field" :class="{ 'field--miss': flash, 'field--frozen': state.frozen > 0 }">
      <div
        v-for="it in state.items"
        :key="it.id"
        class="item"
        :class="{
          'item--letter': !it.word,
          'item--locked': it.id === state.lockedId,
          'item--danger': it.y > 75,
          'item--power': it.power,
        }"
        :style="{ left: `${it.x}%`, top: `${it.y}%` }"
      >
        <span v-if="it.power" class="item__power">{{ POWER_UPS[it.power].icon }}</span>
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

      <div v-if="state.lastPower" class="power-banner">
        {{ POWER_UPS[state.lastPower].icon }} {{ POWER_UPS[state.lastPower].name }}
      </div>
      <PauseOverlay v-if="typing.loop.paused.value" @resume="typing.loop.resume" />
    </div>

    <div class="text-caption text-muted text-center q-mt-xs">
      打錯單字想換一個？按 <kbd>Backspace</kbd> 取消鎖定；打出有 ❄️💖💣 的字可以拿到道具
    </div>

    <template #result-actions>
      <q-btn
        v-if="nextStage"
        class="btn-3d"
        color="primary"
        size="lg"
        icon="skip_next"
        :label="`下一關：${nextStage.emoji} ${nextStage.name}`"
        @click="playNext"
      />
    </template>
  </GameShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import {
  GameShell,
  LivesBar,
  PauseOverlay,
  StagePicker,
  firstOpenStage,
  nextStageIndex,
  useGameSession,
} from '../shared';
import { typingInfo } from './info';
import { POWER_UPS, TYPING_LEVELS } from './levels';
import { useTyping } from './useTyping';

const session = useGameSession(typingInfo, (words) => typing.start(words));
const typing = useTyping(session);
const state = typing.state;
const level = typing.level;

// 預設選還沒拿到星星的第一關
typing.mode.value = {
  kind: 'stage',
  index: firstOpenStage(TYPING_LEVELS.length, typing.stars.value),
};

/** 標題畫面選到的關卡 */
const picked = computed(() => {
  const m = typing.mode.value;
  return m.kind === 'stage' ? TYPING_LEVELS[m.index] : undefined;
});

/** 過關後可以挑戰的下一關 */
const nextIndex = computed(() =>
  nextStageIndex(typing.mode.value, !!session.result?.won, TYPING_LEVELS.length),
);
const nextStage = computed(() =>
  nextIndex.value === null ? null : TYPING_LEVELS[nextIndex.value],
);

const playNext = () => {
  if (nextIndex.value === null) return;
  typing.mode.value = { kind: 'stage', index: nextIndex.value };
  session.start();
};

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
.field--frozen {
  border-color: #38bdf8;
  background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 100%);
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
.item--power {
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
}
.item__power {
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 1.1rem;
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
.power-banner {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 5;
  transform: translateX(-50%);
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.8);
  color: #fff;
  font-weight: 900;
  white-space: nowrap;
  animation: pop 0.3s;
}
.stage-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 800;
}
.stage-tags span {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
}
@keyframes pop {
  from {
    transform: translateX(-50%) scale(0.6);
    opacity: 0;
  }
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
