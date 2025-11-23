
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { VocabularyWord } from '../types';
import { 
    LockIcon, CloudIcon, StarIcon, OwlIcon, BackIcon, SaveIcon, 
    CoinIcon, MountainIcon, TreeIcon, CastleIcon, PlayIcon,
    RuinsIcon, RiverIcon, GrassIcon, MapLocationIcon
} from './icons';

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
  onQuizStatusChange?: (isActive: boolean) => void;
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  originalWord: VocabularyWord;
}

const QuizView: React.FC<QuizViewProps> = ({ 
  words, 
  onQuizComplete, 
  onQuizExit, 
  title, 
  categoryName, 
  unlockedLevel, 
  onUnlockLevel, 
  startAtLevel,
  onQuizStatusChange
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mascotMessage, setMascotMessage] = useState<string>("Good luck!");
  
  const [quizState, setQuizState] = useState<'level_select' | 'in_progress' | 'remediation' | 'complete'>('level_select');
  
  const [wordsForRemediation, setWordsForRemediation] = useState<VocabularyWord[]>([]);
  const currentRoundMistakesRef = useRef<VocabularyWord[]>([]);
  const [correctlyAnsweredInSession, setCorrectlyAnsweredInSession] = useState<Set<string>>(new Set());

  // Notify parent about quiz status (active/inactive)
  useEffect(() => {
    if (onQuizStatusChange) {
      const isActive = quizState === 'in_progress' || quizState === 'remediation';
      onQuizStatusChange(isActive);
    }
  }, [quizState, onQuizStatusChange]);

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

  // Scroll to current level on mount
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
      if (quizState === 'level_select' && scrollContainerRef.current) {
         const nodeSpacing = 140; // Increased spacing for better visual
         const topPadding = 180;
         
         // Calculate Y position of the unlocked level
         const levelY = topPadding + (unlockedLevel - 1) * nodeSpacing;
         const containerHeight = scrollContainerRef.current.clientHeight;
         const scrollTop = levelY - containerHeight / 2;
         
         scrollContainerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
  }, [quizState, unlockedLevel, totalLevels]);

  useEffect(() => {
    if (quizState === 'in_progress') {
        setQuestions(generateQuestions(levelWords));
        setMascotMessage("Let's do this!");
    } else if (quizState === 'remediation') {
        setQuestions(generateQuestions(wordsForRemediation));
        setMascotMessage("Let's try again!");
    }

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
      const messages = ["Awesome!", "Great job!", "You got it!", "Correct!", "Superb!"];
      setMascotMessage(messages[Math.floor(Math.random() * messages.length)]);
    } else {
        currentRoundMistakesRef.current.push(currentOriginalWord);
        setMascotMessage("Oops! Next time.");
    }

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setUserAnswer(null);
        setShowFeedback(false);
        setMascotMessage("What about this one?");
      } else {
        if (currentRoundMistakesRef.current.length > 0) {
            setWordsForRemediation(currentRoundMistakesRef.current);
            setQuizState('remediation');
        } else {
            onUnlockLevel(categoryName, currentLevel + 1);
            setQuizState('level_select');
            setMascotMessage("Level Complete!");
            onQuizComplete({
              correctlyAnsweredWords: Array.from(correctlyAnsweredInSession),
              score: score + (isCorrect ? 1 : 0),
              totalQuestions: questions.length
            });
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

  // --- Render Helpers ---

  const QuizContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-sky-200 via-purple-100 to-pink-100 dark:from-sky-900 dark:via-purple-900 dark:to-pink-900 px-4 pt-2 pb-4 font-sans transition-colors duration-300">
      {/* Background Decorations */}
      <div className="absolute top-10 left-[-50px] opacity-60 animate-pulse pointer-events-none"><CloudIcon className="w-32 h-20 text-white/50" /></div>
      <div className="absolute top-20 right-[-20px] opacity-50 animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}><CloudIcon className="w-24 h-16 text-white/40" /></div>
      <div className="absolute bottom-40 left-10 opacity-30 pointer-events-none"><StarIcon className="w-12 h-12 text-yellow-200" /></div>
      <div className="absolute bottom-20 right-10 opacity-30 pointer-events-none"><StarIcon className="w-8 h-8 text-pink-200" /></div>
      
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-2rem)] items-center pt-1 sm:pt-4 pb-12">
        {children}
      </div>
    </div>
  );

  const HeaderBanner = ({ text }: { text: string }) => (
    <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
      <div className="absolute inset-0 bg-yellow-400 rounded-xl transform rotate-[-2deg] shadow-lg translate-y-1"></div>
      <div className="relative bg-red-400 text-white px-8 py-3 rounded-xl shadow-xl border-b-4 border-red-600 transform rotate-[2deg]">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider drop-shadow-md text-center">{text}</h1>
      </div>
    </div>
  );

  const Mascot = ({ message }: { message: string }) => (
    <div className="self-start mt-4 flex items-end animate-bounce" style={{ animationDuration: '2s' }}>
      <OwlIcon className="w-20 h-20 sm:w-24 sm:h-24 text-gray-800 dark:text-gray-200 drop-shadow-xl" />
      <div className="mb-12 ml-[-10px] bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none shadow-lg border-2 border-gray-100 transform -rotate-2 max-w-[150px]">
        <p className="text-sm font-bold leading-tight">{message}</p>
      </div>
    </div>
  );

  // --- VIEW: Not Enough Words ---
  if (words.length < 4) {
    return (
      <QuizContainer>
        <HeaderBanner text="Oops!" />
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center border-4 border-white">
          <p className="text-xl text-gray-600 font-bold mb-6">We need more words to play!</p>
          <p className="text-gray-500 mb-8">Please learn at least 4 words in this category first.</p>
          <button onClick={onQuizExit} className="px-8 py-3 bg-green-400 hover:bg-green-500 text-white font-extrabold rounded-full shadow-lg transform transition hover:scale-105 border-b-4 border-green-600">
            Back to Words
          </button>
        </div>
        <Mascot message="Go learn some words!" />
      </QuizContainer>
    );
  }
  
  // --- VIEW: Hand-Drawn Cartoon Map (Level Select) ---
  if (quizState === 'level_select') {
    const nodeSpacing = 140;
    const bottomPadding = 250; 
    const topPadding = 180;
    const mapHeight = Math.max(window.innerHeight, totalLevels * nodeSpacing + bottomPadding + topPadding);

    // Generate path points
    const points = Array.from({ length: totalLevels }, (_, i) => {
        const levelIndex = i; 
        const y = topPadding + (levelIndex * nodeSpacing);
        // More curvy path
        const xOffset = Math.sin(levelIndex * 1.2) * 35; 
        const x = 50 + xOffset; 
        return { x, y, level: levelIndex + 1 };
    });

    // SVG Path
    let pathD = `M ${points[0].x}% ${points[0].y}px`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i+1];
        const cp1y = curr.y + nodeSpacing / 2;
        const cp2y = next.y - nodeSpacing / 2;
        pathD += ` C ${curr.x}% ${cp1y}px, ${next.x}% ${cp2y}px, ${next.x}% ${next.y}px`;
    }

    // Decor Elements
    const decorations = points.map((p, i) => {
        const type = (i * 7) % 5; // pseudo-random distribution
        const side = i % 2 === 0 ? 'left' : 'right';
        const xPos = side === 'left' ? Math.max(8, p.x - 35) : Math.min(92, p.x + 35);
        return { type, x: xPos, y: p.y, id: i };
    });

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#f4e4bc] dark:bg-gray-900 font-serif transition-colors duration-300">
            {/* SVG Parchment Texture Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>

            {/* Task Bar / Header */}
            <div className="absolute top-0 left-0 w-full z-50 bg-[#e6d2aa] dark:bg-gray-800 border-b-4 border-[#c2a67a] dark:border-gray-700 shadow-md flex items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 h-auto min-h-[80px] box-border pointer-events-auto">
                <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-[#5d4037] dark:text-[#d4b483] tracking-widest uppercase opacity-90" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                        Journey of
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5d4037] dark:text-[#d4b483] tracking-wider uppercase drop-shadow-sm leading-none" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                        Vocabulary
                    </h1>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-[#5d4037] text-[#ffd700] px-3 py-1.5 rounded-xl border-2 border-[#8d6e63] shadow-sm">
                        <CoinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />
                        <span className="font-bold text-sm">{score * 10}</span>
                    </div>
                    <div className="flex items-center bg-[#5d4037] text-[#4fc3f7] px-3 py-1.5 rounded-xl border-2 border-[#8d6e63] shadow-sm">
                        <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 text-[#29b6f6]" />
                        <span className="font-bold text-sm">XP {score * 5}</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Map Area */}
            <div 
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto relative no-scrollbar"
                style={{ paddingTop: '80px' }} // Push content below taskbar
            >
                <div style={{ height: mapHeight }} className="w-full relative">
                    
                    {/* Map Zones / Islands */}
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                         {/* We can place large colored blobs to represent terrain zones behind the path */}
                         <svg width="100%" height="100%" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grassPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M5 15 Q10 5 15 15" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.5"/>
                                </pattern>
                            </defs>
                            {/* Simple large blobs for terrain variation */}
                            <ellipse cx="20%" cy="15%" rx="60%" ry="10%" fill="#dcfce7" />
                            <ellipse cx="80%" cy="40%" rx="50%" ry="15%" fill="#fef9c3" />
                            <ellipse cx="30%" cy="70%" rx="60%" ry="12%" fill="#e0f2fe" />
                         </svg>
                    </div>

                    {/* River Decoration */}
                    <div className="absolute top-[30%] w-full h-20 opacity-60 pointer-events-none">
                        <RiverIcon className="w-full h-full text-blue-300" />
                    </div>

                    {/* Path Line - Hand Drawn Style */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none filter drop-shadow-sm">
                        {/* Outer border for the path */}
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#8d6e63" 
                            strokeWidth="24" 
                            strokeLinecap="round"
                            className="opacity-40"
                        />
                        {/* Inner path color */}
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#fff8e1"
                            strokeWidth="18" 
                            strokeLinecap="round"
                            strokeDasharray="5 5"
                        />
                    </svg>

                    {/* Decorations */}
                    {decorations.map(d => (
                        <div 
                            key={d.id} 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform hover:scale-110"
                            style={{ left: `${d.x}%`, top: `${d.y}px`, zIndex: 5 }}
                        >
                            {d.type === 0 && <TreeIcon className="w-16 h-16 text-[#4ade80] drop-shadow-md" />}
                            {d.type === 1 && <MountainIcon className="w-20 h-16 text-[#94a3b8] drop-shadow-md" />}
                            {d.type === 2 && <RuinsIcon className="w-16 h-16 text-[#a8a29e] drop-shadow-md" />}
                            {d.type === 3 && <GrassIcon className="w-10 h-10 text-[#22c55e]" />}
                            {d.type === 4 && <CloudIcon className="w-16 h-10 text-white opacity-80" />}
                            
                            {/* Castle at the end */}
                            {d.id === totalLevels - 1 && (
                                <div className="absolute top-[-40px]">
                                     <CastleIcon className="w-28 h-28 text-[#64748b] drop-shadow-xl" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Nodes */}
                    {points.map((p) => {
                        const isLocked = p.level > unlockedLevel;
                        const isCurrent = p.level === unlockedLevel;
                        const isCompleted = p.level < unlockedLevel;

                        // Hand-drawn circle style
                        const baseClasses = "relative w-14 h-14 rounded-full flex items-center justify-center border-[3px] shadow-lg transform transition-all duration-200";
                        
                        return (
                            <div 
                                key={p.level}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group"
                                style={{ left: `${p.x}%`, top: `${p.y}px` }}
                            >
                                <button
                                    onClick={() => !isLocked && handleLevelSelect(p.level)}
                                    className={`
                                        ${baseClasses}
                                        ${isLocked 
                                            ? 'bg-gray-200 border-gray-400 cursor-not-allowed' 
                                            : isCompleted 
                                                ? 'bg-[#fbbf24] border-[#d97706] hover:scale-110' 
                                                : 'bg-[#facc15] border-[#b45309] hover:scale-110 animate-bounce'
                                        }
                                    `}
                                    style={{ animationDuration: '2s' }} // Slower bounce
                                >
                                    {isLocked && <LockIcon className="w-6 h-6 text-gray-400" />}
                                    {isCompleted && <StarIcon className="w-8 h-8 text-white drop-shadow-md" />}
                                    {isCurrent && (
                                        <>
                                            <div className="absolute -top-11 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: '1s' }}>
                                                <MapLocationIcon className="w-12 h-12 drop-shadow-lg" />
                                            </div>
                                            <span className="font-black text-[#713f12] text-lg">{p.level}</span>
                                        </>
                                    )}
                                    {!isLocked && !isCompleted && !isCurrent && <span className="font-bold text-[#78350f]">{p.level}</span>}
                                </button>
                                
                                {/* Level Label */}
                                {(!isLocked || isCurrent) && (
                                    <div className="mt-1 bg-[#fff8e1] border border-[#d4b483] px-2 py-0.5 rounded text-[10px] font-bold text-[#78350f] shadow-sm">
                                        Lv {p.level}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  }

  // --- VIEW: Question (In Progress) ---
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
        <QuizContainer>
            <div className="flex items-center justify-center h-64">
                <p className="text-white font-bold text-2xl animate-pulse">Loading Quiz...</p>
            </div>
        </QuizContainer>
    );
  }

  // Button Colors for options
  const buttonColors = [
      { bg: 'bg-green-300 dark:bg-green-700', border: 'border-green-500 dark:border-green-600', text: 'text-green-900 dark:text-green-100', label: 'A' },
      { bg: 'bg-yellow-300 dark:bg-yellow-700', border: 'border-yellow-500 dark:border-yellow-600', text: 'text-yellow-900 dark:text-yellow-100', label: 'B' },
      { bg: 'bg-orange-300 dark:bg-orange-700', border: 'border-orange-500 dark:border-orange-600', text: 'text-orange-900 dark:text-orange-100', label: 'C' },
      { bg: 'bg-pink-300 dark:bg-pink-700', border: 'border-pink-500 dark:border-pink-600', text: 'text-pink-900 dark:text-pink-100', label: 'D' },
  ];

  const getButtonClass = (option: string, index: number) => {
    const base = buttonColors[index % 4];
    let styleClass = `${base.bg} ${base.border} ${base.text}`;

    if (showFeedback) {
        if (option === currentQuestion.correctAnswer) {
            styleClass = 'bg-green-500 border-green-700 text-white ring-4 ring-green-300 scale-105';
        } else if (option === userAnswer) {
            styleClass = 'bg-red-400 border-red-600 text-white opacity-80';
        } else {
            styleClass = 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50';
        }
    }

    return `relative p-4 rounded-2xl shadow-lg border-b-4 text-left font-bold text-lg sm:text-xl transition-all duration-200 transform hover:translate-y-[-2px] active:translate-y-[2px] active:border-b-0 disabled:cursor-not-allowed flex items-center ${styleClass}`;
  };

  return (
    <QuizContainer>
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-2 px-2 mt-2">
        <button onClick={() => setQuizState('level_select')} className="p-2 bg-white/30 rounded-full hover:bg-white/50 text-white transition">
            <BackIcon className="h-6 w-6" />
        </button>
        <div className="bg-white/30 px-4 py-1 rounded-full text-white font-bold backdrop-blur-sm">
            Level {currentLevel}
        </div>
        <div className="bg-white/30 px-4 py-1 rounded-full text-white font-bold backdrop-blur-sm flex items-center">
            <StarIcon className="h-5 w-5 mr-1 text-yellow-300" /> {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/30 h-3 rounded-full mb-4 overflow-hidden backdrop-blur-sm border-2 border-white/40">
        <div 
            className="h-full bg-gradient-to-r from-yellow-300 to-green-400 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_0_0_rgba(0,0,0,0.1)] border-4 border-white/60 p-4 sm:p-6 mb-4 text-center transform transition-all hover:scale-[1.01]">
         <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Find the word for</p>
         <p className="text-2xl sm:text-3xl text-gray-800 dark:text-white font-black leading-tight">"{currentQuestion.questionText}"</p>
      </div>

      {/* Answer Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={showFeedback}
            className={getButtonClass(option, index)}
          >
            <div className="bg-white/40 w-10 h-10 rounded-full flex items-center justify-center mr-3 font-black text-inherit opacity-80">
                {buttonColors[index % 4].label}
            </div>
            {option}
          </button>
        ))}
      </div>

      {/* Save Button */}
       <div className="w-full flex justify-center mb-2">
        <button
          onClick={() => alert("Progress saved!")}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-white/20 dark:hover:bg-white/40 border-2 border-indigo-800 dark:border-white text-white font-bold rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-105"
        >
          <SaveIcon className="h-6 w-6" />
          <span>Save Progress</span>
        </button>
      </div>

      {/* Remediation Notice */}
      {quizState === 'remediation' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <p className="text-4xl font-black text-red-500 drop-shadow-lg animate-pulse whitespace-nowrap">Let's Review!</p>
        </div>
      )}

      {/* Mascot Footer */}
      <div className="w-full flex justify-start mt-auto pb-4">
        <Mascot message={mascotMessage} />
      </div>

    </QuizContainer>
  );
};

export default QuizView;
