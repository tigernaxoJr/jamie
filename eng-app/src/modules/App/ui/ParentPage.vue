<template>
  <q-page padding>
    <div class="page-container">
      <PageTitle emoji="👨‍👩‍👦" title="家長專區" subtitle="學習報告、備份與還原" />
      <ReportCard class="q-mb-lg" />
      <BackupCard />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import PageTitle from 'src/components/PageTitle.vue';
import BackupCard from './BackupCard.vue';
import ReportCard from './ReportCard.vue';
</script>
