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
   標題畫面的額外設定放 `#settings` slot，結算畫面的額外按鈕（例如「下一關」）放 `#result-actions` slot；
   關卡制遊戲可以在結果填 `stars`（1～3）顯示星等；關卡選單、解鎖與星數存檔用 `shared/stages.ts` 的
   `StagePicker`、`useStageProgress`、`nextStageIndex`（除了單字爬塔，每個遊戲都是這樣做）。
4. 在 `registry.ts` 加一筆。

## 字靈糖果

`session.record(word, true)` 會累計答對題數，`session.finish` 時自動換成字靈糖果（每答對 3 題 1 顆，勝利 +2，
每天上限 30 顆），存到字靈探險（`src/modules/Adventure` 的 `grantGameCandies`），結算畫面會顯示拿到幾顆。
不寫入測驗記錄的遊戲（`recordsProgress: false`）也可以呼叫 `record`，只會算糖果。

## 出題、複習與紀錄

- **弱點單字優先**：`loadGameWords` 依答題記錄給每個字權重（`Vocabulary` 的 `practiceWeight`，1～4），
  `WordDeck`（`shared/deck.ts`）把權重高的字多放幾張進牌堆，越不熟的字越常出現。
- **一鍵複習**：結算畫面「只練這 N 個字」會呼叫 `session.startReview(missed)`，答錯的字權重 4，
  再補幾個其他字當干擾選項（`shared/review.ts`）。
- **每日任務**：結算時（有作答或得分才算）回報 `trackQuest`（`src/modules/Quests`）。
- **家長報告**：結算時寫入遊戲日誌（`shared/gameLog.ts`，localStorage `game-log`），
  打字遊戲在結果填 `lettersPerMinute` 記錄打字速度。
- **最高分**：關卡制遊戲（`stageBased`）只記無盡模式，關卡結果填 `ranked: false`。

## 遊戲一覽

| 遊戲       | 練習                                                             | 寫入測驗記錄     |
| ---------- | ---------------------------------------------------------------- | ---------------- |
| 單字爬塔   | 認字・聽力（無限樓層、增益卡、每 5 層魔王）                      | ✅               |
| 太空防衛   | 認字・反應（8 關 + 魔王、星等、飛船升級）                        | ✅               |
| 字母貪食蛇 | 拼字（8 張地圖：石牆、穿越邊界、亂跑的字母）                     | ✅               |
| 拆炸彈     | 拼字・聽力（8 間密室：快速引信、神秘炸彈、連環炸彈、放大鏡）     | ✅               |
| 翻牌配對   | 記憶・聽力（8 關：偷看、聲音牌、限時、旋風洗牌、手電筒）         | ❌（運氣成分高） |
| 打字雨     | 打字・拼字（8 關：分區練字母、單字、混戰、中文；道具、打字速度） | ✅（單字關卡）   |
