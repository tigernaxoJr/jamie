<template>
  <q-page padding>
    <div class="page-container">
      <!-- 歡迎 + 進度 -->
      <section class="hero q-pa-lg q-mb-lg">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="hero__hello">{{ greeting }}，Jamie！</div>
            <div class="hero__sub">今天也來學幾個新單字吧 💪</div>
          </div>
          <div class="hero__mascot gt-xs">🦉</div>
        </div>

        <!-- 今日目標 -->
        <div class="goal q-mt-md" :class="{ 'goal--done': today.done }">
          <div class="row items-center no-wrap">
            <span class="goal__title">
              {{ today.done ? '🎉 今天的目標達成了！' : '🎯 今日目標：答對 ' + today.goal + ' 題' }}
            </span>
            <q-space />
            <span v-if="today.streak > 0" class="goal__streak">🔥 連續 {{ today.streak }} 天</span>
          </div>
          <q-linear-progress
            :value="Math.min(1, today.correct / today.goal)"
            color="warning"
            track-color="white"
            size="14px"
            rounded
            class="q-mt-xs"
          />
          <div class="text-caption text-weight-bold q-mt-xs">
            今天答對 {{ today.correct }} / {{ today.goal }} 題
            <span v-if="today.done">· 捕捉字靈時能量 +{{ DAILY_BONUS_ENERGY }}</span>
          </div>
        </div>

        <div class="stats q-mt-md">
          <div class="stat">
            <div class="stat__value">{{ summary.practiced }}</div>
            <div class="stat__label">練習過</div>
          </div>
          <div class="stat">
            <div class="stat__value">⭐ {{ summary.mastered }}</div>
            <div class="stat__label">已熟練</div>
          </div>
          <div class="stat">
            <div class="stat__value">{{ summary.weak.length }}</div>
            <div class="stat__label">要加油</div>
          </div>
        </div>

        <div class="q-mt-md">
          <div class="row text-caption text-weight-bold hero__sub">
            <span>熟練進度</span>
            <q-space />
            <span>{{ summary.mastered }} / {{ summary.total }}</span>
          </div>
          <q-linear-progress
            :value="summary.total ? summary.mastered / summary.total : 0"
            color="warning"
            track-color="white"
            size="12px"
            rounded
            class="q-mt-xs hero__bar"
          />
        </div>
      </section>

      <DailyQuestsCard :grant="grantBonusCandies" class="q-mb-lg" />

      <!-- 主要功能 -->
      <section class="actions q-mb-lg">
        <router-link
          v-for="a in actions"
          :key="a.to"
          :to="a.to"
          class="action app-card app-card--hover"
        >
          <div class="action__art" :style="{ background: a.bg }">{{ a.emoji }}</div>
          <div class="q-pa-md">
            <div class="text-h6">{{ a.title }}</div>
            <div class="text-muted">{{ a.desc }}</div>
          </div>
        </router-link>
      </section>

      <!-- 要加強的單字 -->
      <section v-if="weakWords.length" class="app-card q-pa-lg">
        <div class="row items-center q-mb-md">
          <div class="text-h6">🎯 這些單字再練一下</div>
          <q-space />
          <q-btn flat color="primary" label="去測驗" icon-right="arrow_forward" to="/quiz" />
        </div>
        <div class="row q-gutter-sm">
          <button
            v-for="w in weakWords"
            :key="w.english"
            type="button"
            class="weak-chip"
            :title="`聽 ${w.english} 的發音`"
            @click="WordPronunciation(w.english)"
          >
            <b>{{ w.english }}</b>
            <span class="text-muted">{{ w.chinese }}</span>
            <q-icon name="volume_up" size="18px" color="primary" />
          </button>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { getProgressSummary, getTodayProgress, WordPronunciation } from 'src/modules/Vocabulary';
import { DAILY_BONUS_ENERGY } from 'src/modules/Adventure/domain/rules';
import { grantBonusCandies } from 'src/modules/Adventure';
import { DailyQuestsCard } from 'src/modules/Quests';

const summary = getProgressSummary();
const today = getTodayProgress();
const weakWords = summary.weak.slice(0, 12);

const hour = new Date().getHours();
const greeting = hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安';

const actions = [
  {
    to: '/quiz',
    emoji: '✏️',
    title: '單字測驗',
    desc: '看中文拼英文，挑戰你的記憶力',
    bg: 'linear-gradient(135deg, #1677d2, #5aaaf0)',
  },
  {
    to: '/review',
    emoji: '📖',
    title: '單字複習',
    desc: '翻翻單字卡，考試前複習一下',
    bg: 'linear-gradient(135deg, #10b3a3, #5eead4)',
  },
  {
    to: '/games',
    emoji: '🎮',
    title: '遊戲中心',
    desc: '打怪、拆炸彈、貪食蛇，邊玩邊背',
    bg: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
  },
];
</script>

<style scoped lang="scss">
.hero {
  border-radius: var(--app-radius);
  color: #fff;
  background:
    radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.18) 0 70px, transparent 71px),
    linear-gradient(135deg, #1677d2 0%, #0ea5e9 60%, #19b8b0 100%);
  box-shadow: 0 16px 40px rgba(22, 119, 210, 0.3);
}
.hero__hello {
  font-size: 1.9rem;
  font-weight: 900;
  line-height: 1.2;
}
.hero__sub {
  opacity: 0.9;
  font-weight: 700;
}
.hero__mascot {
  font-size: 5rem;
  line-height: 1;
  animation: bob 3s ease-in-out infinite;
}
.hero__bar {
  opacity: 0.95;
}
.goal {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
}
.goal--done {
  background: rgba(255, 255, 255, 0.28);
}
.goal__title {
  font-weight: 900;
}
.goal__streak {
  padding: 2px 10px;
  border-radius: 999px;
  background: #fff;
  color: #ea580c;
  font-weight: 900;
  font-size: 0.85rem;
  white-space: nowrap;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  padding: 12px;
  text-align: center;
}
.stat__value {
  font-size: 1.6rem;
  font-weight: 900;
}
.stat__label {
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0.9;
}
.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.action {
  display: block;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}
.action__art {
  font-size: 3.4rem;
  text-align: center;
  padding: 18px 0;
}
.weak-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 2px solid var(--app-line);
  border-radius: 999px;
  background: #fff;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover {
    border-color: $primary;
  }
}
@keyframes bob {
  50% {
    transform: translateY(-8px) rotate(-4deg);
  }
}
@media (max-width: 599px) {
  .hero__hello {
    font-size: 1.5rem;
  }
  .stat__value {
    font-size: 1.3rem;
  }
  // 手機上功能卡改成左圖右文，節省高度
  .action {
    display: flex;
    align-items: stretch;
  }
  .action__art {
    flex: 0 0 88px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.4rem;
    padding: 0;
  }
}
</style>
