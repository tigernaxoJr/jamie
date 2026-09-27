declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

interface Window {
  /** index.html 定義：淡出啟動畫面（app 準備好時呼叫） */
  hideBootSplash?: () => void;
}
