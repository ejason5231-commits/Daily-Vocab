
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { VocabularyWord } from '../types';
import { 
    LockIcon, CloudIcon, StarIcon, OwlIcon, BackIcon, SaveIcon, 
    CoinIcon, MountainIcon, TreeIcon, CastleIcon, PlayIcon,
    RuinsIcon, RiverIcon, GrassIcon, MapLocationIcon, 
    LiteratureIcon, ScienceIcon, TravelIcon, WorkIcon, 
    EmotionsIcon, FoodIcon, SocialIcon, TimeIcon, ArtIcon, FinanceIcon
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
  userPoints?: number;
  userCoins?: number;
  onCorrectAnswer?: () => void;
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  originalWord: VocabularyWord;
}

const BUTTON_COLORS = [
    { bg: 'bg-red-500', border: 'border-red-400', bottom: 'border-b-red-700' },
    { bg: 'bg-orange-500', border: 'border-orange-400', bottom: 'border-b-orange-700' },
    { bg: 'bg-amber-400', border: 'border-amber-300', bottom: 'border-b-amber-600' },
    { bg: 'bg-green-500', border: 'border-green-400', bottom: 'border-b-green-700' },
    { bg: 'bg-teal-500', border: 'border-teal-400', bottom: 'border-b-teal-700' },
    { bg: 'bg-cyan-500', border: 'border-cyan-400', bottom: 'border-b-cyan-700' },
    { bg: 'bg-blue-500', border: 'border-blue-400', bottom: 'border-b-blue-700' },
    { bg: 'bg-indigo-500', border: 'border-indigo-400', bottom: 'border-b-indigo-700' },
    { bg: 'bg-purple-500', border: 'border-purple-400', bottom: 'border-b-purple-700' },
    { bg: 'bg-fuchsia-500', border: 'border-fuchsia-400', bottom: 'border-b-fuchsia-700' },
    { bg: 'bg-pink-500', border: 'border-pink-400', bottom: 'border-b-pink-700' },
    { bg: 'bg-rose-500', border: 'border-rose-400', bottom: 'border-b-rose-700' },
];

const HandDrawnMapBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Parchment Base */}
        <div className="absolute inset-0 bg-[#f4e4bc] dark:bg-gray-900 transition-colors duration-300"></div>
        
        {/* Paper Texture Noise */}
        <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply dark:mix-blend-overlay">
            <filter id="paperNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#paperNoise)" />
        </svg>

        {/* Topographic Lines (Contour Lines) */}
        <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-20">
            <defs>
                <pattern id="topoLines" x="0" y="0" width="600" height="600" patternUnits="userSpaceOnUse">
                     <path d="M0,150 Q150,50 300,150 T600,150" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#8d6e63] dark:text-gray-600"/>
                     <path d="M-50,300 Q200,400 450,300 T850,350" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#8d6e63] dark:text-gray-600"/>
                     <path d="M0,450 Q150,550 300,450 T600,500" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#8d6e63] dark:text-gray-600"/>
                     
                     {/* Elevation Circles */}
                     <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#8d6e63] dark:text-gray-600" strokeDasharray="8,4"/>
                     <circle cx="150" cy="150" r="70" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#8d6e63] dark:text-gray-600" />
                     
                     <circle cx="450" cy="400" r="120" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#8d6e63] dark:text-gray-600" strokeDasharray="12,6"/>
                     <circle cx="450" cy="400" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#8d6e63] dark:text-gray-600" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topoLines)" />
        </svg>

        {/* Compass Rose Hint (Subtle) */}
        <div className="absolute top-20 right-10 opacity-10 pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="#5d4037" />
            </svg>
        </div>
    </div>
);

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
  userPoints = 0,
  userCoins = 0,
  onCorrectAnswer
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
         const nodeSpacing = 140; 
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
      // Trigger live update of XP
      if (onCorrectAnswer) onCorrectAnswer();
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
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans transition-colors duration-300">
      <HandDrawnMapBackground />
      
      {/* Background Decorations (Optional extra flair) */}
      <div className="absolute top-10 left-[-50px] opacity-60 animate-pulse pointer-events-none"><CloudIcon className="w-32 h-20 text-white/40" /></div>
      <div className="absolute top-20 right-[-20px] opacity-50 animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}><CloudIcon className="w-24 h-16 text-white/30" /></div>
      
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
        const xOffset = Math.sin(levelIndex * 1.2) * 35; 
        const x = 50 + xOffset; 
        return { x, y, level: levelIndex + 1 };
    });

    // SVG Path Construction
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
        const type = (i * 7) % 11; 
        const side = i % 2 === 0 ? 'left' : 'right';
        const xPos = side === 'left' ? Math.max(8, p.x - 35) : Math.min(92, p.x + 35);
        return { type, x: xPos, y: p.y, id: i };
    });

    return (
        <div className="relative w-full h-screen overflow-hidden font-serif transition-colors duration-300">
            <HandDrawnMapBackground />

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
                        <span className="font-bold text-sm">{userCoins}</span>
                    </div>
                    <div className="flex items-center bg-[#5d4037] text-[#4fc3f7] px-3 py-1.5 rounded-xl border-2 border-[#8d6e63] shadow-sm">
                        <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 text-[#29b6f6]" />
                        <span className="font-bold text-sm">XP {userPoints}</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Map Area */}
            <div 
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto relative no-scrollbar"
                style={{ paddingTop: '80px' }} 
            >
                <div style={{ height: mapHeight }} className="w-full relative">
                    
                    {/* Map Zones / Islands / Terrain Underlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                         <svg width="100%" height="100%" preserveAspectRatio="none">
                            <ellipse cx="20%" cy="15%" rx="60%" ry="10%" fill="#dcfce7" />
                            <ellipse cx="80%" cy="40%" rx="50%" ry="15%" fill="#fef9c3" />
                            <ellipse cx="30%" cy="70%" rx="60%" ry="12%" fill="#e0f2fe" />
                         </svg>
                    </div>

                    {/* River Decoration */}
                    <div className="absolute top-[30%] w-full h-20 opacity-60 pointer-events-none">
                        <RiverIcon className="w-full h-full text-blue-300" />
                    </div>

                    {/* Path Line */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none filter drop-shadow-sm">
                        {/* Outer path */}
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#8d6e63" 
                            strokeWidth="24" 
                            strokeLinecap="round"
                            className="opacity-40"
                        />
                        {/* Inner dotted path */}
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#fff8e1"
                            strokeWidth="18" 
                            strokeLinecap="round"
                            strokeDasharray="5 5"
                        />
                    </svg>

                    {/* Decorations - 3D Landmarks */}
                    {decorations.map(d => (
                        <div 
                            key={d.id} 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform hover:scale-110"
                            style={{ left: `${d.x}%`, top: `${d.y}px`, zIndex: 5 }}
                        >
                            {d.type === 0 && <LiteratureIcon className="w-16 h-16 drop-shadow-lg" />}
                            {d.type === 1 && <TreeIcon className="w-16 h-16 text-[#4ade80] drop-shadow-md" />}
                            {d.type === 2 && <MountainIcon className="w-20 h-16 text-[#94a3b8] drop-shadow-md" />}
                            {d.type === 3 && <ScienceIcon className="w-16 h-16 drop-shadow-lg" />}
                            {d.type === 4 && <CastleIcon className="w-16 h-16 text-[#64748b] drop-shadow-xl" />}
                            {d.type === 5 && <TravelIcon className="w-16 h-16 drop-shadow-lg" />}
                            {d.type === 6 && <RuinsIcon className="w-16 h-16 text-[#a8a29e] drop-shadow-md" />}
                            {d.type === 7 && <FoodIcon className="w-16 h-16 drop-shadow-lg" />}
                            {d.type === 8 && <TimeIcon className="w-16 h-16 drop-shadow-lg" />}
                            {d.type === 9 && <ArtIcon className="w-16 h-16 drop-shadow-lg" />}
                            {d.type === 10 && <CloudIcon className="w-16 h-10 text-white opacity-80" />}
                        </div>
                    ))}

                    {/* Nodes */}
                    {points.map((p) => {
                        const isLocked = p.level > unlockedLevel;
                        const isCurrent = p.level === unlockedLevel;
                        const isCompleted = p.level < unlockedLevel;

                        // Colorful Buttons Logic
                        const colorIndex = (p.level - 1) % BUTTON_COLORS.length;
                        const colorTheme = BUTTON_COLORS[colorIndex];

                        // 3D Oval Button Style
                        const baseClasses = "relative w-20 h-14 rounded-[40%] flex items-center justify-center shadow-xl transform transition-all duration-200 border-x-2 border-t-2 border-b-[6px] active:border-b-2 active:translate-y-[4px]";
                        
                        const colorClasses = isLocked
                            ? 'bg-gray-200 border-gray-300 border-b-gray-400 cursor-not-allowed text-gray-400'
                            : isCompleted
                                ? `${colorTheme.bg} ${colorTheme.border} ${colorTheme.bottom} hover:scale-105 text-white/90`
                                : `${colorTheme.bg} ${colorTheme.border} ${colorTheme.bottom} hover:scale-105 text-white`;

                        return (
                            <div 
                                key={p.level}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group"
                                style={{ left: `${p.x}%`, top: `${p.y}px` }}
                            >
                                <button
                                    onClick={() => !isLocked && handleLevelSelect(p.level)}
                                    className={`${baseClasses} ${colorClasses}`}
                                >
                                    {isLocked && <LockIcon className="w-6 h-6 text-gray-400" />}
                                    {isCompleted && <StarIcon className="w-8 h-8 text-white drop-shadow-md" />}
                                    {isCurrent && (
                                        <>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                                                <MapLocationIcon className="w-12 h-12 drop-shadow-lg" />
                                            </div>
                                            <span className="font-black text-white text-lg relative z-10 drop-shadow-md">{p.level}</span>
                                        </>
                                    )}
                                    {!isLocked && !isCompleted && !isCurrent && <span className="font-black drop-shadow-md text-xl">{p.level}</span>}
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
            <StarIcon className="h-5 w-5 mr-1 text-yellow-300" /> XP {userPoints}
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
