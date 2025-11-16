import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      // { path: 'quiz', component: () => import('src/pages/Word/QuizPage.vue') },
      { path: 'quiz', component: () => import('src/modules/Vocabulary/Views/QuizPage.vue') },
      { path: 'review', component: () => import('src/pages/Word/ReviewPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
