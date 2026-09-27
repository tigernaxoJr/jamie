/**
 * Quests 模組：每日任務。
 * 其他模組用 trackQuest 回報事件（玩完遊戲、收服字靈、餵糖果）；
 * 背單字的任務直接從 Vocabulary 的學習日誌計算。
 */
export { trackQuest, useDailyQuests, type QuestEvent, type QuestStatus } from './store/tracker';
export { ALL_DONE_BONUS, QUESTS, type Quest, type QuestId } from './domain/quests';
export { default as DailyQuestsCard } from './ui/DailyQuestsCard.vue';
