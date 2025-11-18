import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/modules/App/ui/IndexPage.vue') },
      { path: 'quiz', component: () => import('src/modules/Vocabulary/ui/QuizPage.vue') },
      { path: 'review', component: () => import('src/modules/Vocabulary/ui/ReviewPage.vue') },
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
