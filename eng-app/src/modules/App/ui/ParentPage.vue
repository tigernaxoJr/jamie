<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle emoji="👨‍👩‍👦" title="家長專區" subtitle="學習報告、備份與還原" />
      <BackupCard />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import PageTitle from 'src/components/PageTitle.vue';
import BackupCard from './BackupCard.vue';
</script>
