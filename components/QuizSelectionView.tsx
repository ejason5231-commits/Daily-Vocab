
import React from 'react';
import { Category } from '../types';
import QuizProgress from './QuizProgress';

interface QuizSelectionViewProps {
  categories: Category[];
  onSelectCategoryForQuiz: (category: Category) => void;
  onStartMasterQuiz: () => void;
  masteredCount: number;
  totalWordsCount: number;
}

const QuizSelectionView: React.FC<QuizSelectionViewProps> = ({ 
  categories,
  onSelectCategoryForQuiz, 
  onStartMasterQuiz, 
  masteredCount, 
  totalWordsCount 
}) => {
  return (
    <div className="p-4 sm:p-6 pb-24">
      <div className="text-center mb-8 animate-fade-in-up">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2">Quiz Arena</h2>
        <p className="text-gray-600 dark:text-gray-300">Test your knowledge and earn badges!</p>
      </div>

      <div className="max-w-md mx-auto mb-10 animate-scale-in">
        <QuizProgress
          title="Master Challenge"
          learnedCount={masteredCount}
          totalCount={totalWordsCount}
          onStartQuiz={onStartMasterQuiz}
          quizButtonText="Start Master Quiz"
        />
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in-up">Category Challenges</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in-up">
        {categories.map((category, index) => {
          const delay = Math.min(index * 50, 500);
          return (
            <button
              key={category.name}
              onClick={() => onSelectCategoryForQuiz(category)}
              style={{ animationDelay: `${delay}ms` }}
              className={`stagger-appear relative flex flex-col items-center justify-center p-4 rounded-2xl shadow-md transform hover:scale-105 transition-all duration-300 active:scale-95 border-b-4 hover:shadow-xl ${category.color} ${category.textColor} border-black/10`}
            >
              <div className="text-3xl mb-2 drop-shadow-sm">{category.emoji}</div>
              <span className="font-bold text-sm text-center leading-tight">{category.name}</span>
              <div className="absolute top-2 right-2 bg-white/30 rounded-full p-1">
                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizSelectionView;
