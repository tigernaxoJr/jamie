<template>
  <q-btn-toggle
    v-model="creatureStyle"
    dense
    rounded
    unelevated
    no-caps
    toggle-color="primary"
    color="white"
    text-color="dark"
    :options="CREATURE_STYLES"
    aria-label="字靈顯示方式"
  />
</template>

<script setup lang="ts">
import { CREATURE_STYLES, creatureStyle } from './style';
</script>
