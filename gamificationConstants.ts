
import { Badge, LeaderboardEntry, Tier } from './types';

export const POINTS = {
  LEARN_WORD: 1,
  COMPLETE_QUIZ: 50,
  PERFECT_QUIZ_BONUS: 100,
  GENERATE_CATEGORY: 75,
  // FIX: Add missing point constants for word puzzle game.
  FIND_WORD: 2,
  COMPLETE_PUZZLE_BONUS: 150,
};

export const BADGES: Badge[] = [
  { id: 'learner_1', name: 'Word Novice', description: 'Learn 10 new words.', emoji: '🌱' },
  { id: 'learner_2', name: 'Word Apprentice', description: 'Learn 50 new words.', emoji: '🧑‍🎓' },
  { id: 'learner_3', name: 'Word Scholar', description: 'Learn 200 new words.', emoji: '👑' },
  { id: 'mastery_1', name: 'Mastery Beginner', description: 'Master 25 words in the Master Quiz.', emoji: '🌟' },
  { id: 'ai_pioneer', name: 'AI Pioneer', description: 'Generate a new category with AI.', emoji: '🤖' },
];

export const FAKE_LEADERBOARD_USERS: Omit<LeaderboardEntry, 'isUser'>[] = [
  { name: 'Alex', points: 850 },
  { name: 'Ben', points: 720 },
  { name: 'Chloe', points: 610 },
  { name: 'David', points: 540 },
  { name: 'Eva', points: 430 },
  { name: 'Frank', points: 310 },
  { name: 'Grace', points: 200 },
  { name: 'Henry', points: 90 },
];

export const TIERS: Tier[] = [
  { name: 'Bronze', emoji: '🥉', minPoints: 0, rangeText: '(1-1000)' },
  { name: 'Silver', emoji: '🥈', minPoints: 1000, rangeText: '(1,000-2000)' },
  { name: 'Gold', emoji: '🥇', minPoints: 2000, rangeText: '(2000-4000)' },
  { name: 'Platinum', emoji: '💎', minPoints: 4000, rangeText: '(4000-6000)' },
  { name: 'Diamond', emoji: '🔷', minPoints: 6000, rangeText: '(6000-10000)' },
];
