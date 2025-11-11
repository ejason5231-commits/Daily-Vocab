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

export interface QuizResult {
  date: string; // ISO string
  title: string;
  score: number;
  totalQuestions: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface LeaderboardEntry {
  name: string;
  points: number;
  isUser?: boolean;
}
