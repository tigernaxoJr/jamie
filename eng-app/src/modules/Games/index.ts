import type { RouteRecordRaw } from 'vue-router';
import { gameEntries } from './registry';

/** Games 模組的路由，掛在 MainLayout 底下 */
export const gameRoutes: RouteRecordRaw[] = [
  { path: 'games', component: () => import('./hub/GamesHubPage.vue') },
  ...gameEntries.flatMap((e) => (e.component ? [{ path: e.path, component: e.component }] : [])),
];
