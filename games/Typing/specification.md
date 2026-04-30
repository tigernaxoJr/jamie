## 1. 任務目標 (Mission)

請扮演資深前端架構師，建立一個基於 **Vue.js 3 (Composition API)**、**TypeScript** 與 **Tailwind CSS** 的「組件化」打字訓練遊戲。該專案必須具備清晰的目錄結構、關卡進階系統以及高效能的動畫處理。

## 2. 技術堆疊 (Tech Stack)

- **Framework**: Vue 3 (Script Setup)
- **Styling**: Tailwind CSS (Utility-first)
- **Logic**: TypeScript (Strict Mode)
- **State**: Composition API (Ref/Reactive/Computed)
- **Animation**: `requestAnimationFrame` (避免使用 `setInterval` 造成的卡頓)

## 3. 專案架構與元件化 (Component Architecture)

請將專案拆解為以下模組，確保職責分離：

### A. 核心邏輯層 (Logic Layer)

- **`useGameLogic.ts` (Composable)**:
  - 負責字母生成、座標更新、碰撞偵測 (Hit/Miss)。
  - 鍵盤事件監聽 (keydown) 與清理。
  - 關卡狀態切換與進度計算。

### B. 展示組件層 (Presentation Layer)

- **`GameBoard.vue`**: 遊戲主容器，定義遊戲視窗邊界，負責渲染 `FallingLetter` 列表。
- **`FallingLetter.vue`**: 單個字母組件。
  - **Props**: `char`, `x`, `y`, `speed`, `isSpecial`。
  - **Visuals**: 包含打擊成功時的淡出動畫。
- **`GameHUD.vue`**: 資訊儀表板。
  - 顯示 Score, Combo, HP, 以及 `LevelIndicator`（關卡進度條）。
- **`GameOverlay.vue`**: 狀態覆蓋層。
  - 負責「Start Game」、「Level Up (中場休息)」、「Game Over (結算)」三種狀態切換。

## 4. 關卡設計規格 (Level Design)

請實作 `LEVEL_CONFIG` 配置陣列，並確保遊戲邏輯能動態讀取：

| 關卡 (Level) | 目標分數 | 掉落速度 (Base) | 生成頻率 (ms) | 特殊規則                    |
| :----------- | :------- | :-------------- | :------------ | :-------------------------- |
| **L1: 新手** | 500      | 1.5 px/f        | 1500ms        | 僅出現 A-S-D-F-G 基準鍵字母 |
| **L2: 進階** | 1200     | 2.5 px/f        | 1000ms        | 出現 A-Z 所有英文字母       |
| **L3: 混亂** | 2500     | 3.5 px/f        | 800ms         | 字母掉落時會左右小幅度晃動  |

## 5. 遊戲機制 (Mechanics)

- **判定機制**:
  - 玩家按下按鍵時，系統需尋找畫面中「最接近底部」且「符合字元」的字母進行消除。
  - 擊中增加分數與 Combo；漏接 (字母觸底) 扣除 HP 並中斷 Combo。
- **動態難度**: 每升一級，畫面背景顏色需透過 CSS Variables 進行輕微色調切換以提供視覺反饋。
- **生命週期**: 遊戲結束後需提供重新開始的功能，並重置所有狀態。

## 6. 輸出要求 (Output Requirements)

1.  **專案目錄結構**: 首先展示建議的資料夾結構。
2.  **核心 Composable**: 提供完整型別定義的 `useGameLogic.ts`。
3.  **元件實作**: 提供上述各個 `.vue` 組件的程式碼。
4.  **整合入口**: 提供 `App.vue` 將所有組件組裝起來。

---

## 提示詞啟動指令 (Prompt Trigger)

> **"請根據 `specification.md` 的規範，開始建立這個專案。請先從目錄結構與核心邏輯 Composable 開始編寫，確保程式碼符合 TypeScript 規範且易於維護。"**
