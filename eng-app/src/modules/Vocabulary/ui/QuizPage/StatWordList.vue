<template>
  <div class="stat-word-list">
    <q-table
      flat
      bordered
      :rows="words"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :filter="filter"
      :grid="$q.screen.lt.sm"
      binary-state-sort
      class="stat-table"
      no-data-label="沒有單字"
      rows-per-page-label="每頁行數"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="搜尋單字">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <!-- Custom Body for Desktop -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="english" :props="props">
            <div class="text-subtitle1 text-weight-bold">{{ props.row.english }}</div>
            <div class="text-body2 text-grey-7 sm-hide">
              {{ props.row.chinese }}
            </div>
          </q-td>
          <q-td key="speech" :props="props">
            <SpeechStrip :word="props.row.english" />
          </q-td>
          <q-td key="chinese" :props="props" class="gt-xs text-body1">
            {{ props.row.chinese }}
          </q-td>
          <q-td key="correctCount" :props="props" class="text-body1">
            <q-badge color="positive" class="text-subtitle2">{{ props.row.correctRec.count }}</q-badge>
          </q-td>
          <q-td key="errorCount" :props="props" class="text-body1">
            <q-badge color="negative" class="text-subtitle2">{{ props.row.errorRec.count }}</q-badge>
          </q-td>
          <q-td key="correctConsecutive" :props="props" class="text-body1">
            {{ props.row.correctRec.consecutive }}
          </q-td>
          <q-td key="errorConsecutive" :props="props" class="text-body1">
            {{ props.row.errorRec.consecutive }}
          </q-td>
        </q-tr>
      </template>

      <!-- Custom Grid for Mobile -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered class="q-pa-sm">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h5 text-primary text-weight-bold">{{ props.row.english }}</div>
                  <div class="text-subtitle1 text-grey-8">{{ props.row.chinese }}</div>
                </div>
                <div class="col-auto">
                  <SpeechStrip :word="props.row.english" />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-py-sm">
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <div class="text-subtitle2 text-grey-6">總答對</div>
                  <div class="text-h6 text-positive">{{ props.row.correctRec.count }}</div>
                </div>
                <div class="col-6">
                  <div class="text-subtitle2 text-grey-6">總答錯</div>
                  <div class="text-h6 text-negative">{{ props.row.errorRec.count }}</div>
                </div>
                <div class="col-6">
                  <div class="text-subtitle2 text-grey-6">連續對</div>
                  <div class="text-h6">{{ props.row.correctRec.consecutive }}</div>
                </div>
                <div class="col-6">
                  <div class="text-subtitle2 text-grey-6">連續錯</div>
                  <div class="text-h6">{{ props.row.errorRec.consecutive }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { QuizWord } from '../../domain';
import type { QTableColumn } from 'quasar';
import SpeechStrip from './SpeechStrip.vue';

interface Props {
  words: QuizWord[];
}

defineProps<Props>();

const filter = ref('');
const pagination = ref({
  sortBy: 'english',
  descending: false,
  page: 1,
  rowsPerPage: 10
});

const columns: QTableColumn<QuizWord>[] = [
  {
    name: 'english',
    required: true,
    label: '英文單字',
    align: 'left',
    field: (row) => row.english,
    format: (val) => `${val}`,
    sortable: true
  },
  {
    name: 'speech',
    align: 'center',
    label: '發音',
    field: (row) => row.english
  },
  {
    name: 'chinese',
    align: 'left',
    label: '中文解釋',
    field: (row) => row.chinese,
    sortable: true,
    classes: 'gt-xs',
    headerClasses: 'gt-xs'
  },
  {
    name: 'correctCount',
    align: 'center',
    label: '對',
    field: (row) => row.correctRec.count,
    sortable: true
  },
  {
    name: 'errorCount',
    align: 'center',
    label: '錯',
    field: (row) => row.errorRec.count,
    sortable: true
  },
  {
    name: 'correctConsecutive',
    align: 'center',
    label: '連對',
    field: (row) => row.correctRec.consecutive,
    sortable: true
  },
  {
    name: 'errorConsecutive',
    align: 'center',
    label: '連錯',
    field: (row) => row.errorRec.consecutive,
    sortable: true
  }
];
</script>

<style scoped>
.stat-table {
  max-height: 65vh;
}

:deep(.q-table th) {
  font-size: 1.1rem;
  font-weight: bold;
  background-color: #f8f9fa;
}

:deep(.q-table td) {
  font-size: 1rem;
}

:deep(.q-table__top) {
  padding: 12px 16px;
}

:deep(.q-table__top .q-field__input) {
  font-size: 1.1rem;
}

@media (max-width: 600px) {
  .stat-table {
    max-height: 75vh;
  }
}
</style>
