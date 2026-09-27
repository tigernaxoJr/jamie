# Adventure 模組：字靈探險隊

類似收集養成的探險遊戲：用題庫單字答題來捕捉、對戰「字靈」，收集圖鑑。
共 10 個地區（對應題庫第 1～10 級）、53 種字靈（含 1 隻傳說字靈）。
所有字靈都是原創，外觀由 SVG 部件組合（`ui/CreatureSvg.vue`），不需要任何圖片素材。

## 結構

```
Adventure/
├── index.ts              # 路由 adventureRoutes、遊戲中心卡片 adventureCard
├── domain/               # 純資料與規則（不含畫面）
│   ├── elements.ts       # 6 種屬性、招式名稱、相剋倍率
│   ├── species.ts        # 字靈資料（名字、英文單字、屬性、稀有度、外觀部件）
│   ├── areas.ts          # 地區：對應題庫級別、出現字靈、等級範圍、解鎖條件
│   ├── rules.ts          # 捕捉率、能力值、傷害、經驗值等數值
│   ├── questions.ts      # 題型與出題
│   └── words.ts          # 取得地區出題用的單字
├── store/                # 存檔（localStorage 'adventure-save'）
└── ui/
    ├── CreatureSvg.vue   # 字靈外觀產生器（身體與臉）
    ├── creature/         # 部件：身體後方 / 前方的配件、共用幾何資料
    ├── QuestionCard.vue  # 捕捉、對戰共用的答題卡
    ├── encounter/        # 捕捉面板、對戰面板
    └── pages/            # 地圖、遭遇、圖鑑
```

## 遊戲規則

- **捕捉**：3 題聽力題，每題可選難度（簡單 +1、普通 +2、困難 +3 能量）。能量越高捕捉率越高，
  範圍依稀有度而定（`rules.ts` 的 `CAPTURE_RANGE`）。先對戰打贏可多 3 格能量。
- **對戰**：回合制 1 對 1。撞擊（看中文選英文）、屬性技（聽發音選拼法，吃屬性相剋）、
  必殺技（看中文拼英文，要連擊 3 次才能用）。暴擊率 = 最近 10 題答對率 × 30%。
- 所有答題結果都會寫入單字記憶，影響單字測驗的出題順序。

## 新增字靈 / 地區

1. 在 `domain/species.ts` 的 `SPECIES` 加一筆（外觀用 `look` 組合部件）。
   需要新部件時，在 `CreaturePart` 加型別，並在 `ui/creature/` 的前方或後方部件元件畫出來。
2. 把字靈編號加到 `domain/areas.ts` 某個地區的 `species`；新地區加在 `AREAS` 並設定 `wordLevel`。
3. 數值平衡都在 `domain/rules.ts` 調整。
