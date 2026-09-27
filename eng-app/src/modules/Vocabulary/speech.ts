import { ref } from 'vue';

/**
 * 英文發音（瀏覽器內建 Text-to-Speech）。
 * 部分 Android 手機沒有安裝英文語音，發音會完全沒聲音或變成中文腔，
 * 所以主動挑選英文語音，找不到時透過 speechStatus 讓畫面提示家長。
 */

export type SpeechStatus = 'unknown' | 'ok' | 'no-english' | 'unsupported';

/** 語音狀態，畫面可據此顯示提示 */
export const speechStatus = ref<SpeechStatus>('unknown');

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
let englishVoice: SpeechSynthesisVoice | null = null;

/** 依偏好挑英文語音：en-US > en-GB > 其他 en；同語系中優先裝置內建（離線也能用） */
export const pickEnglishVoice = (voices: SpeechSynthesisVoice[]) => {
  const rank = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase().replace('_', '-');
    const langScore = lang === 'en-us' ? 0 : lang === 'en-gb' ? 1 : lang.startsWith('en') ? 2 : 9;
    return langScore * 2 + (v.localService ? 0 : 1);
  };
  const candidates = voices.filter((v) => rank(v) < 18).sort((a, b) => rank(a) - rank(b));
  return candidates[0] ?? null;
};

const refreshVoices = () => {
  const voices = speechSynthesis.getVoices();
  // 語音清單是非同步載入的，空清單代表還沒載入好
  if (voices.length === 0) return;
  englishVoice = pickEnglishVoice(voices);
  speechStatus.value = englishVoice ? 'ok' : 'no-english';
};

if (supported) {
  refreshVoices();
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  // 有些瀏覽器永遠不觸發 voiceschanged，過一段時間還是空的就視為沒有語音
  setTimeout(() => {
    refreshVoices();
    if (speechStatus.value === 'unknown') speechStatus.value = 'no-english';
  }, 3000);
} else {
  speechStatus.value = 'unsupported';
}

/** 唸出英文單字 */
export function WordPronunciation(word: string) {
  if (!supported || !word) return;
  // 連按時先停掉上一個，避免排隊唸很多次
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = englishVoice?.lang ?? 'en-US';
  if (englishVoice) utterance.voice = englishVoice;
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}

/** 另開分頁用 Google 翻譯聽發音（沒有英文語音時的備案） */
export const OpenGoogleTranslateTTS = (word: string) => {
  if (!word) return;
  const url = `https://translate.google.com.tw/?sl=en&tl=zh-TW&text=${encodeURIComponent(word)}&op=translate`;
  window.open(url, '_blank');
};
