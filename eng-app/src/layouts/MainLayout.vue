<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <router-link to="/" class="brand row items-center no-wrap">
          <span class="brand__logo">🦉</span>
          <span class="brand__name">Jamie's English</span>
        </router-link>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="family_restroom"
          color="grey-7"
          class="q-mr-sm"
          to="/parent"
          aria-label="家長專區"
          title="家長專區"
        />
        <div
          v-if="streak > 0"
          class="pill pill--streak q-mr-xs"
          :title="`連續 ${streak} 天達成每日目標`"
        >
          🔥 {{ streak }}
        </div>
        <div class="pill" :title="`已熟練 ${mastered} 個單字`">⭐ {{ mastered }}</div>
      </q-toolbar>
      <UpdateNotice />
      <SpeechNotice />
    </q-header>

    <!-- 桌機：側邊選單 -->
    <q-drawer v-model="drawerOpen" show-if-above :breakpoint="1023" :width="232" class="app-drawer">
      <nav class="q-pa-md column q-gutter-y-sm">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item row items-center no-wrap"
          :class="{ 'nav-item--active': isActive(item) }"
        >
          <q-icon :name="item.icon" size="26px" />
          <span>{{ item.title }}</span>
        </router-link>
      </nav>
    </q-drawer>

    <!-- 手機、平板：底部選單 -->
    <q-footer v-if="$q.screen.lt.md" class="app-footer">
      <q-tabs
        dense
        no-caps
        indicator-color="transparent"
        active-color="primary"
        class="footer-tabs text-grey-7"
      >
        <q-route-tab
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :exact="!!item.exact"
          :icon="item.icon"
          :label="item.title"
          class="footer-tab"
        />
      </q-tabs>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProgressSummary, getTodayProgress } from 'src/modules/Vocabulary';
import SpeechNotice from 'src/components/SpeechNotice.vue';
import UpdateNotice from 'src/components/UpdateNotice.vue';
import { type NavItem, navItems } from './navigation';

const route = useRoute();
// show-if-above 會在桌機自動打開；手機上保持關閉（改用底部選單）
const drawerOpen = ref(false);

const isActive = (item: NavItem) =>
  item.exact
    ? route.path === item.to
    : route.path === item.to || route.path.startsWith(`${item.to}/`);

// 換頁時更新熟練單字數
const mastered = ref(0);
const streak = ref(0);
watch(
  () => route.path,
  () => {
    mastered.value = getProgressSummary().mastered;
    streak.value = getTodayProgress().streak;
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.pill--streak {
  background: #fff7ed;
  color: #ea580c;
}
.app-header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  color: var(--app-ink);
  border-bottom: 1px solid var(--app-line);
}
.app-toolbar {
  min-height: 60px;
}
.brand {
  text-decoration: none;
  color: inherit;
  gap: 10px;
}
.brand__logo {
  font-size: 1.9rem;
  line-height: 1;
}
.brand__name {
  font-size: 1.25rem;
  font-weight: 900;
  background: linear-gradient(90deg, $primary, #0ea5a5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.app-drawer {
  background: transparent;
}
:deep(.q-drawer) {
  background: transparent;
}
.nav-item {
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--app-muted);
  text-decoration: none;
  transition: background 0.15s;
  &:hover {
    background: rgba(22, 119, 210, 0.08);
    color: $primary;
  }
}
.nav-item--active,
.nav-item--active:hover {
  background: $primary;
  color: #fff;
  box-shadow: 0 6px 16px rgba(22, 119, 210, 0.35);
}
.app-footer {
  background: #fff;
  border-top: 1px solid var(--app-line);
  padding-bottom: env(safe-area-inset-bottom);
}
.footer-tab {
  flex: 1 1 0;
  min-width: 0;
  padding: 4px 0;
  font-weight: 800;
}
:deep(.footer-tabs .q-tabs__content) {
  width: 100%;
}
:deep(.footer-tab .q-tab__label) {
  font-size: 0.75rem;
  font-weight: 800;
}
</style>
