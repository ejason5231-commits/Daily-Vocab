import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { VocabularyWord } from '../types';
import { RefreshIcon, LockIcon } from './icons';

interface QuizCompletionResult {
  correctlyAnsweredWords: string[];
  score: number;
  totalQuestions: number;
}

interface QuizViewProps {
  words: VocabularyWord[];
  onQuizComplete: (result: QuizCompletionResult) => void;
  onQuizExit: () => void;
  title: string;
  categoryName: string;
  unlockedLevel: number;
  onUnlockLevel: (category: string, level: number) => void;
  startAtLevel?: number | null;
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  originalWord: VocabularyWord;
}

const QuizView: React.FC<QuizViewProps> = ({ words, onQuizComplete, onQuizExit, title, categoryName, unlockedLevel, onUnlockLevel, startAtLevel }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [quizState, setQuizState] = useState<'level_select' | 'in_progress' | 'remediation' | 'complete'>('level_select');
  
  // Words for the next remediation round
  const [wordsForRemediation, setWordsForRemediation] = useState<VocabularyWord[]>([]);
  // Ref to track mistakes in the current round to avoid state latency issues.
  const currentRoundMistakesRef = useRef<VocabularyWord[]>([]);

  const [correctlyAnsweredInSession, setCorrectlyAnsweredInSession] = useState<Set<string>>(new Set());

  const generateQuestions = useCallback((wordsToQuiz: VocabularyWord[]): Question[] => {
    return wordsToQuiz.map(correctWord => {
      const decoys = words
        .filter(w => w.word !== correctWord.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const options = [correctWord, ...decoys].map(w => w.word.split(' (')[0]).sort(() => 0.5 - Math.random());
      return {
        questionText: correctWord.definition,
        options,
        correctAnswer: correctWord.word.split(' (')[0],
        originalWord: correctWord,
      };
    });
  }, [words]);

  const wordsPerLevel = 20;
  const totalLevels = useMemo(() => Math.ceil(words.length / wordsPerLevel), [words]);
  
  const [currentLevel, setCurrentLevel] = useState(startAtLevel || 1);
  
  const levelWords = useMemo(() => {
    const startIndex = (currentLevel - 1) * wordsPerLevel;
    const endIndex = startIndex + wordsPerLevel;
    return words.slice(startIndex, endIndex);
  }, [currentLevel, words]);

  useEffect(() => {
    if (quizState === 'in_progress') {
        setQuestions(generateQuestions(levelWords));
    } else if (quizState === 'remediation') {
        setQuestions(generateQuestions(wordsForRemediation));
    }

    // Reset mistakes for the new round and reset UI state.
    currentRoundMistakesRef.current = [];
    setCurrentQuestionIndex(0);
    setUserAnswer(null);
    setShowFeedback(false);
  }, [quizState, levelWords, wordsForRemediation, generateQuestions]);
  
  useEffect(() => {
    if (startAtLevel) {
      handleLevelSelect(startAtLevel);
    }
  }, [startAtLevel]);


  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    setUserAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    const currentOriginalWord = questions[currentQuestionIndex].originalWord;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCorrectlyAnsweredInSession(prev => new Set(prev).add(questions[currentQuestionIndex].correctAnswer));
    } else {
        currentRoundMistakesRef.current.push(currentOriginalWord);
    }

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setUserAnswer(null);
        setShowFeedback(false);
      } else {
        // End of the current round.
        if (currentRoundMistakesRef.current.length > 0) {
            // Mistakes were made, start or continue remediation with the mistaken words.
            setWordsForRemediation(currentRoundMistakesRef.current);
            setQuizState('remediation');
        } else {
            // Perfect round, level passed!
            onUnlockLevel(categoryName, currentLevel + 1);
            setQuizState('level_select');
        }
      }
    }, 1500);
  };
  
  const handleLevelSelect = (level: number) => {
    setCurrentLevel(level);
    setQuizState('in_progress');
    setScore(0);
    setCorrectlyAnsweredInSession(new Set());
  };
  
  const handleRestartQuiz = () => {
      setQuizState('level_select');
      setScore(0);
      setCorrectlyAnsweredInSession(new Set());
  }

  if (words.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Not Enough Words for a Quiz</h2>
        <p className="text-gray-600 dark:text-gray-400">Please learn at least 4 words in this category to start a quiz.</p>
        <button onClick={onQuizExit} className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600 transition-colors">Back to Words</button>
      </div>
    );
  }
  
  if (quizState === 'level_select') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full text-center p-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">This quiz has {words.length} questions, divided into {totalLevels} level{totalLevels !== 1 ? 's' : ''}.</p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">You must answer all 20 questions correctly to unlock the next level.</p>
        {totalLevels > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: totalLevels }, (_, i) => i + 1).map(level => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level)}
                disabled={level > unlockedLevel}
                className={`flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition-all transform hover:scale-105 ${
                  level > unlockedLevel 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-500 text-white'
                }`}
              >
                Level {level}
                {level > unlockedLevel && <LockIcon className="ml-2 h-5 w-5" />}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Generating quiz levels...</p>
        )}
        <button onClick={onQuizExit} className="mt-12 text-sm text-gray-500 dark:text-gray-400 hover:underline">Back to Category</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
      </div>
    );
  }
  
  const getButtonClass = (option: string) => {
    if (!showFeedback) return 'bg-white dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-gray-700';
    if (option === currentQuestion.correctAnswer) return 'bg-green-500 text-white';
    if (option === userAnswer) return 'bg-red-500 text-white';
    return 'bg-white dark:bg-gray-800 opacity-50';
  }

  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold text-gray-700 dark:text-white">
          {quizState === 'remediation' ? `Reviewing Level ${currentLevel}` : `Level ${currentLevel}`}
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
        <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 min-h-[120px] flex flex-col justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">What word means:</p>
        <p className="text-xl text-center text-gray-800 dark:text-white font-medium">"{currentQuestion.questionText}"</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={showFeedback}
            className={`p-4 rounded-lg shadow-sm text-lg font-semibold transition-all duration-300 text-gray-800 dark:text-white disabled:cursor-not-allowed ${getButtonClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
       {quizState === 'remediation' && (
        <p className="text-center mt-4 text-yellow-600 dark:text-yellow-400 font-semibold">Let's try the ones you missed again!</p>
      )}
    </div>
  );
};

export default QuizView;