export * from './database';

export interface UserStats {
  wordsLearned: number;
  dayStreak: number;
  setsCreated: number;
}

export interface TranslationResponse {
  word_en: string;
  word_th: string;
  reading_th?: string; // คำอ่านภาษาไทย เช่น "แบท", "รีดดิ้ง"
  part_of_speech: 'noun' | 'verb' | 'adj' | 'adv' | 'other' | 'gerund' | 'past_participle';
  example_sentence_en: string;
  example_sentence_th: string;
}

export interface FlashcardRatingResult {
  entryId: string;
  rating: 'got_it' | 'almost' | 'missed';
}
