<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle
        emoji="📒"
        title="貼紙簿"
        :subtitle="`拿到 ${earnedCount} / ${store.stickers.length} 張貼紙`"
        back="/adventure"
      />

      <div class="stickers">
        <div
          v-for="{ sticker, earned, value } in store.stickers"
          :key="sticker.id"
          class="sticker app-card"
          :class="{ 'sticker--earned': earned }"
        >
          <span v-if="newIds.has(sticker.id)" class="sticker__new">新！</span>
          <span class="sticker__emoji">{{ earned ? sticker.emoji : '❔' }}</span>
          <span class="sticker__name">{{ sticker.name }}</span>
          <span class="sticker__hint">{{ sticker.hint }}</span>
          <template v-if="!earned && sticker.goal > 1">
            <q-linear-progress
              :value="value / sticker.goal"
              color="accent"
              track-color="grey-3"
              size="6px"
              rounded
              class="q-mt-xs"
            />
            <span class="sticker__count">{{ value }} / {{ sticker.goal }}</span>
          </template>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import PageTitle from 'src/components/PageTitle.vue';
import { useAdventureStore } from '../../store/useAdventureStore';

const store = useAdventureStore();
const earnedCount = computed(() => store.stickers.filter((x) => x.earned).length);

// 進來時記下哪些是新的，然後標成看過（這次還是顯示「新！」）
const newIds = new Set(store.newStickers.map((x) => x.sticker.id));
onMounted(() => store.markStickersSeen());
</script>

<style scoped lang="scss">
.stickers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.sticker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px 12px;
  text-align: center;
  color: #94a3b8;
}
.sticker--earned {
  color: inherit;
  background: linear-gradient(180deg, #fffbeb, #fff);
}
.sticker__emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  font-size: 2rem;
  filter: grayscale(1);
  opacity: 0.6;
}
.sticker--earned .sticker__emoji {
  background: #fef3c7;
  border: 3px dashed #f59e0b;
  filter: none;
  opacity: 1;
  transform: rotate(-6deg);
}
.sticker__name {
  margin-top: 6px;
  font-weight: 900;
}
.sticker__hint {
  font-size: 0.75rem;
}
.sticker__count {
  font-size: 0.7rem;
  font-weight: 700;
}
.sticker__new {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 900;
}
</style>
