import React from 'react';
import { Category, VocabularyWord } from '../types';
import Flashcard from './Flashcard';
import { QuizIcon } from './icons';

interface CategoryViewProps {
  category: Category;
  words: VocabularyWord[];
  learnedWords: Set<string>;
  onToggleLearned: (word: string) => void;
  onStartQuiz: (words: VocabularyWord[]) => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, words, learnedWords, onToggleLearned, onStartQuiz }) => {

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <span className={`text-3xl ${category.color} rounded-md p-2 ${category.textColor}`}>{category.emoji}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{category.name}</h2>
        </div>
        <button
          onClick={() => onStartQuiz(words)}
          disabled={words.length < 4}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
        >
          <QuizIcon className="h-5 w-5" />
          <span>Quiz This Category</span>
        </button>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">Words for this category are coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {words.map((word) => (
            <Flashcard 
              key={word.word} 
              wordData={word} 
              isLearned={learnedWords.has(word.word)}
              onToggleLearned={onToggleLearned}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryView;