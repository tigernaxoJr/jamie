import { onScopeDispose, ref, watch } from 'vue';
import { useDocumentVisibility } from '@vueuse/core';

/**
 * requestAnimationFrame 遊戲迴圈。
 * step 收到距離上一格的秒數；切到其他分頁時自動暫停，離開頁面時自動停止。
 */
export function useGameLoop(step: (dt: number) => void) {
  const running = ref(false);
  const paused = ref(false);
  const visibility = useDocumentVisibility();
  let frame = 0;
  let last = 0;

  const tick = (now: number) => {
    // 限制最大 dt，避免分頁切回來時一次跳太多
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused.value) step(dt);
    if (running.value) frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running.value) return;
    running.value = true;
    paused.value = false;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running.value = false;
    cancelAnimationFrame(frame);
  };

  const pause = () => {
    if (running.value) paused.value = true;
  };

  const resume = () => {
    paused.value = false;
  };

  watch(visibility, (v) => {
    if (v === 'hidden') pause();
  });

  onScopeDispose(stop);
  return { running, paused, start, stop, pause, resume };
}
