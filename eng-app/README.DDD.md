# DDD 專案檔案結構範例（四層架構）

DDD（領域驅動設計）的專案結構通常會採用**四層架構 (Four-Layer Architecture)**，這是為了確保領域模型的獨立性、專注於業務邏輯，並將技術細節與核心業務邏輯分離。

以下是一個常見的 DDD 專案檔案結構範例，以及各層的功能說明：

## 📁 DDD 專案檔案結構範例（四層架構）

```
project/
├── interfaces/         # 介面層 (Presentation / UI Layer)
│   ├── web/            # 網頁或 API 介面 (Controllers, Views, DTOs)
│   └── cli/            # 命令列介面
│
├── application/      # 應用層 (Application Layer)
│   ├── services/       # 應用服務 (Application Services)
│   ├── commands/       # 命令 (Commands)
│   ├── queries/        # 查詢 (Queries)
│   └── dtos/           # 資料傳輸物件 (DTOs)
│
├── domain/           # 領域層 (Domain Layer) - 核心業務邏輯
│   ├── aggregate/      # 聚合根 (Aggregates)
│   ├── entity/         # 領域實體 (Entities)
│   ├── valueobject/    # 值物件 (Value Objects)
│   ├── repository/     # 倉儲介面 (Repository Interfaces)
│   ├── service/        # 領域服務 (Domain Services)
│   └── event/          # 領域事件 (Domain Events)
│
└── infrastructure/   # 基礎設施層 (Infrastructure Layer)
    ├── persistence/    # 持久化/資料庫實作 (Repository Implementations, ORM Configuration)
    ├── external/       # 外部服務整合 (External API Clients, Messaging Implementation)
    └── utility/        # 實用工具 (Logging, Security Implementation)
```

## 🛠️ 各層與其功能說明

### 1\. 介面層 (Interfaces Layer / Presentation Layer)

- **功能：** 負責處理使用者介面（UI）或外部系統的輸入與輸出。它將輸入轉換為應用層可以理解的命令或查詢，並將應用層的結果格式化後呈現給使用者。
- **關鍵職責：**
  - 接收 HTTP 請求、處理 JSON/XML 資料。
  - 將請求資料轉換為 **DTO**（Data Transfer Objects）並傳遞給應用層。
  - **控制器 (Controllers)**：作為進入點，協調應用層的呼叫。
  - 不包含任何業務邏輯。

### 2\. 應用層 (Application Layer)

- **功能：** 協調應用程式的執行流程、管理事務邊界，並承載特定的使用案例 (Use Cases)。它是領域層的「客戶」。
- **關鍵職責：**
  - **應用服務 (Application Services)**：負責處理一個特定的使用案例或業務流程，例如 `CreateOrderService`。
  - 負責**流程編排**：讀取領域模型、呼叫領域層方法執行業務邏輯、使用倉儲儲存結果。
  - 管理**事務 (Transaction)** 的開始與結束。
  - 不包含複雜的業務規則或領域知識，那些都屬於領域層。

### 3\. 領域層 (Domain Layer) - **DDD 的核心**

- **功能：** 包含所有核心業務邏輯、規則和概念。它是對業務問題的抽象描述，是整個專案的靈魂。
- **關鍵職責：**
  - **聚合根 (Aggregates)**：保證一組相關實體和值物件的資料一致性，是倉儲操作的基本單元。
  - **領域實體 (Entities)**：具有生命週期和唯一標識（ID），包含特定業務邏輯的方法。
  - **值物件 (Value Objects)**：描述事物的屬性，**不可變**，透過屬性值判斷相等。
  - **倉儲介面 (Repository Interfaces)**：**僅定義**資料存取的方法（例如 `findById`、`save`），實作則放在基礎設施層。
  - **領域服務 (Domain Services)**：處理涉及多個實體或值物件的複雜業務邏輯，且不適合放在任何單一實體中的操作。
  - **領域事件 (Domain Events)**：表示在領域中發生的重要事情。
  - **領域層不能依賴任何其他層**（只能依賴自己或更底層的標準函式庫）。

### 4\. 基礎設施層 (Infrastructure Layer)

- **功能：** 提供技術支援，實現其他層所定義的技術性介面。它包含所有的技術細節。
- **關鍵職責：**
  - **持久化實作 (Persistence)**：實現領域層定義的**倉儲介面**，與資料庫（SQL、NoSQL 等）或檔案系統進行實際互動。
  - **外部服務**：實作與外部系統的介面，如發送郵件、呼叫第三方 API、訊息佇列等。
  - **技術性實用程式**：例如日誌 (Logging)、安全 (Security)、配置 (Configuration) 等的實際程式碼。

## 🔍 核心原則：依賴方向

在 DDD 的四層架構中，最重要的一個原則是**依賴方向**：

$$\text{Interfaces} \rightarrow \text{Application} \rightarrow \text{Domain} \leftarrow \text{Infrastructure}$$

- **Domain 層** 是最獨立的，它**不能依賴** Application 層或 Interfaces 層。
- **Domain 層** 只定義**介面**（例如 Repository Interface），由 **Infrastructure 層**來**實作**這些介面，這使用了**依賴反轉原則 (Dependency Inversion Principle, DIP)**。
- 這個結構確保了**核心業務邏輯 (Domain)** 不受技術細節（如資料庫、框架）的影響，可以獨立演進和測試。

請問您目前是想針對特定的技術棧（例如 Java/Spring Boot、C\#/.NET、Python/Django/Flask）尋找更具體的實作範例嗎？
