import { defineRouter } from '#q-app/wrappers';
import {
  type Router,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  handleStaleChunks(Router);

  return Router;
});

const RELOAD_KEY = 'chunk-reload-at';
/** 強制完整重新載入用的網址參數，載入後會被移除 */
const RELOAD_PARAM = 'reload';

/** 載入頁面檔案失敗的錯誤（瀏覽器各家訊息不同） */
const isChunkLoadError = (err: unknown) =>
  err instanceof Error &&
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
    err.message,
  );

/**
 * 重新部署後，舊分頁記得的頁面檔名已被刪除，換頁會失敗而看起來「沒反應」。
 * 遇到這種錯誤就重新載入網站並直接前往目標頁；10 秒內只重試一次，避免無限重整。
 */
function handleStaleChunks(router: Router) {
  // 上一次自動重新載入留下的參數，清掉讓網址保持乾淨
  const current = new URL(window.location.href);
  if (current.searchParams.has(RELOAD_PARAM)) {
    current.searchParams.delete(RELOAD_PARAM);
    window.history.replaceState(window.history.state, '', current.href);
  }

  const reloadTo = (href: string) => {
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY));
      if (Date.now() - last < 10_000) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      // sessionStorage 無法使用時照樣重新載入
    }
    // 只改 # 後面不會真的重新載入，所以加上一次性參數，也能避開快取的舊 index.html
    const target = new URL(href, window.location.href);
    target.searchParams.set(RELOAD_PARAM, String(Date.now()));
    window.location.assign(target.href);
  };

  // 注意：不要攔 Vite 的 'vite:preloadError' 事件，它會比這裡先觸發，但不知道目標頁，
  // 讓錯誤往上丟給 router，才能重新載入後直接前往要去的頁面
  router.onError((err, to) => {
    if (isChunkLoadError(err)) reloadTo(router.resolve(to).href);
  });
}
