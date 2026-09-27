# Games 模組

用題庫單字做成的小遊戲。只透過 `src/modules/Vocabulary`（公開介面 `index.ts`）取用單字與寫入答題記錄。

## 結構

```
Games/
├── index.ts          # gameRoutes：掛到 router
├── registry.ts       # 遊戲清單（遊戲中心與路由都從這裡產生）
├── hub/              # 遊戲中心頁
├── shared/           # 共用：單字工具、音效、遊戲流程、迴圈、計時器、UI 外殼
└── <game>/
    ├── info.ts       # GameInfo：名稱、玩法、最少單字數、單字篩選、是否記錄
    ├── use<Game>.ts  # 遊戲邏輯（不含畫面）
    └── <Game>Page.vue
```

## 新增一個遊戲

1. 建立 `<game>/info.ts`，匯出 `GameInfo`。
2. 在 `use<Game>.ts` 實作 `start(words)`、`quit()`，結束時呼叫 `session.finish(result)`；
   答題時呼叫 `session.record(word, correct)`（`recordsProgress` 為 true 才會寫入單字測驗記錄）。
3. 頁面用 `<GameShell :session="session" @quit="game.quit">` 包住遊戲畫面，
   選類別、玩法說明、結算畫面都由 GameShell 處理。
4. 在 `registry.ts` 加一筆。

## 遊戲一覽

| 遊戲       | 練習      | 寫入測驗記錄 |
| ---------- | --------- | ------------ |
| 單字打怪   | 認字・聽力 | ✅           |
| 太空防衛   | 認字・反應 | ✅           |
| 字母貪食蛇 | 拼字      | ✅           |
| 拆炸彈     | 拼字      | ✅           |
| 翻牌配對   | 記憶・認字 | ❌（運氣成分高） |
