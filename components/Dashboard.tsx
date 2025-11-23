
import React from 'react';
import { Category, VocabularyWord, DailyGoal, DailyProgress } from '../types';
import UserStats from './UserStats';
import { 
  LiteratureIcon, ScienceIcon, TravelIcon, WorkIcon, 
  EmotionsIcon, FoodIcon, ConversationIcon, TimeIcon, ArtIcon, FinanceIcon 
} from './icons';

interface DashboardProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
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
  categories,
  onSelectCategory, 
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

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Literature': return <LiteratureIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Science': return <ScienceIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Travel': return <TravelIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Work': return <WorkIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Emotions': return <EmotionsIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Food': return <FoodIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Conversation': return <ConversationIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Time': return <TimeIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Art': return <ArtIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      case 'Finance': return <FinanceIcon className="w-10 h-10 sm:w-12 sm:h-12" />;
      default: return <span className="text-3xl">{name[0]}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 animate-fade-in-up">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Learn & Explore</h2>
      </div>
      
      <div className="mb-8 animate-fade-in-up">
        <UserStats 
          userName={userName}
          userPoints={userPoints}
          goal={dailyGoal} 
          progress={dailyProgress} 
        />
      </div>

      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 animate-fade-in-up">Categories</h3>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up">
        {categories.map((category, index) => {
          const { learnedCount, totalCount } = getCategoryProgress(category.name);
          const progress = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;
          const delay = Math.min(index * 50, 500);

          return (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category)}
              style={{ animationDelay: `${delay}ms` }}
              className={`stagger-appear relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 active:scale-95 border border-gray-100 dark:border-gray-700`}
            >
              <div className="mb-2 drop-shadow-sm transform transition-transform group-hover:scale-110">
                {getCategoryIcon(category.name)}
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight text-gray-800 dark:text-gray-200">{category.name}</span>
              
              {/* Progress Indicator (Subtle) */}
              {totalCount > 0 && progress > 0 && (
                <div className="absolute bottom-2 w-8 h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
                   <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
