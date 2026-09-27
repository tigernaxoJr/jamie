import { register } from 'register-service-worker';

/** 有新版本下載完成時發出，畫面會顯示「點這裡更新」 */
export const UPDATE_EVENT = 'app-update-available';

register(process.env.SERVICE_WORKER_FILE, {
  updated() {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  },
});
