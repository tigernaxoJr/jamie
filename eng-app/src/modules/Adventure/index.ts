import type { RouteRecordRaw } from 'vue-router';

/** 字靈探險隊的路由，掛在 MainLayout 底下 */
export const adventureRoutes: RouteRecordRaw[] = [
  { path: 'adventure', component: () => import('./ui/pages/AdventureMapPage.vue') },
  { path: 'adventure/dex', component: () => import('./ui/pages/DexPage.vue') },
  {
    path: 'adventure/explore/:areaId',
    component: () => import('./ui/pages/EncounterPage.vue'),
  },
];

/** 遊戲中心的入口卡片 */
export const adventureCard = {
  id: 'adventure',
  title: '字靈探險隊',
  icon: '🧭',
  description: '答對單字收服字靈、組隊對戰，收集完整圖鑑！',
  skill: '聽力・拼字',
  color: 'green-7',
};
