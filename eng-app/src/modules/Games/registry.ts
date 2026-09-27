import type { RouteComponent } from 'vue-router';
import type { GameCard } from './shared/types';
import { battleInfo } from './battle/info';
import { snakeInfo } from './snake/info';
import { bombInfo } from './bomb/info';
import { spaceInfo } from './space/info';
import { memoryInfo } from './memory/info';

export interface GameEntry {
  card: GameCard;
  /** 路由路徑（相對於 MainLayout） */
  path: string;
  /** 由 Games 模組提供頁面時才需要；外部遊戲只放連結 */
  component?: () => Promise<RouteComponent>;
}

/**
 * 遊戲清單：新增遊戲時只要在這裡加一筆，遊戲中心與路由會自動更新。
 */
export const gameEntries: GameEntry[] = [
  { card: battleInfo, path: 'games/battle', component: () => import('./battle/BattlePage.vue') },
  { card: spaceInfo, path: 'games/space', component: () => import('./space/SpacePage.vue') },
  { card: snakeInfo, path: 'games/snake', component: () => import('./snake/SnakePage.vue') },
  { card: bombInfo, path: 'games/bomb', component: () => import('./bomb/BombPage.vue') },
  { card: memoryInfo, path: 'games/memory', component: () => import('./memory/MemoryPage.vue') },
  {
    card: {
      id: 'typing',
      title: '打字遊戲',
      icon: '⌨️',
      description: '在字母掉到底之前把它打出來！',
      skill: '打字',
      color: 'blue-grey',
      desktopOnly: true,
    },
    path: 'typing',
  },
];
