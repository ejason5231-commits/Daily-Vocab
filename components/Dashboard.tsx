import React from 'react';
import { Category, VocabularyWord, DailyGoal, DailyProgress } from '../types';
import { CATEGORIES } from '../constants';
import UserStats from './UserStats';
import QuizProgress from './QuizProgress';

interface DashboardProps {
  onSelectCategory: (category: Category) => void;
  onStartQuiz: () => void;
  wordCache: Record<string, VocabularyWord[]>;
  learnedWords: Set<string>;
  masteredWords: Set<string>;
  totalWords: number;
  dailyGoal: DailyGoal;
  dailyProgress: DailyProgress;
  userName: string;
  userPoints: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onSelectCategory, 
  onStartQuiz, 
  wordCache, 
  learnedWords, 
  masteredWords, 
  totalWords,
  dailyGoal,
  dailyProgress,
  userName,
  userPoints,
}) => {
  const getCategoryProgress = (categoryName: string) => {
    const wordsInCategory = wordCache[categoryName] || [];
    if (wordsInCategory.length === 0) {
      return { learnedCount: 0, totalCount: 0 };
    }
    const learnedCount = wordsInCategory.filter(word => learnedWords.has(word.word)).length;
    return { learnedCount, totalCount: wordsInCategory.length };
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Choose a Category</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UserStats 
          userName={userName}
          userPoints={userPoints}
          goal={dailyGoal} 
          progress={dailyProgress} 
        />
        <QuizProgress
          title="Overall Mastery"
          learnedCount={masteredWords.size}
          totalCount={totalWords}
          onStartQuiz={onStartQuiz}
          quizButtonText="Master Quiz (All Words)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((category) => {
          const { learnedCount, totalCount } = getCategoryProgress(category.name);
          const progress = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

          return (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 overflow-hidden ${category.color} ${category.textColor}`}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full mb-2">
                <span className="text-xl">{category.emoji}</span>
              </div>
              <span className="font-semibold text-base text-center mb-1">{category.name}</span>
              {totalCount > 0 && (
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2.5">
                  <div className="bg-green-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              )}
               {totalCount > 0 && (
                 <span className="text-xs font-medium mt-1">{learnedCount} / {totalCount} learned</span>
               )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
