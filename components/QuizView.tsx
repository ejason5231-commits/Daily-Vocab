import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyWord } from '../types';
import { RefreshIcon } from './icons';

interface QuizViewProps {
  words: VocabularyWord[];
  onQuizComplete: (correctlyAnsweredWords: string[]) => void;
  onQuizExit: () => void;
  title: string;
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

const QuizView: React.FC<QuizViewProps> = ({ words, onQuizComplete, onQuizExit, title }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctlyAnsweredInSession, setCorrectlyAnsweredInSession] = useState<Set<string>>(new Set());

  const generateQuestions = useMemo(() => {
    return (wordsToQuiz: VocabularyWord[]): Question[] => {
      const shuffled = [...wordsToQuiz].sort(() => 0.5 - Math.random());
      return shuffled.map(correctWord => {
        const decoys = wordsToQuiz
          .filter(w => w.word !== correctWord.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const options = [correctWord, ...decoys].map(w => w.word).sort(() => 0.5 - Math.random());
        return {
          questionText: correctWord.definition,
          options,
          correctAnswer: correctWord.word,
        };
      });
    };
  }, []);

  useEffect(() => {
    if (words.length >= 4) {
      setQuestions(generateQuestions(words));
    }
  }, [words, generateQuestions]);

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    setUserAnswer(answer);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
      setCorrectlyAnsweredInSession(prev => new Set(prev).add(questions[currentQuestionIndex].correctAnswer));
    }
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer(null);
      setCurrentQuestionIndex(prev => prev + 1);
    }, 1500);
  };
  
  const handleRestart = () => {
    setQuestions(generateQuestions(words));
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer(null);
    setShowFeedback(false);
    setCorrectlyAnsweredInSession(new Set());
  }

  if (words.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Not Enough Words for a Quiz</h2>
        <p className="text-gray-600 dark:text-gray-400">Please learn at least 4 words to start a quiz.</p>
        <button
          onClick={onQuizExit}
          className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (currentQuestionIndex >= questions.length && questions.length > 0) {
    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Quiz Complete!</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Your score: <span className="font-bold text-primary-500">{score}</span> / <span className="font-bold">{questions.length}</span>
        </p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Percentage Score: {percentage.toFixed(0)}%
        </p>
        <div className="w-full max-w-sm bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
          <div 
            className="bg-green-500 h-4 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleRestart}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
          >
            <RefreshIcon className="w-5 h-5"/>
            <span>Try Again</span>
          </button>
          <button
            onClick={() => onQuizComplete(Array.from(correctlyAnsweredInSession))}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
      return (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      );
  }
  
  const getButtonClass = (option: string) => {
    if (!showFeedback) {
        return 'bg-white dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-gray-700';
    }
    if (option === currentQuestion.correctAnswer) {
        return 'bg-green-500 text-white';
    }
    if (option === userAnswer) {
        return 'bg-red-500 text-white';
    }
    return 'bg-white dark:bg-gray-800 opacity-50';
  }

  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
          <div className="text-right text-gray-600 dark:text-gray-400 font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">What word means:</p>
            <p className="text-xl text-center text-gray-800 dark:text-white font-medium">"{currentQuestion.questionText}"</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
                <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={`p-4 rounded-lg shadow-sm text-lg font-semibold transition-all duration-300 text-gray-800 dark:text-white ${getButtonClass(option)}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
  );
};

export default QuizView;