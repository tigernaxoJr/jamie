import { register } from 'register-service-worker';

/** 有新版本下載完成時發出，畫面會顯示「點這裡更新」 */
export const UPDATE_EVENT = 'app-update-available';

/** 常駐背景的 PWA 不會重新導覽，瀏覽器就不會自己檢查 sw.js，所以要主動檢查 */
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

register(process.env.SERVICE_WORKER_FILE, {
  ready(registration) {
    const check = () => void registration.update().catch(() => undefined);
    setInterval(check, CHECK_INTERVAL_MS);
    // 從背景切回前景時馬上檢查
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },
  updated() {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  },
});
