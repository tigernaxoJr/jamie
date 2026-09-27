<template>
  <section class="app-card q-pa-lg">
    <div class="text-h6">📊 最近 7 天學習報告</div>

    <div v-if="report.answered === 0" class="text-muted q-mt-sm">
      最近 7 天還沒有練習紀錄。開始做單字測驗、玩遊戲或字靈探險後，這裡就會出現報告。
    </div>

    <template v-else>
      <!-- 總覽 -->
      <div class="summary q-mt-md">
        <div class="summary__item">
          <div class="summary__value">{{ report.answered }}</div>
          <div class="summary__label">答題數</div>
        </div>
        <div class="summary__item">
          <div class="summary__value">{{ accuracy }}%</div>
          <div class="summary__label">正確率</div>
        </div>
        <div class="summary__item">
          <div class="summary__value">{{ formatMinutes(report.seconds) }}</div>
          <div class="summary__label">練習時間</div>
        </div>
        <div class="summary__item">
          <div class="summary__value">{{ report.goalDays }} / 7</div>
          <div class="summary__label">達成目標天數</div>
        </div>
        <div class="summary__item">
          <div class="summary__value">🔥 {{ today.streak }}</div>
          <div class="summary__label">連續天數</div>
        </div>
      </div>

      <!-- 每日長條圖 -->
      <div class="text-subtitle2 q-mt-lg q-mb-sm">每天答題（綠色是答對）</div>
      <div class="chart">
        <div v-for="d in report.days" :key="d.key" class="chart__col">
          <div class="chart__count">{{ d.stat?.answered ?? 0 }}</div>
          <div class="chart__bar" :style="{ height: barHeight(d.stat?.answered) }">
            <div class="chart__correct" :style="{ height: correctRatio(d.stat) }" />
          </div>
          <div
            class="chart__label"
            :class="{ 'chart__label--goal': (d.stat?.correct ?? 0) >= DAILY_GOAL }"
          >
            {{ weekday(d.key) }}
          </div>
          <div class="chart__minutes">{{ d.stat ? formatMinutes(d.stat.seconds) : '' }}</div>
        </div>
      </div>
      <div class="text-caption text-muted q-mt-xs">
        星期幾下面有 ✓ 的是達成每日目標（答對 {{ DAILY_GOAL }} 題）的日子
      </div>

      <div class="row q-col-gutter-lg q-mt-md">
        <!-- 練習方式與主題 -->
        <div class="col-12 col-md-5">
          <div class="text-subtitle2 q-mb-sm">練習方式</div>
          <div v-for="s in sources" :key="s.key" class="meter">
            <span class="meter__label">{{ s.label }}</span>
            <div class="meter__track">
              <div class="meter__fill" :style="{ width: s.percent + '%' }" />
            </div>
            <span class="meter__value">{{ s.count }}</span>
          </div>

          <div class="text-subtitle2 q-mt-md q-mb-sm">常練習的主題</div>
          <div v-for="[id, count] in report.topics" :key="id" class="topic row no-wrap">
            <span class="col ellipsis">{{ topicName(id) }}</span>
            <span class="text-muted">{{ count }} 題</span>
          </div>
        </div>

        <!-- 常錯的字 -->
        <div class="col-12 col-md-7">
          <div class="text-subtitle2 q-mb-sm">這週最常答錯的字</div>
          <div v-if="report.wrongWords.length === 0" class="text-positive text-weight-bold">
            這週沒有答錯的字，很棒！
          </div>
          <div
            v-for="[word, count] in report.wrongWords"
            :key="word"
            class="wrong row items-center no-wrap"
          >
            <q-btn
              flat
              round
              dense
              icon="volume_up"
              color="primary"
              aria-label="發音"
              @click="WordPronunciation(word)"
            />
            <b class="q-ml-xs">{{ word }}</b>
            <span class="col ellipsis text-muted q-ml-sm">{{ chineseOf(word) }}</span>
            <span class="wrong__count">錯 {{ count }} 次</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Categories,
  DAILY_GOAL,
  type DayStat,
  WordPronunciation,
  chineseOf,
  getActivityReport,
  getTodayProgress,
} from 'src/modules/Vocabulary';

const report = getActivityReport(7);
const today = getTodayProgress();

const accuracy = computed(() =>
  report.answered ? Math.round((report.correct / report.answered) * 100) : 0,
);

const maxAnswered = Math.max(1, ...report.days.map((d) => d.stat?.answered ?? 0));
const barHeight = (n = 0) => `${Math.max(n ? 6 : 0, (n / maxAnswered) * 100)}%`;
const correctRatio = (stat?: DayStat) =>
  stat && stat.answered ? `${(stat.correct / stat.answered) * 100}%` : '0%';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const weekday = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return WEEKDAYS[new Date(y ?? 0, (m ?? 1) - 1, d ?? 1).getDay()];
};

const formatMinutes = (seconds: number) => {
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} 分` : `${Math.floor(m / 60)} 時 ${m % 60} 分`;
};

const SOURCE_LABEL = { quiz: '單字測驗', game: '小遊戲', adventure: '字靈探險' } as const;
const sources = computed(() =>
  (Object.keys(SOURCE_LABEL) as (keyof typeof SOURCE_LABEL)[]).map((key) => {
    const count = report.sources[key] ?? 0;
    return {
      key,
      label: SOURCE_LABEL[key],
      count,
      percent: report.answered ? (count / report.answered) * 100 : 0,
    };
  }),
);

const topicName = (id: string) => {
  const topic = Categories.find((c) => c.id === id);
  const level = Categories.find((c) => c.id === topic?.parentId);
  return topic ? `${level?.name ?? ''} · ${topic.name}` : id;
};
</script>

<style scoped lang="scss">
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}
.summary__item {
  padding: 10px;
  border-radius: 14px;
  background: #f5f7fa;
  text-align: center;
}
.summary__value {
  font-size: 1.4rem;
  font-weight: 900;
  color: $primary;
}
.summary__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--app-muted);
}
.chart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  align-items: end;
  height: 180px;
}
.chart__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}
.chart__count {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--app-muted);
}
.chart__bar {
  position: relative;
  width: 70%;
  max-width: 36px;
  border-radius: 8px 8px 0 0;
  background: #fecaca;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.chart__correct {
  width: 100%;
  background: $positive;
}
.chart__label {
  margin-top: 4px;
  font-weight: 800;
}
.chart__label--goal::after {
  content: ' ✓';
  color: $positive;
}
.chart__minutes {
  font-size: 0.7rem;
  color: var(--app-muted);
  min-height: 1em;
}
.meter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.meter__label {
  width: 5em;
  font-weight: 700;
  font-size: 0.9rem;
}
.meter__track {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}
.meter__fill {
  height: 100%;
  background: $primary;
}
.meter__value {
  width: 2.5em;
  text-align: right;
  font-weight: 800;
}
.topic {
  padding: 6px 0;
  border-bottom: 1px dashed var(--app-line);
  font-weight: 600;
}
.wrong {
  padding: 4px 0;
  border-bottom: 1px dashed var(--app-line);
}
.wrong__count {
  flex-shrink: 0;
  margin-left: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  color: $negative;
}
</style>
