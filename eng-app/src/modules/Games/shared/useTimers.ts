import { onScopeDispose } from 'vue';

/**
 * setTimeout 的包裝：離開頁面時自動清除，也可以手動全部取消。
 */
export function useTimers() {
  const ids = new Set<ReturnType<typeof setTimeout>>();

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      ids.delete(id);
      fn();
    }, ms);
    ids.add(id);
  };

  const clearAll = () => {
    ids.forEach(clearTimeout);
    ids.clear();
  };

  onScopeDispose(clearAll);
  return { later, clearAll };
}
