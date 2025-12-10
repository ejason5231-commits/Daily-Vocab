
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { showRewardInterstitial } from '../App';
import { VocabularyWord } from '../types';
import { ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon, XCircleIcon, CheckCircleIconSolid, VolumeUpIcon, SpeakerIcon } from './icons';
import { playAudio, playCorrectSound, playIncorrectSound, playLevelUpSound } from '../services/audioService';
import ProgressBar from './ProgressBar';
import QuizLevelSelector from './QuizLevelSelector';
import Confetti from './Confetti'; // Import Confetti component

interface QuizViewProps {
  words: VocabularyWord[];
  onQuizComplete: (result: { correctlyAnsweredWords: string[], score: number, totalQuestions: number }) => void;
  onQuizExit: () => void;
  title: string;
  categoryName: string;
  unlockedLevel: number;
  onUnlockLevel: (categoryName: string, level: number) => void;
  startAtLevel?: number | null;
  onQuizStatusChange: (isActive: boolean) => void;
  userPoints: number;
  userCoins: number;
  onCorrectAnswer: () => void;
  masteredWords: Set<string>;
  onSaveProgress: (answeredWords: string[]) => void;
}

const WORDS_PER_LEVEL = 10;

const QuizView: React.FC<QuizViewProps> = ({ 
  words, 
  onQuizComplete, 
  onQuizExit, 
  title, 
  categoryName, 
  unlockedLevel,
  onUnlockLevel,
  startAtLevel,
  onQuizStatusChange,
  userPoints,
  userCoins,
  onCorrectAnswer,
  masteredWords,
  onSaveProgress
}) => {
  const [currentLevel, setCurrentLevel] = useState(startAtLevel || 1);
  const [isPlayingLevel, setIsPlayingLevel] = useState(!!startAtLevel);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctlyAnsweredWords, setCorrectlyAnsweredWords] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Sound ref to prevent overlapping
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Notify parent component about quiz status
  useEffect(() => {
    onQuizStatusChange(true);
    return () => onQuizStatusChange(false);
  }, [onQuizStatusChange]);

  const levelWords = useMemo(() => {
    const startIndex = (currentLevel - 1) * WORDS_PER_LEVEL;
    return words.slice(startIndex, startIndex + WORDS_PER_LEVEL);
  }, [words, currentLevel]);

  const totalLevels = Math.ceil(words.length / WORDS_PER_LEVEL);
  const currentWord = levelWords[currentQuestionIndex];

  // Prepare options when question changes
  useEffect(() => {
    if (currentWord && isPlayingLevel && !showResult) {
      const otherWords = words
        .filter(w => w.word !== currentWord.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      const options = [...otherWords.map(w => w.definition), currentWord.definition];
      setShuffledOptions(options.sort(() => 0.5 - Math.random()));
      
      // Auto-play pronunciation
      // playAudio(currentWord.word).catch(() => {});
    }
  }, [currentWord, words, isPlayingLevel, showResult]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption || animating) return;

    setSelectedOption(option);
    const correct = option === currentWord.definition;
    setIsCorrect(correct);
    setAnimating(true);

    if (correct) {
      setScore(prev => prev + 1);
      setCorrectlyAnsweredWords(prev => [...prev, currentWord.word]);
      setFeedbackMessage("Correct! 🎉");
      playCorrectSound();
      onCorrectAnswer(); // Award points immediately
    } else {
      setFeedbackMessage(`Incorrect. The answer is "${currentWord.definition}"`);
      playIncorrectSound();
    }

    // Wait for animation and feedback
    setTimeout(() => {
      setAnimating(false);
      setFeedbackMessage(null);
      setSelectedOption(null);
      setIsCorrect(null);

      if (currentQuestionIndex < levelWords.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleLevelComplete();
      }
    }, 1500); // 1.5s delay for feedback
  };

  const handleLevelComplete = () => {
    setShowResult(true);
    
    // Save progress regardless of pass/fail
    onSaveProgress(correctlyAnsweredWords);

    const isPass = score >= Math.ceil(levelWords.length * 0.7); // 70% to pass
    
    if (isPass) {
       // Only trigger level up logic if we passed the current highest unlocked level
       if (currentLevel === unlockedLevel && currentLevel < totalLevels) {
         playLevelUpSound();
         setShowLevelUpAnimation(true);
         onUnlockLevel(categoryName, currentLevel + 1);
         
         // Trigger rewarded interstitial ad on level completion (every 2 levels or similar logic could apply)
         // For now, let's trigger it on every level up to monetize progress
         if (currentLevel % 1 === 0) { // Example: show on every level up
             showRewardInterstitial().catch(e => console.error(e));
         }
       } else {
         playCorrectSound();
       }
    }

    onQuizComplete({
      correctlyAnsweredWords,
      score,
      totalQuestions: levelWords.length
    });
  };

  const startLevel = (level: number) => {
    if (level > unlockedLevel) return;
    setCurrentLevel(level);
    setIsPlayingLevel(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectlyAnsweredWords([]);
    setShowResult(false);
    setShowLevelUpAnimation(false);
  };

  const nextLevel = () => {
    if (currentLevel < totalLevels) {
      startLevel(currentLevel + 1);
    } else {
      onQuizExit();
    }
  };

  const retryLevel = () => {
    startLevel(currentLevel);
  };

  const handleExitRequest = () => {
    if (isPlayingLevel && !showResult) {
      setShowExitConfirm(true);
    } else {
      onQuizExit();
    }
  };

  const confirmExit = () => {
      // Save whatever progress was made before exiting
      onSaveProgress(correctlyAnsweredWords);
      onQuizExit();
  };

  // If not playing a specific level, show the Level Selector
  if (!isPlayingLevel) {
    return (
      <QuizLevelSelector 
        totalLevels={totalLevels}
        unlockedLevel={unlockedLevel}
        onSelectLevel={startLevel}
        onBack={onQuizExit}
        title={title}
        categoryName={categoryName}
        userPoints={userPoints}
        userCoins={userCoins}
      />
    );
  }

  // Result Screen
  if (showResult) {
    const isPass = score >= Math.ceil(levelWords.length * 0.7);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in text-center relative overflow-hidden">
        {showLevelUpAnimation && <Confetti />}
        
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl transform transition-all duration-700 ${showLevelUpAnimation ? 'scale-110 bg-yellow-400 rotate-12' : (isPass ? 'bg-green-500' : 'bg-red-500')}`}>
           <span className="text-5xl">{isPass ? '🏆' : '💪'}</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {isPass ? 'Level Complete!' : 'Keep Practicing!'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xs mx-auto">
          {isPass 
            ? `You've mastered ${score} new words from Level ${currentLevel}.` 
            : `You got ${score} out of ${levelWords.length} correct. Try again to unlock the next level.`}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
            <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl text-center border border-blue-100 dark:border-gray-700">
                <span className="block text-2xl font-bold text-blue-600 dark:text-blue-400">{score}/{levelWords.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Score</span>
            </div>
            <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-xl text-center border border-purple-100 dark:border-gray-700">
                <span className="block text-2xl font-bold text-purple-600 dark:text-purple-400">+{score * 10}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">XP Earned</span>
            </div>
        </div>

        <div className="flex flex-col w-full max-w-xs gap-3">
          {isPass && currentLevel < totalLevels ? (
            <button 
              onClick={nextLevel}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Next Level</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          ) : null}

          <button 
            onClick={retryLevel}
            className={`w-full py-4 rounded-xl font-bold shadow-sm active:scale-95 transition-all border-2 ${
                isPass 
                ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700' 
                : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'
            }`}
          >
            {isPass ? 'Replay Level' : 'Try Again'}
          </button>
          
          <button 
            onClick={onQuizExit}
            className="mt-2 text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-200 py-2"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz Interface
  return (
    <div className="flex flex-col h-full max-h-screen relative bg-gray-50 dark:bg-gray-900">
      
      {/* Quiz Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 shadow-sm border-b border-gray-100 dark:border-gray-700 z-10 flex items-center justify-between sticky top-0">
         <div className="flex items-center gap-3">
             <button onClick={handleExitRequest} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                 <XCircleIcon className="w-6 h-6" />
             </button>
             <div>
                 <h2 className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{categoryName}</h2>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Level {currentLevel}</p>
             </div>
         </div>
         <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                 <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{currentQuestionIndex + 1} / {levelWords.length}</span>
             </div>
         </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-primary-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex) / levelWords.length) * 100}%` }}
          />
      </div>

      {/* Main Quiz Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 overflow-y-auto">
        
        {/* Question Card */}
        <div className="w-full max-w-md mb-8 perspective-1000">
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border-b-4 border-gray-200 dark:border-gray-700 transform transition-all duration-500 ${animating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    Translate this
                </span>
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-6 tracking-tight">
                    {currentWord?.word}
                </h1>
                
                <button 
                  onClick={() => playAudio(currentWord.word)}
                  className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:scale-110 transition-transform"
                >
                    <VolumeUpIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Options Grid */}
        <div className="w-full max-w-md grid gap-3">
            {shuffledOptions.map((option, idx) => {
                let statusClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700";
                
                if (selectedOption) {
                    if (option === currentWord.definition) {
                        statusClass = "bg-green-500 border-green-600 text-white shadow-md shadow-green-500/20"; // Correct answer (always shown)
                    } else if (option === selectedOption && option !== currentWord.definition) {
                        statusClass = "bg-red-500 border-red-600 text-white shadow-md shadow-red-500/20"; // Wrong selection
                    } else {
                        statusClass = "opacity-50 bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400"; // Other options
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!selectedOption}
                        className={`
                            relative w-full p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 transform active:scale-98 flex items-center justify-between
                            ${statusClass}
                        `}
                    >
                        <span className="text-left">{option}</span>
                        {selectedOption && option === currentWord.definition && (
                            <CheckCircleIconSolid className="w-6 h-6 text-white animate-bounce-short" />
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Feedback Overlay (Toast) */}
      <div className={`fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none transition-opacity duration-300 ${feedbackMessage ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transform translate-y-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {isCorrect ? <CheckCircleIconSolid className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
              {feedbackMessage}
          </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl transform scale-100 animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quit Quiz?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    You will lose your current streak for this level. Progress is saved up to the last correct answer.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmExit}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
                    >
                        Quit
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
