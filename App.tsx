
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryView from './components/CategoryView';
import QuizView from './components/QuizView';
import Flashcard from './components/Flashcard';
import AiCreateView from './components/AiCreateView';
import BannerAd from './components/BannerAd';
import { Category, VocabularyWord, DailyGoal, DailyProgress } from './types';
import { VOCABULARY_DATA } from './constants';
import { getVocabularyForCategory } from './services/geminiService';
import { showInterstitialAd, showRewardAd } from './services/adService';
import { SparklesIcon } from './components/icons';
import { useSwipeBack } from './hooks/useSwipeBack';


type View = 'dashboard' | 'category' | 'quiz' | 'ai_create';

interface QuizCompletionResult {
  correctlyAnsweredWords: string[];
  score: number;
  totalQuestions: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [previousView, setPreviousView] = useState<View>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('notificationsEnabled') === 'true';
    }
    return false;
  });

  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const savedWords = localStorage.getItem('learnedWords');
        return savedWords ? new Set(JSON.parse(savedWords)) : new Set();
    }
    return new Set();
  });

  const [masteredWords, setMasteredWords] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const savedWords = localStorage.getItem('masteredWords');
        return savedWords ? new Set(JSON.parse(savedWords)) : new Set();
    }
    return new Set();
  });

  const [quizCompletionCount, setQuizCompletionCount] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCount = localStorage.getItem('quizCompletionCount');
      return savedCount ? parseInt(savedCount, 10) : 0;
    }
    return 0;
  });
  
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => {
    const saved = localStorage.getItem('dailyGoal');
    return saved ? JSON.parse(saved) : { type: 'words', value: 10 };
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const saved = localStorage.getItem('dailyProgress');
    if (saved) {
        const progress: DailyProgress = JSON.parse(saved);
        if (progress.date !== getTodayString()) {
            return { date: getTodayString(), wordsLearnedCount: 0, quizzesCompletedCount: 0 };
        }
        return progress;
    }
    return { date: getTodayString(), wordsLearnedCount: 0, quizzesCompletedCount: 0 };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [wordCache, setWordCache] = useState<Record<string, VocabularyWord[]>>(VOCABULARY_DATA);
  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const newlyLearnedCount = useRef(0);
  const interstitialTriggerCount = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('learnedWords', JSON.stringify(Array.from(learnedWords)));
  }, [learnedWords]);

  useEffect(() => {
    localStorage.setItem('masteredWords', JSON.stringify(Array.from(masteredWords)));
  }, [masteredWords]);

  useEffect(() => {
    localStorage.setItem('quizCompletionCount', String(quizCompletionCount));
  }, [quizCompletionCount]);

  useEffect(() => {
    localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);
  
  useEffect(() => {
    const today = getTodayString();
    if (dailyProgress.date !== today) {
        setDailyProgress({ date: today, wordsLearnedCount: 0, quizzesCompletedCount: 0 });
    }
  }, []);

  const scheduleNotification = useCallback(async () => {
    if (notificationsEnabled && 'serviceWorker' in navigator && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const lastNotificationTime = localStorage.getItem('lastNotificationTime');
        const now = new Date().getTime();
        const oneDay = 23 * 60 * 60 * 1000;

        if (!lastNotificationTime || now - parseInt(lastNotificationTime, 10) > oneDay) {
          const registration = await navigator.serviceWorker.ready;
          registration.active?.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: {
              title: 'Time for your daily review! 🧠',
              options: {
                body: 'Let\'s learn some new words or take a quiz to keep your streak going!',
                icon: '/vite.svg',
                badge: '/vite.svg',
              }
            }
          });
          localStorage.setItem('lastNotificationTime', now.toString());
        }
      }
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            scheduleNotification();
          })
          .catch(err => console.log('ServiceWorker registration failed: ', err));
      });
    }
  }, [scheduleNotification]);

  const handleThemeToggle = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  
  const handleNotificationsToggle = async () => {
    if (!notificationsEnabled) {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                scheduleNotification();
            } else {
                console.log('Notification permission denied.');
                setNotificationsEnabled(false);
            }
        }
    } else {
        setNotificationsEnabled(false);
    }
  };

  const handleGoalChange = (newGoal: DailyGoal) => setDailyGoal(newGoal);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('category');
  };

  const handleBack = () => {
    interstitialTriggerCount.current += 1;
    if (interstitialTriggerCount.current >= 3) {
      showInterstitialAd();
      interstitialTriggerCount.current = 0;
    }
    setCurrentView(currentView === 'ai_create' ? previousView : 'dashboard');
    if (currentView !== 'ai_create') {
        setSelectedCategory(null);
        setSearchQuery('');
    }
  };

  const handleToggleLearned = useCallback((word: string) => {
    setLearnedWords(prev => {
        const newSet = new Set(prev);
        if (newSet.has(word)) {
            newSet.delete(word);
        } else {
            newSet.add(word);
            newlyLearnedCount.current += 1;
            
            setDailyProgress(currentProgress => {
              if (currentProgress.date !== getTodayString()) {
                  return { date: getTodayString(), wordsLearnedCount: 1, quizzesCompletedCount: 0 };
              }
              return { ...currentProgress, wordsLearnedCount: currentProgress.wordsLearnedCount + 1 };
            });

            if (newlyLearnedCount.current >= 20) {
                showRewardAd(() => console.log("User rewarded for learning 20 words!"));
                newlyLearnedCount.current = 0;
            }
        }
        return newSet;
    });
  }, []);

  const allWords = useMemo(() => Object.values(wordCache).flat(), [wordCache]);
  const coreWords = useMemo(() => Object.values(VOCABULARY_DATA).flat(), []);

  const handleStartQuiz = (wordsForQuiz?: VocabularyWord[]) => {
    const wordsToQuiz = wordsForQuiz || coreWords;
    setQuizWords(wordsToQuiz);
    setQuizTitle(wordsForQuiz ? (selectedCategory?.name || 'Category Quiz') : 'Master Quiz (All Words)');
    setCurrentView('quiz');
  };
  
  const handleQuizComplete = (result: QuizCompletionResult) => {
    const { correctlyAnsweredWords, score, totalQuestions } = result;

    if (totalQuestions > 0 && score === totalQuestions) {
        setDailyProgress(currentProgress => {
            if (currentProgress.date !== getTodayString()) {
               return { date: getTodayString(), wordsLearnedCount: 0, quizzesCompletedCount: 1 };
           }
           return { ...currentProgress, quizzesCompletedCount: currentProgress.quizzesCompletedCount + 1 };
        });

        const newCount = quizCompletionCount + 1;
        setQuizCompletionCount(newCount);

        if (newCount >= 20) {
          showRewardAd(() => console.log("User rewarded for completing 20 perfect quizzes!"));
          setQuizCompletionCount(0);
        }
    }
    
    if (quizTitle === 'Master Quiz (All Words)') {
      setMasteredWords(prevMastered => {
        const newMasteredSet = new Set(prevMastered);
        correctlyAnsweredWords.forEach(word => newMasteredSet.add(word));
        return newMasteredSet;
      });
    }
    setCurrentView('dashboard');
    setQuizWords([]);
  };

  const handleQuizExit = () => {
    setCurrentView('dashboard');
    setQuizWords([]);
  };

  const filteredWords = useMemo(() => {
    if (!searchQuery) return [];
    const lowercasedQuery = searchQuery.toLowerCase();
    return allWords.filter(
      (word) =>
        word.word.toLowerCase().includes(lowercasedQuery) ||
        word.definition.toLowerCase().includes(lowercasedQuery) ||
        word.example.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, allWords]);

  const handleGenerateCategory = async (topic: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const generatedWords = await getVocabularyForCategory(topic);
      const newCategory: Category = { name: topic, emoji: '✨', color: 'bg-teal-500', textColor: 'text-white' };
      setWordCache(prevCache => ({ ...prevCache, [topic]: generatedWords }));
      handleSelectCategory(newCategory);
    } catch (error) {
      setGenerationError((error as Error).message || 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigateToAiCreate = () => {
    if (!searchQuery) {
        setPreviousView(currentView);
        setCurrentView('ai_create');
    }
  };

  const isBackButtonVisible = (currentView === 'category' || currentView === 'quiz' || currentView === 'ai_create') && !searchQuery;

  const onSwipeBack = useCallback(() => {
    if (currentView === 'quiz') {
      handleQuizExit();
    } else {
      handleBack();
    }
  }, [currentView]);

  const { handleTouchStart, handleTouchMove, handleTouchEnd, swipeStyles } = useSwipeBack({
    onSwipeBack,
    enabled: isBackButtonVisible,
  });


  const renderContent = () => {
    if (searchQuery) {
      return (
        <div className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Search Results for "{searchQuery}"</h2>
            {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredWords.map(word => (<Flashcard key={word.word} wordData={word} isLearned={learnedWords.has(word.word)} onToggleLearned={handleToggleLearned} />))}
                </div>
            ) : (<p className="text-gray-600 dark:text-gray-400">No words found.</p>)}
        </div>
      );
    }
    switch (currentView) {
      case 'ai_create':
        return <AiCreateView onGenerateCategory={handleGenerateCategory} isGenerating={isGenerating} generationError={generationError} />
      case 'quiz':
        return <QuizView words={quizWords} onQuizComplete={handleQuizComplete} onQuizExit={handleQuizExit} title={quizTitle} />;
      case 'category':
        return selectedCategory && (<CategoryView category={selectedCategory} words={wordCache[selectedCategory.name] || []} learnedWords={learnedWords} onToggleLearned={handleToggleLearned} onStartQuiz={handleStartQuiz} />);
      case 'dashboard':
      default:
        return <Dashboard onSelectCategory={handleSelectCategory} onStartQuiz={() => handleStartQuiz()} wordCache={wordCache} learnedWords={learnedWords} masteredWords={masteredWords} totalWords={coreWords.length} dailyGoal={dailyGoal} dailyProgress={dailyProgress} />;
    }
  };
  
  const getTitle = () => {
    if (searchQuery) return "Search";
    if (currentView === 'ai_create') return "Create with AI";
    if (currentView === 'quiz') return "Quiz Time!";
    if (currentView === 'category' && selectedCategory) return selectedCategory.name;
    return "Essential Words";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        notificationsEnabled={notificationsEnabled}
        onNotificationsToggle={handleNotificationsToggle}
        dailyGoal={dailyGoal}
        onGoalChange={handleGoalChange}
      />
      <div className="flex flex-col h-screen">
        <Header
          showBackButton={isBackButtonVisible}
          onBack={currentView === 'quiz' ? handleQuizExit : handleBack}
          onMenu={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          title={getTitle()}
        />
        <main
          className="flex-1 overflow-y-auto"
          style={swipeStyles}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {renderContent()}
        </main>
        <BannerAd />
      </div>
      {!searchQuery && (
        <button
          onClick={handleNavigateToAiCreate}
          className="fixed bottom-20 right-6 bg-gradient-to-br from-teal-400 to-primary-600 text-white px-5 py-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-30 focus:outline-none focus:ring-4 focus:ring-teal-300 flex items-center space-x-2"
          aria-label="Create with AI"
        >
          <SparklesIcon className="h-6 w-6" />
          <span className="font-semibold text-lg">AI</span>
        </button>
      )}
    </div>
  );
};

export default App;