<template>
  <q-layout view="hHh Lpr lFf">
    <q-header bordered>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Jamie's English App </q-toolbar-title>

        <div>Jamie App 0.0.1 alpha</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <template v-for="(x, idx) in linksList" :key="idx">
          <q-item clickable tag="a" :to="x.to">
            <q-item-section v-if="x.icon" avatar>
              <q-icon :name="x.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ x.title }}</q-item-label>
              <q-item-label caption>{{ x.caption }}</q-item-label>
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

const linksList = [
  {
    title: '英文測驗',
    caption: '開始英文單字測驗',
    icon: 'quiz',
    to: '/quiz',
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

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
