import React from 'react';
import { VocabularyWord } from '../types';
import { SpeakerIcon, CheckCircleIcon, CheckCircleIconSolid } from './icons';

interface FlashcardProps {
  wordData: VocabularyWord;
  isLearned: boolean;
  onToggleLearned: (word: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ wordData, isLearned, onToggleLearned }) => {
  const handlePlaySound = (e: React.MouseEvent, textToSpeak: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any other speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support text-to-speech.");
    }
  };

  const handleToggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLearned(wordData.word);
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${isLearned ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}>
      <button
        onClick={handleToggleLearned}
        className={`absolute top-2 right-2 p-1 rounded-full transition-colors duration-200 z-10 ${isLearned ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
        aria-label={isLearned ? 'Mark as not learned' : 'Mark as learned'}
      >
        {isLearned ? <CheckCircleIconSolid className="h-7 w-7" /> : <CheckCircleIcon className="h-7 w-7" />}
      </button>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{wordData.word}</h3>
            <button
              onClick={(e) => handlePlaySound(e, wordData.word.split('(')[0].trim())}
              className="ml-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500"
              aria-label={`Pronounce ${wordData.word}`}
            >
                <SpeakerIcon className="h-6 w-6" />
            </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mt-2">{wordData.definition}</p>

        <div className="flex items-start text-gray-500 dark:text-gray-400 mt-2">
          <p className="italic text-sm flex-grow">"{wordData.example}"</p>
          <button
            onClick={(e) => handlePlaySound(e, wordData.example)}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500 flex-shrink-0"
            aria-label={`Pronounce example sentence`}
          >
            <SpeakerIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;