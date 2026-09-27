# Quests 模組：每日任務

每天 3 個任務（第一個固定是背單字，另外兩個從遊戲類任務挑），完成可以領字靈糖果，
3 個都領完再多 5 顆。同一天打開看到的任務都一樣（用日期當亂數種子）。

## 結構

```
Quests/
├── index.ts              # 公開介面
├── domain/quests.ts      # 任務清單、每天挑哪幾個、進度計算（純邏輯，有測試）
├── store/tracker.ts      # 當天進度（localStorage 'daily-quests'），換日自動重設
└── ui/DailyQuestsCard.vue
```

## 進度從哪裡來

| 任務                     | 來源                                          |
| ------------------------ | --------------------------------------------- |
| 每日目標                 | Vocabulary 學習日誌（`getTodayProgress`）     |
| 單字測驗答題             | Vocabulary 學習日誌（今天 `sources.quiz`）    |
| 玩遊戲、過關、3 星、複習 | Games 的 `useGameSession` 結算時 `trackQuest` |
| 收服、餵糖果             | Adventure store 呼叫 `trackQuest`             |

卡片不直接發糖果（避免 Quests 和 Adventure 互相依賴），由使用的頁面傳入 `grant`。
