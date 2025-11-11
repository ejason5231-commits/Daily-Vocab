import React from 'react';
import { QuizIcon } from './icons';

interface QuizProgressProps {
  title: string;
  learnedCount: number;
  totalCount: number;
  onStartQuiz: () => void;
  quizButtonText: string;
  disabled?: boolean;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  title,
  learnedCount,
  totalCount,
  onStartQuiz,
  quizButtonText,
  disabled = false
}) => {
  const progress = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">{title}</h3>
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span>Progress</span>
        <span className="font-semibold">{learnedCount} / {totalCount} Words</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <button
        onClick={onStartQuiz}
        disabled={disabled}
        className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
      >
        <QuizIcon className="h-5 w-5" />
        <span>{quizButtonText}</span>
      </button>
    </div>
  );
};

export default QuizProgress;
