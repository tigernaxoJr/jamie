export function WordPronunciation(word_eng: string) {
  const utterance = new SpeechSynthesisUtterance(word_eng);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

// 另開分頁到 Google 翻譯 TTS
export const OpenGoogleTranslateTTS = (word: string) => {
  if (!word) return;
  // 構造 Google 翻譯 TTS 連結
  const url = `https://translate.google.com.tw/?sl=en&tl=zh-TW&text=${word}&op=translate`;
  // 另開一個新的瀏覽器分頁 (tab)
  window.open(url, '_blank');
};
