export interface Category {
  name: string;
  emoji: string;
  color: string;
  textColor: string;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
}

export interface DailyGoal {
  type: 'words' | 'quizzes';
  value: number;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  wordsLearnedCount: number;
  quizzesCompletedCount: number;
}
