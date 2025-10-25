- ✅ 配合 quasar 使用極度精簡的 css，優化我的 src\pages\QuizPage.vue 頁面，目標是讓國小學童容易輸入、操作、進行測驗。

## 完成的優化項目（使用極簡 CSS）：

### 🎯 使用 Quasar 內建組件和工具類：
- `q-page`, `q-card`, `q-btn`, `q-input` 等組件
- Quasar 內建的 spacing (`q-pa-lg`, `q-mb-lg`)、typography (`text-h3`, `text-weight-bold`) 工具類
- Quasar 顏色系統 (`color="positive"`, `bg-green-1`)
- Flexbox 工具類 (`row`, `justify-center`, `q-gutter-md`)

### 📱 兒童友善設計：
1. **大尺寸元素**：使用 `size="xl"` 按鈕和輸入框
2. **進度追蹤**：`q-linear-progress` 顯示測驗進度
3. **提示系統**：`q-banner` 顯示單字提示
4. **語音功能**：整合 Web Speech API
5. **表情符號**：視覺化單字表示
6. **響應式設計**：Quasar 網格系統 (`col-12`, `col-md-8`)

### ⚡ 極簡 CSS：
- 僅使用 30 行自定義 CSS（只有動畫效果）
- 其餘全部使用 Quasar 內建樣式
- 漸層背景和動畫是唯一的自定義樣式

### 🎮 互動功能：
- 答題動畫回饋（搖擺/彈跳）
- 聲音按鈕
- 清除輸入功能
- 測驗完成慶祝畫面
