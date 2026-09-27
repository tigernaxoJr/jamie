import type { RouteRecordRaw } from 'vue-router';
import { gameEntries } from './registry';

export { getGameReport } from './shared/gameLogStorage';
export type { GameReport } from './shared/gameLog';

/** 遊戲 id → 卡片（名稱、圖示），報告顯示用 */
export const gameCardOf = (id: string) => gameEntries.find((e) => e.card.id === id)?.card;

/** Games 模組的路由，掛在 MainLayout 底下 */
export const gameRoutes: RouteRecordRaw[] = [
  { path: 'games', component: () => import('./hub/GamesHubPage.vue') },
  ...gameEntries.flatMap((e) => (e.component ? [{ path: e.path, component: e.component }] : [])),
];
