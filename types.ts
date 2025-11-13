
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

export interface Tier {
  name: string;
  emoji: string;
  minPoints: number;
  rangeText: string;
}

// FIX: Add missing QuizResult interface for HistoryView component
export interface QuizResult {
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
}