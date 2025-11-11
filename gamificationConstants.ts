import { Badge, LeaderboardEntry } from './types';

export const POINTS = {
  LEARN_WORD: 10,
  COMPLETE_QUIZ: 50,
  PERFECT_QUIZ_BONUS: 100,
  GENERATE_CATEGORY: 75,
  FIND_WORD: 5,
  COMPLETE_PUZZLE_BONUS: 150,
};

export const BADGES: Badge[] = [
  { id: 'learner_1', name: 'Word Novice', description: 'Learn 10 new words.', emoji: '🌱' },
  { id: 'learner_2', name: 'Word Apprentice', description: 'Learn 50 new words.', emoji: '🧑‍🎓' },
  { id: 'learner_3', name: 'Word Scholar', description: 'Learn 200 new words.', emoji: '👑' },
  { id: 'quiz_1', name: 'Quiz Taker', description: 'Complete 5 quizzes.', emoji: '📝' },
  { id: 'quiz_2', name: 'Quiz Master', description: 'Complete 20 quizzes.', emoji: '🏆' },
  { id: 'perfect_1', name: 'Perfect Score!', description: 'Get a 100% score on a quiz.', emoji: '🎯' },
  { id: 'mastery_1', name: 'Mastery Beginner', description: 'Master 25 words in the Master Quiz.', emoji: '🌟' },
  { id: 'ai_pioneer', name: 'AI Pioneer', description: 'Generate a new category with AI.', emoji: '🤖' },
];

export const FAKE_LEADERBOARD_USERS: Omit<LeaderboardEntry, 'isUser'>[] = [
  { name: 'Alex', points: 12500 },
  { name: 'Ben', points: 9800 },
  { name: 'Chloe', points: 7600 },
  { name: 'David', points: 5400 },
  { name: 'Eva', points: 3200 },
  { name: 'Frank', points: 1500 },
  { name: 'Grace', points: 800 },
  { name: 'Henry', points: 300 },
];