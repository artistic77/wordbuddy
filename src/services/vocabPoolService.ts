import {
  EASY_VOCAB_POOL,
  MEDIUM_VOCAB_POOL,
  HARD_VOCAB_POOL,
  TOTAL_GAME_VOCAB_POOL,
  type PoolWord,
} from '../data/gameVocabPool';

export type QuestionMode = 'en_to_th' | 'th_to_en' | 'mixed';
export type PoolDifficulty = 'easy' | 'medium' | 'hard' | 'all';

export interface GeneratedGameQuestion {
  id: string;
  mode: 'en_to_th' | 'th_to_en';
  questionPrompt: string;
  subPrompt?: string;
  audioText: string;
  audioLang: 'en' | 'th';
  correctAnswer: string;
  options: string[];
  originalWord: PoolWord;
}

export class VocabPoolService {
  private getPool(difficulty: PoolDifficulty = 'all'): PoolWord[] {
    switch (difficulty) {
      case 'easy':
        return EASY_VOCAB_POOL;
      case 'medium':
        return MEDIUM_VOCAB_POOL;
      case 'hard':
        return HARD_VOCAB_POOL;
      default:
        return TOTAL_GAME_VOCAB_POOL;
    }
  }

  getRandomWords(count: number, difficulty: PoolDifficulty = 'all'): PoolWord[] {
    const pool = this.getPool(difficulty);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  }

  getRandomQuestions(
    count: number,
    difficulty: PoolDifficulty = 'all',
    mode: QuestionMode = 'mixed'
  ): GeneratedGameQuestion[] {
    const pool = this.getPool(difficulty);
    const shuffledWords = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

    return shuffledWords.map((word, index) => {
      // Determine question direction
      const currentMode: 'en_to_th' | 'th_to_en' =
        mode === 'mixed' ? (index % 2 === 0 ? 'en_to_th' : 'th_to_en') : mode;

      // Pick 3 distractors from the pool that are different from the current word
      const otherWords = pool
        .filter((w) => w.en !== word.en)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (currentMode === 'en_to_th') {
        const correctAnswer = word.th;
        const distractorOptions = otherWords.map((w) => w.th);
        const options = [correctAnswer, ...distractorOptions].sort(() => Math.random() - 0.5);

        return {
          id: `q-${word.en}-${index}`,
          mode: 'en_to_th',
          questionPrompt: word.en,
          subPrompt: `อ่านว่า: ${word.reading} (${word.pos})`,
          audioText: word.en,
          audioLang: 'en',
          correctAnswer,
          options,
          originalWord: word,
        };
      } else {
        // Thai to English
        const correctAnswer = word.en;
        const distractorOptions = otherWords.map((w) => w.en);
        const options = [correctAnswer, ...distractorOptions].sort(() => Math.random() - 0.5);

        return {
          id: `q-${word.en}-${index}`,
          mode: 'th_to_en',
          questionPrompt: word.th,
          subPrompt: `คำอ่านภาษาไทย: "${word.reading}" (${word.pos})`,
          audioText: word.en,
          audioLang: 'en',
          correctAnswer,
          options,
          originalWord: word,
        };
      }
    });
  }
}

export const vocabPoolService = new VocabPoolService();
