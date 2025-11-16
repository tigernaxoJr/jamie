export function WordPronunciation(word_eng: string) {
  const utterance = new SpeechSynthesisUtterance(word_eng);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}
