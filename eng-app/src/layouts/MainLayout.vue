<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="bg-white text-primary" height-hint="58" bordered>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title class="text-weight-bold"> Jamie's English App </q-toolbar-title>

        <div class="text-caption text-grey-7">v0.0.1 alpha</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-grey-1" bordered>
      <q-list padding>
        <template v-for="(x, idx) in linksList" :key="idx">
          <q-item
            clickable
            tag="a"
            :to="x.to"
            :active="isActive(x.to)"
            class="q-mx-md q-my-xs rounded-borders"
            active-class="bg-primary text-white"
          >
            <q-item-section v-if="x.icon" avatar>
              <q-icon :name="x.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ x.title }}</q-item-label>
              <q-item-label caption :class="isActive(x.to) ? 'text-white' : ''">{{
                x.caption
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const linksList = [
  {
    title: '英文測驗',
    caption: '開始英文單字測驗',
    icon: 'quiz',
    to: '/quiz',
  },
  {
    title: '英文複習',
    caption: '開始英文單字複習',
    icon: 'book',
    to: '/review',
  },
  {
    title: '遊戲中心',
    caption: '邊玩邊背單字',
    icon: 'sports_esports',
    to: '/games',
  },
  {
    title: '打字遊戲',
    caption: '英文打字練習 (限電腦版)',
    icon: 'keyboard',
    to: '/typing',
  },
  {
    title: '首頁',
    caption: '回到首頁',
    icon: 'home',
    to: '/',
  },
] as {
  title: string;
  caption: string;
  icon: string;
  to: string;
}[];

const route = useRoute();
// 子頁面（例如 /games/battle）也要讓上層選單亮起來
const isActive = (to: string) =>
  route.path === to || (to !== '/' && route.path.startsWith(`${to}/`));

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
