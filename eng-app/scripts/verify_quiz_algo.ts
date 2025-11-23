import { WordQuizService } from '../src/modules/Vocabulary/domain/WordQuizService';
import type { QuizWord, AnswerRecord } from '../src/modules/Vocabulary/domain/QuizWord';

// Mock QuizWord class since we can't import the real one easily if it has other dependencies
// or just use a factory function
const createWord = (
  id: number,
  lastErrorTime: number,
  lastCorrectTime: number,
  correctConsecutive: number,
  errorConsecutive: number,
  errorCount: number,
): QuizWord => {
  return {
    id,
    english: `word${id}`,
    chinese: `解釋${id}`,
    errorRec: {
      count: errorCount,
      lastTime: lastErrorTime,
      consecutive: errorConsecutive,
    } as AnswerRecord,
    correctRec: {
      count: 0, // Simplified
      lastTime: lastCorrectTime,
      consecutive: correctConsecutive,
    } as AnswerRecord,
  } as QuizWord;
};

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

// Scenarios
const words: QuizWord[] = [
  // 1. New Word: Never seen
  createWord(1, 0, 0, 0, 0, 0),
  // 2. Recent Word: Answered 1 hour ago (Correct)
  createWord(2, 0, now - 1 * hour, 1, 0, 0),
  // 3. Streak 1 Word: Correct once, 2 days ago
  createWord(3, 0, now - 2 * day, 1, 0, 0),
  // 4. Streak 5 Word: Correct 5 times, 2 days ago
  createWord(4, 0, now - 2 * day, 5, 0, 0),
  // 5. Old Error Word: Error 10 days ago, Streak 0
  createWord(5, now - 10 * day, 0, 0, 1, 1),
  // 6. Recent Error Word: Error 2 days ago, Streak 0
  createWord(6, now - 2 * day, 0, 0, 1, 1),
];

const service = new WordQuizService();

// Access private method for testing (using any cast)
// Or just use getNextQuizWord multiple times and see the order if we could inspect scores
// But getNextQuizWord only returns one.
// Let's modify the service temporarily to expose scores OR just rely on getNextQuizWord behavior?
// Actually, I can just copy the logic here to verify OR use the service if I can access the score.
// Since I cannot easily access private method, I will use getNextQuizWord and see which one is picked first.
// But getNextQuizWord has random factor.
// Better to use the logic directly or add a public helper in the service for debugging?
// I added console.log in the service? No I didn't.
// Let's use the service and print the result of getNextQuizWord.
// Wait, to verify the ORDER, I need to see the scores.
// I will use `(service as any).calculatePriorityScore(word, now)` to print scores.

console.log('--- Verification Start ---');
console.log('Now:', new Date(now).toISOString());

words.forEach((w) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const score = (service as any).calculatePriorityScore(w, now);
  let desc = '';
  if (w.id === 1) desc = 'New Word';
  if (w.id === 2) desc = 'Recent Word (1h ago)';
  if (w.id === 3) desc = 'Streak 1 (2 days ago)';
  if (w.id === 4) desc = 'Streak 5 (2 days ago)';
  if (w.id === 5) desc = 'Old Error (10 days ago)';
  if (w.id === 6) desc = 'Recent Error (2 days ago)';

  console.log(`ID: ${w.id} [${desc}] Score: ${score.toFixed(2)}`);
});

console.log('--- Expected Order (High to Low) ---');
console.log('1. New Word (Score ~5000)');
console.log('2. Old Error Word (Score ~240)');
console.log('3. Recent Error Word (Score ~48)');
console.log('4. Streak 1 Word (Score ~ -10,000)');
console.log('5. Streak 5 Word (Score ~ -50,000)');
console.log('6. Recent Word (Score ~ -1,000,000)');
