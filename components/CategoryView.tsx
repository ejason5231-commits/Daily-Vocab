import React, { useMemo } from 'react';
import { Category, VocabularyWord } from '../types';
import Flashcard from './Flashcard';
import QuizProgress from './QuizProgress';
import NativeAdCard from './NativeAdCard';

interface CategoryViewProps {
  category: Category;
  words: VocabularyWord[];
  learnedWords: Set<string>;
  onToggleLearned: (word: string) => void;
  onStartQuiz: (words: VocabularyWord[]) => void;
  microphoneEnabled: boolean;
}

const CategoryView: React.FC<CategoryViewProps> = ({ category, words, learnedWords, onToggleLearned, onStartQuiz, microphoneEnabled }) => {
  const learnedCount = useMemo(() => {
    if (!words || words.length === 0) return 0;
    return words.filter(word => learnedWords.has(word.word)).length;
  }, [words, learnedWords]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-fade-in-up">
        <div className="flex items-center space-x-3">
          <span className={`text-3xl ${category.color} rounded-md p-2 ${category.textColor}`}>{category.emoji}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{category.name}</h2>
        </div>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-10 animate-fade-in-up">
            <p className="text-gray-600 dark:text-gray-400">Words for this category are coming soon!</p>
        </div>
      ) : (
        <>
          <div className="mb-6 max-w-md mx-auto w-full animate-fade-in-up">
            <QuizProgress
              title="Category Learning Progress"
              learnedCount={learnedCount}
              totalCount={words.length}
              onStartQuiz={() => onStartQuiz(words)}
              quizButtonText="Quiz This Category"
              disabled={words.length < 4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {words.map((word, index) => {
              const delay = Math.min(index * 50, 500); // Cap delay at 500ms for large lists
              // Insert an Ad card every 6th card (index 5, 11, etc.)
              const showAd = (index + 1) % 6 === 0;

              return (
                <React.Fragment key={word.word}>
                  <div className="stagger-appear h-full" style={{ animationDelay: `${delay}ms` }}>
                    <Flashcard 
                      wordData={word} 
                      isLearned={learnedWords.has(word.word)}
                      onToggleLearned={onToggleLearned}
                      microphoneEnabled={microphoneEnabled}
                    />
                  </div>
                  {showAd && (
                     <div className="stagger-appear h-full" style={{ animationDelay: `${delay + 25}ms` }}>
                       <NativeAdCard />
                     </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryView;