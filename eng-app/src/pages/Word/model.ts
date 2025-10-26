export type Word = {
  id: number;
  english: string;
  chinese: string;
  image: string;
  error_rec: AnswerRecord;
  correct_rec: AnswerRecord;
};
export type AnswerRecord = {
  count: number;
  lastTime: number;
};

export function CreateWord(id: number, english: string, chinese: string, image?: string): Word {
  return {
    id,
    english,
    chinese,
    image: image || '',
    error_rec: { count: 0, lastTime: 0 },
    correct_rec: { count: 0, lastTime: 0 },
  };
}
export function WordPronunciation(word_eng: string) {
  const utterance = new SpeechSynthesisUtterance(word_eng);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

export type Result = {
  correct: boolean;
} | null;
