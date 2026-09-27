import type { RouteRecordRaw } from 'vue-router';
import { gameRoutes } from 'src/modules/Games';
import { adventureRoutes } from 'src/modules/Adventure';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/modules/App/ui/IndexPage.vue') },
      { path: 'quiz', component: () => import('src/modules/Vocabulary/ui/QuizPage.vue') },
      { path: 'review', component: () => import('src/modules/Vocabulary/ui/ReviewPage.vue') },
      { path: 'parent', component: () => import('src/modules/App/ui/ParentPage.vue') },
      { path: 'typing', component: () => import('src/modules/Typing/TypingPage.vue') },
      ...gameRoutes,
      ...adventureRoutes,
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/modules/App/ui/ErrorNotFound.vue'),
  },
];

export default routes;
