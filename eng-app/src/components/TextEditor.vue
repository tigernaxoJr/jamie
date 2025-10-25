<template>
  <q-btn @click="test"></q-btn>
  <q-editor
    ref="editor"
    v-model="model"
    v-bind="$attrs"
    @paste.prevent.stop="onpaste"
    @drop.prevent.stop="ondrop"
  />
  <q-input v-model="model" filled type="textarea" />
  <div v-html="model"></div>
</template>

<script setup lang="ts">
import type { QPage } from 'quasar';
import { ref } from 'vue';
const test = () => {
  // runCmd 最終依賴於原生的 execCommand，如果您需要一些不常見的命令，您可以參考完整的 document.execCommand() 參考手冊
  // 以 Range 取代 https://claude.ai/chat/cf715ff7-1a22-48eb-b698-2269c748796f
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (editor.value as any).caret.eVm.runCmd('backColor', '#ff0000');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (editor.value as any).caret.eVm.runCmd('foreColor', '#00ff00');
};
const editor = ref<QPage>();
const model = ref('');
const onpaste = async (e: ClipboardEvent) => {
  console.log('past', e.clipboardData?.files);
  if (!e.clipboardData) return;
  const base64 = await firstFileToBase64(e.clipboardData.files);
  console.log('base64', base64);
};
const ondrop = async (e: DragEvent) => {
  console.log('drop', e);
  if (!e.dataTransfer) throw new Error('dataTransfer is null');
  const base64 = await firstFileToBase64(e.dataTransfer.files);
  console.log('base64', base64);
};

// 輔助函數：將 File 轉換為 Base64 字串（包含 data URL 前綴）
const firstFileToBase64 = (files: FileList): Promise<string> => {
  // 取得第一個檔案
  if (files.length === 0) throw new Error('files length is 0');
  const file = files[0];
  if (!file) throw new Error('file is null');
  // console.log('file', file);

  return new Promise((resolve, reject) => {
    // 檢查檔案類型是否為影像
    if (!file.type.startsWith('image/')) return reject(new Error('非影像檔案'));

    const reader = new FileReader();

    // 讀取完成時
    // reader.result 會包含 data URL 字串 (例如: data:image/png;base64,iVBORw0...)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('讀取結果非字串'));
      }
    };

    // 讀取錯誤時
    reader.onerror = () => reject(new Error('讀取檔案時發生錯誤'));

    // 開始將檔案讀取為 Data URL
    reader.readAsDataURL(file);
  });
};
</script>

<style scoped></style>
