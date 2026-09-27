<template>
  <section class="quests app-card q-pa-md">
    <div class="row items-center q-mb-sm">
      <div class="text-h6">📋 今日任務</div>
      <q-space />
      <span class="text-caption text-muted">完成可以領字靈糖果 🍬</span>
    </div>

    <div v-for="s in statuses" :key="s.quest.id" class="quest" :class="{ done: s.done }">
      <span class="quest__icon">{{ s.quest.icon }}</span>
      <div class="quest__body">
        <div class="quest__text">{{ s.quest.text }}</div>
        <q-linear-progress
          :value="s.progress / s.quest.target"
          :color="s.done ? 'positive' : 'amber-7'"
          track-color="grey-3"
          size="6px"
          rounded
        />
      </div>
      <span v-if="s.claimed" class="quest__claimed">✅</span>
      <q-btn
        v-else-if="s.done"
        dense
        unelevated
        no-caps
        color="orange"
        class="quest__claim"
        :label="`領 🍬${s.quest.reward}`"
        @click="onClaim(s.quest.id)"
      />
      <span v-else class="quest__count">{{ s.progress }} / {{ s.quest.target }}</span>
    </div>

    <div v-if="allClaimed" class="bonus q-mt-sm">
      <template v-if="bonusClaimed">🎉 今天的任務全部完成！明天還有新任務</template>
      <q-btn
        v-else
        unelevated
        no-caps
        color="deep-orange"
        class="full-width"
        :label="`🎁 全部完成獎勵：領 🍬${ALL_DONE_BONUS}`"
        @click="onBonus"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ALL_DONE_BONUS, type QuestId } from '../domain/quests';
import { useDailyQuests } from '../store/tracker';

const props = defineProps<{
  /** 把領到的糖果發出去（由頁面接到字靈探險的錢包） */
  grant: (candies: number) => void;
}>();

const { statuses, allClaimed, bonusClaimed, claim, claimBonus } = useDailyQuests();

const onClaim = (id: QuestId) => {
  const n = claim(id);
  if (n > 0) props.grant(n);
};

const onBonus = () => {
  const n = claimBonus();
  if (n > 0) props.grant(n);
};
</script>

<style scoped>
.quest {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-top: 1px solid var(--app-line, #e2e8f0);
}
.quest__icon {
  font-size: 1.4rem;
}
.quest__body {
  flex: 1;
  min-width: 0;
}
.quest__text {
  font-weight: 700;
  margin-bottom: 4px;
}
.quest.done .quest__text {
  color: #15803d;
}
.quest__count {
  min-width: 3.5rem;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
}
.quest__claimed {
  min-width: 3.5rem;
  text-align: right;
  font-size: 1.2rem;
}
.quest__claim {
  font-weight: 800;
  animation: pulse 1.2s ease-in-out infinite;
}
.bonus {
  text-align: center;
  font-weight: 800;
  color: #b45309;
}
@keyframes pulse {
  50% {
    transform: scale(1.06);
  }
}
</style>
