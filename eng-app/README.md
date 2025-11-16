# Jamie's English App (eng-app)

Jamie's English App

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

src/
├── boot/ # Quasar 啟動檔案 (技術層)
├── components/ # 通用或純 UI 組件 (技術/UI 層)
├── css/ # 樣式 (技術層)
├── layouts/ # 應用程式的通用佈局 (技術/UI 層)
├── pages/ # 頁面路由的進入點 (UI/技術層)
├── router/ # 路由定義 (技術層)
├── **modules/** # ✨ 垂直切片的核心目錄 (VSA + DDD)
│ ├── **Auth/** # 認證/登入/註冊 切片
│ │ ├── api/ # 認證相關的 API 呼叫
│ │ ├── components/ # Auth 專用的 UI 組件
│ │ ├── domain/ # DDD 領域模型 (e.g. User 實體)
│ │ ├── store/ # Pinia/Vuex 狀態 (AuthState)
│ │ └── views/ # 頁面組件 (e.g. LoginPage.vue)
│ │
│ ├── **ProductCatalog/** # 產品目錄 切片
│ │ ├── api/ # 產品相關的 API 呼叫
│ │ ├── domain/ # DDD 領域模型 (e.g. Product 實體, Filter VO)
│ │ ├── store/ # Pinia/Vuex 狀態 (ProductState)
│ │ └── views/ # 頁面組件 (e.g. ProductListPage.vue)
│ │
│ └── **Ordering/** # 訂單處理/結帳 切片
│ └── ...
│
└── **shared/** # 跨模組的通用功能
├── constants/
└── utils/

src/
├── ...
├── **modules/** │ ├── **ProductCatalog/** # 產品目錄 切片
│ │ ├── api/  
│ │ ├── domain/  
│ │ ├── store/  
│ │ └── **views/** # ✨ 該模組專屬的頁面組件
│ │ ├── ProductListPage.vue # (路由進入點)
│ │ └── ProductDetailsPage.vue # (路由進入點)
│ │
│ └── **Auth/** │ └── **views/** │ └── LoginPage.vue
│
└── **pages/** # 僅用於存放【通用、極簡或跨模組】的頁面
├── Error404.vue # 404 頁面
