
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryView from './components/CategoryView';
import QuizView from './components/QuizView';
import AiCreateView from './components/AiCreateView';
import LeaderboardView from './components/LeaderboardView';
import BadgeNotification from './components/BadgeNotification';
import LevelUpNotification from './components/LevelUpNotification';
import BottomNavigation from './components/BottomNavigation';
import LoginModal from './components/LoginModal'; // Added Import
import { Category, VocabularyWord, DailyGoal, DailyProgress, Badge } from './types';
import { CATEGORIES, VOCABULARY_DATA } from './constants';
import { getVocabularyForCategory } from './services/geminiService';
import { useSwipeBack } from './hooks/useSwipeBack';
import { BADGES, POINTS } from './gamificationConstants';

interface QuizCompletionResult {
  correctlyAnsweredWords: string[];
  score: number;
  totalQuestions: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'category' | 'quiz' | 'ai_create' | 'leaderboard' | 'quiz_journey'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'ai'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Login Modal State

  // Settings & User State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
    }
    return 'light';
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [userName, setUserName] = useState("Learner");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login State

  // Data State
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [wordCache, setWordCache] = useState<Record<string, VocabularyWord[]>>(VOCABULARY_DATA);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => {
    const stored = window.localStorage.getItem('learnedWords');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [masteredWords, setMasteredWords] = useState<Set<string>>(() => {
    const stored = window.localStorage.getItem('masteredWords');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  
  // Category-specific unlocked levels
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>(() => {
      const stored = window.localStorage.getItem('unlockedLevels');
      return stored ? JSON.parse(stored) : {};
  });

  // Global Journey unlocked level
  const [globalUnlockedLevel, setGlobalUnlockedLevel] = useState<number>(() => {
      const stored = window.localStorage.getItem('globalUnlockedLevel');
      return stored ? parseInt(stored, 10) : 1;
  });

  // Gamification State
  const [userPoints, setUserPoints] = useState<number>(() => {
      const stored = window.localStorage.getItem('userPoints');
      return stored ? parseInt(stored, 10) : 0;
  });
  
  const [userCoins, setUserCoins] = useState<number>(() => {
      const stored = window.localStorage.getItem('userCoins');
      return stored ? parseInt(stored, 10) : 0;
  });

  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
      const stored = window.localStorage.getItem('earnedBadges');
      return stored ? JSON.parse(stored) : [];
  });
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => {
    const stored = window.localStorage.getItem('dailyGoal');
    return stored ? JSON.parse(stored) : { type: 'words', value: 40 };
  });
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const stored = window.localStorage.getItem('dailyProgress');
    const today = getTodayString();
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    }
    return { date: today, wordsLearnedCount: 0, quizzesCompletedCount: 0 };
  });

  // Notification Queues
  const [badgeNotification, setBadgeNotification] = useState<Badge | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<{level: number, categoryName: string} | null>(null);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Quiz State for Category Drill-down
  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [quizStartLevel, setQuizStartLevel] = useState<number | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('');
  
  // Global Journey Words (Flattened)
  const allJourneyWords = useMemo(() => {
    return (Object.values(wordCache) as VocabularyWord[][]).reduce((acc, val) => acc.concat(val), [] as VocabularyWord[]);
  }, [wordCache]);

  // --- Effects ---

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('learnedWords', JSON.stringify(Array.from(learnedWords)));
  }, [learnedWords]);
  
  useEffect(() => {
    localStorage.setItem('masteredWords', JSON.stringify(Array.from(masteredWords)));
  }, [masteredWords]);

  useEffect(() => {
    localStorage.setItem('userPoints', userPoints.toString());
  }, [userPoints]);

  useEffect(() => {
    localStorage.setItem('userCoins', userCoins.toString());
  }, [userCoins]);

  useEffect(() => {
    localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  useEffect(() => {
    localStorage.setItem('globalUnlockedLevel', globalUnlockedLevel.toString());
  }, [globalUnlockedLevel]);

  useEffect(() => {
    localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  useEffect(() => {
    localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  // --- Handlers ---

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    // In a real app, you would fetch user data here
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("Learner");
    setIsSidebarOpen(false);
  };

  const handleToggleLearned = (word: string) => {
    const isAlreadyLearned = learnedWords.has(word);
    
    if (isAlreadyLearned) {
      setLearnedWords(prev => {
        const next = new Set(prev);
        next.delete(word);
        return next;
      });
    } else {
      setLearnedWords(prev => {
        const next = new Set(prev);
        next.add(word);
        return next;
      });
      // Side effects performed outside the state setter to ensure reliability
      updateDailyProgress('words');
      // REWARD: Learning words gives COINS
      addCoins(POINTS.LEARN_WORD); 
    }
  };

  const updateDailyProgress = (type: 'words' | 'quizzes') => {
    setDailyProgress(prev => {
      const today = getTodayString();
      if (prev.date !== today) {
        return {
          date: today,
          wordsLearnedCount: type === 'words' ? 1 : 0,
          quizzesCompletedCount: type === 'quizzes' ? 1 : 0
        };
      }
      return {
        ...prev,
        wordsLearnedCount: type === 'words' ? prev.wordsLearnedCount + 1 : prev.wordsLearnedCount,
        quizzesCompletedCount: type === 'quizzes' ? prev.quizzesCompletedCount + 1 : prev.quizzesCompletedCount
      };
    });
  };

  const addPoints = (points: number) => {
    setUserPoints(prev => {
        const newPoints = prev + points;
        checkBadges(newPoints, learnedCountMemo, masteredCountMemo);
        return newPoints;
    });
  };

  const addCoins = (amount: number) => {
    setUserCoins(prev => prev + amount);
  };
  
  // Memoize counts to avoid recalculating in addPoints
  const learnedCountMemo = useMemo(() => learnedWords.size, [learnedWords]);
  const masteredCountMemo = useMemo(() => masteredWords.size, [masteredWords]);

  const checkBadges = (points: number, learnedCount: number, masteredCount: number) => {
    const newBadges: string[] = [];
    BADGES.forEach(badge => {
      if (earnedBadges.includes(badge.id)) return;

      let earned = false;
      if (badge.id === 'learner_1' && learnedCount >= 10) earned = true;
      if (badge.id === 'learner_2' && learnedCount >= 50) earned = true;
      if (badge.id === 'learner_3' && learnedCount >= 200) earned = true;
      if (badge.id === 'mastery_1' && masteredCount >= 25) earned = true;
      
      if (earned) {
        newBadges.push(badge.id);
        setBadgeNotification(badge);
      }
    });

    if (newBadges.length > 0) {
      setEarnedBadges(prev => [...prev, ...newBadges]);
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('category');
    // We remain in the home tab
  };

  const handleStartQuiz = (words: VocabularyWord[], title: string, startLevel: number = 1) => {
    setQuizWords(words);
    setQuizTitle(title);
    setQuizStartLevel(startLevel);
    setCurrentView('quiz');
  };

  const handleUnlockLevel = (categoryName: string, level: number) => {
      setUnlockedLevels(prev => {
          const current = prev[categoryName] || 1;
          if (level > current) {
              setLevelUpNotification({ level, categoryName });
              return { ...prev, [categoryName]: level };
          }
          return prev;
      });
  };

  const handleGlobalLevelUnlock = (categoryName: string, level: number) => {
      if (level > globalUnlockedLevel) {
          setLevelUpNotification({ level, categoryName: "Vocab Journey" });
          setGlobalUnlockedLevel(level);
      }
  };

  const handleCorrectAnswer = () => {
    // REWARD: Quizzes give XP
    addPoints(1); 
  };

  const handleQuizComplete = (result: QuizCompletionResult) => {
    updateDailyProgress('quizzes');
    // REWARD: Quizzes give XP bonuses
    addPoints(POINTS.COMPLETE_QUIZ);

    if (result.score === result.totalQuestions && result.totalQuestions > 0) {
      addPoints(POINTS.PERFECT_QUIZ_BONUS);
    }
    
    setMasteredWords(prev => {
      const next = new Set(prev);
      result.correctlyAnsweredWords.forEach(word => next.add(word));
      return next;
    });
  };

  const handleLevelUpDismiss = () => {
    setLevelUpNotification(null);
  };

  const handleAiGenerate = async (topic: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const newWords = await getVocabularyForCategory(topic);
      
      setWordCache(prev => ({
        ...prev,
        [topic]: newWords
      }));

      let category = categories.find(c => c.name.toLowerCase() === topic.toLowerCase());
      if (!category) {
        category = {
            name: topic,
            emoji: '✨',
            color: 'bg-teal-500',
            textColor: 'text-white'
        };
        setCategories(prev => [...prev, category!]);
      }
      
      setSelectedCategory(category);
      setCurrentView('category');
      setActiveTab('home');
      // REWARD: Creating Content can still give XP or Coins. Kept as XP for now.
      addPoints(POINTS.GENERATE_CATEGORY);

    } catch (error) {
      setGenerationError("Failed to generate words. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
      setIsQuizActive(false); // Reset quiz active state
      
      if (currentView === 'quiz') {
          // Return to category view
          if (selectedCategory) {
            setCurrentView('category');
          } else {
            setCurrentView('dashboard');
          }
      } else if (currentView === 'category') {
          setCurrentView('dashboard');
      } else if (currentView === 'leaderboard') {
          setCurrentView('dashboard');
      }
  };

  const handleTabChange = (tab: 'home' | 'quiz' | 'ai') => {
      setActiveTab(tab);
      setIsQuizActive(false); // Reset quiz active state

      if (tab === 'home') {
          setCurrentView('dashboard');
          setSelectedCategory(null);
      } else if (tab === 'quiz') {
          setCurrentView('quiz_journey');
          setSelectedCategory(null);
      } else if (tab === 'ai') {
          setCurrentView('ai_create');
          setSelectedCategory(null);
      }
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd, swipeStyles } = useSwipeBack({
    onSwipeBack: handleBack,
    enabled: (currentView === 'category' || currentView === 'quiz' || currentView === 'leaderboard')
  });

  // Show header only on non-quiz tabs and not in active quiz view
  const showHeader = activeTab !== 'quiz' && currentView !== 'quiz';

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 transition-colors duration-300 font-sans overflow-x-hidden">
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {/* Sidebar - Fixed Overlay */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        notificationsEnabled={notificationsEnabled}
        onNotificationsToggle={() => setNotificationsEnabled(!notificationsEnabled)}
        microphoneEnabled={microphoneEnabled}
        onMicrophoneToggle={() => {
            if (!microphoneEnabled) {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                    setMicrophoneEnabled(true);
                }).catch(() => {
                    alert("Could not access microphone.");
                });
            } else {
                setMicrophoneEnabled(false);
            }
        }}
        dailyGoal={dailyGoal}
        onGoalChange={setDailyGoal}
        onShowDashboard={() => {
            setCurrentView('dashboard');
            setActiveTab('home');
            setIsSidebarOpen(false);
        }}
        onShowLeaderboard={() => {
            setCurrentView('leaderboard');
            setActiveTab('home');
            setIsSidebarOpen(false);
        }}
        userQuizScore={userPoints}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />

      {/* Global Header - Fixed Top (Outside swipe container) */}
      {showHeader && (
        <Header 
          showBackButton={currentView !== 'dashboard' && currentView !== 'ai_create'}
          onBack={handleBack}
          onMenu={() => setIsLoginModalOpen(true)} // Profile icon opens Login Modal directly
          title={selectedCategory ? selectedCategory.name : (currentView === 'leaderboard' ? 'Leaderboard' : 'Daily Vocab')}
          showAiBar={currentView === 'dashboard'}
          userName={userName}
          onAiGenerate={handleAiGenerate}
        />
      )}

      {/* Main Content Wrapper - Handles Swipe Transform */}
      <div 
        className="w-full min-h-screen flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={swipeStyles}
      >
        <main 
            className={`container mx-auto max-w-5xl flex-grow ${activeTab === 'quiz' || isQuizActive ? '' : 'pb-24'}`}
            style={{
            paddingTop: showHeader ? 'calc(4rem + env(safe-area-inset-top))' : undefined
            }}
        >
            {currentView === 'dashboard' && (
            <Dashboard 
                categories={categories}
                onSelectCategory={handleSelectCategory}
                wordCache={wordCache}
                learnedWords={learnedWords}
                masteredWords={masteredWords}
                totalWords={(Object.values(wordCache) as VocabularyWord[][]).reduce((acc, words) => acc + words.length, 0)}
                dailyGoal={dailyGoal}
                dailyProgress={dailyProgress}
                userName={userName}
                userPoints={userPoints}
            />
            )}

            {currentView === 'category' && selectedCategory && (
            <CategoryView 
                category={selectedCategory}
                words={wordCache[selectedCategory.name] || []}
                learnedWords={learnedWords}
                onToggleLearned={handleToggleLearned}
                onStartQuiz={(words) => handleStartQuiz(words, selectedCategory.name, unlockedLevels[selectedCategory.name] || 1)}
                microphoneEnabled={microphoneEnabled}
            />
            )}

            {currentView === 'quiz' && (
            <QuizView 
                words={quizWords} 
                onQuizComplete={handleQuizComplete} 
                onQuizExit={handleBack}
                title={quizTitle}
                categoryName={selectedCategory?.name || 'Quiz'}
                unlockedLevel={selectedCategory ? (unlockedLevels[selectedCategory.name] || 1) : 1}
                onUnlockLevel={handleUnlockLevel}
                startAtLevel={quizStartLevel}
                onQuizStatusChange={setIsQuizActive}
                userPoints={userPoints}
                userCoins={userCoins}
                onCorrectAnswer={handleCorrectAnswer}
            />
            )}

            {currentView === 'quiz_journey' && (
            <QuizView
                words={allJourneyWords}
                onQuizComplete={handleQuizComplete}
                onQuizExit={() => {}} // No-op, sidebar only opens via menu button
                title="Vocab Journey"
                categoryName="Vocab Journey"
                unlockedLevel={globalUnlockedLevel}
                onUnlockLevel={handleGlobalLevelUnlock}
                onQuizStatusChange={setIsQuizActive}
                userPoints={userPoints}
                userCoins={userCoins}
                onCorrectAnswer={handleCorrectAnswer}
                // No startAtLevel prop, let it resume from unlock level
            />
            )}

            {currentView === 'ai_create' && (
                <AiCreateView 
                    onGenerateCategory={handleAiGenerate}
                    isGenerating={isGenerating}
                    generationError={generationError}
                />
            )}

            {currentView === 'leaderboard' && (
            <LeaderboardView userName={userName} userPoints={userPoints} />
            )}
        </main>
      </div>

      {/* Bottom Navigation - Fixed Bottom (Outside transformed container to prevent moving) */}
      {!isQuizActive && (
        <BottomNavigation 
          currentTab={activeTab} 
          onTabChange={handleTabChange} 
          onOpenSettings={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Notifications - Fixed Overlays */}
      <BadgeNotification 
        badge={badgeNotification} 
        onDismiss={() => setBadgeNotification(null)} 
      />

      <LevelUpNotification 
        notification={levelUpNotification}
        onDismiss={handleLevelUpDismiss}
      />
    </div>
  );
};

export default App;
