import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryView from './components/CategoryView';
import QuizView from './components/QuizView';
import Flashcard from './components/Flashcard';
import AiCreateView from './components/AiCreateView';
import BannerAd from './components/BannerAd';
import HistoryView from './components/HistoryView';
import ProfileView from './components/ProfileView';
import LeaderboardView from './components/LeaderboardView';
import BadgeNotification from './components/BadgeNotification';
import WordPuzzleView from './components/WordPuzzleView'; // Import the new component
import { Category, VocabularyWord, DailyGoal, DailyProgress, QuizResult, Badge } from './types';
import { VOCABULARY_DATA } from './constants';
import { getVocabularyForCategory } from './services/geminiService';
import { showInterstitialAd, showRewardAd, showRewardedInterstitialAd } from './services/adService';
import { SparklesIcon } from './components/icons';
import { useSwipeBack } from './hooks/useSwipeBack';
import { BADGES, POINTS } from './gamificationConstants';

type View = 'dashboard' | 'category' | 'quiz' | 'ai_create' | 'history' | 'profile' | 'leaderboard' | 'word_puzzle';

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
      const saved = localStorage.getItem('notificationsEnabled');
      return saved !== 'false';
    }
    return true;
  });

  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('learnedWords') || '[]')));
  const [masteredWords, setMasteredWords] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('masteredWords') || '[]')));
  const [quizCompletionCount, setQuizCompletionCount] = useState<number>(() => parseInt(localStorage.getItem('quizCompletionCount') || '0', 10));
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => JSON.parse(localStorage.getItem('quizHistory') || '[]'));
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => JSON.parse(localStorage.getItem('dailyGoal') || '{"type":"words","value":10}'));
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

  // Gamification State
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'Learner');
  const [userPoints, setUserPoints] = useState<number>(() => parseInt(localStorage.getItem('userPoints') || '0', 10));
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('earnedBadges') || '[]')));
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const [hasGeneratedAiCategory, setHasGeneratedAiCategory] = useState<boolean>(() => localStorage.getItem('hasGeneratedAiCategory') === 'true');

  const [searchQuery, setSearchQuery] = useState('');
  const [wordCache, setWordCache] = useState<Record<string, VocabularyWord[]>>(VOCABULARY_DATA);
  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const newlyLearnedCount = useRef(0);
  const interstitialTriggerCount = useRef(0);

  // Effect hooks for persistence
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('notificationsEnabled', String(notificationsEnabled)); }, [notificationsEnabled]);
  useEffect(() => { localStorage.setItem('learnedWords', JSON.stringify(Array.from(learnedWords))); }, [learnedWords]);
  useEffect(() => { localStorage.setItem('masteredWords', JSON.stringify(Array.from(masteredWords))); }, [masteredWords]);
  useEffect(() => { localStorage.setItem('quizCompletionCount', String(quizCompletionCount)); }, [quizCompletionCount]);
  useEffect(() => { localStorage.setItem('quizHistory', JSON.stringify(quizHistory)); }, [quizHistory]);
  useEffect(() => { localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal)); }, [dailyGoal]);
  useEffect(() => { localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress)); }, [dailyProgress]);
  useEffect(() => { localStorage.setItem('userName', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('userPoints', String(userPoints)); }, [userPoints]);
  useEffect(() => { localStorage.setItem('earnedBadges', JSON.stringify(Array.from(earnedBadges))); }, [earnedBadges]);
  useEffect(() => { localStorage.setItem('hasGeneratedAiCategory', String(hasGeneratedAiCategory)); }, [hasGeneratedAiCategory]);
  
  // Reset daily progress if the day changes
  useEffect(() => { if (dailyProgress.date !== getTodayString()) setDailyProgress({ date: getTodayString(), wordsLearnedCount: 0, quizzesCompletedCount: 0 }); }, []);

  // Gamification Logic
  const addPoints = useCallback((points: number) => setUserPoints(prev => prev + points), []);

  const unlockBadge = useCallback((badgeId: string) => {
    if (!earnedBadges.has(badgeId)) {
        const badge = BADGES.find(b => b.id === badgeId);
        if (badge) {
            setEarnedBadges(prev => new Set(prev).add(badgeId));
            setNewlyUnlockedBadge(badge);
        }
    }
  }, [earnedBadges]);

  const checkAndAwardBadges = useCallback(() => {
    if (learnedWords.size >= 10) unlockBadge('learner_1');
    if (learnedWords.size >= 50) unlockBadge('learner_2');
    if (learnedWords.size >= 200) unlockBadge('learner_3');
    if (quizHistory.length >= 5) unlockBadge('quiz_1');
    if (quizHistory.length >= 20) unlockBadge('quiz_2');
    const hasPerfect = quizHistory.some(q => q.score === q.totalQuestions && q.totalQuestions > 0);
    if (hasPerfect) unlockBadge('perfect_1');
    if (masteredWords.size >= 25) unlockBadge('mastery_1');
    if (hasGeneratedAiCategory) unlockBadge('ai_pioneer');
  }, [learnedWords.size, quizHistory, masteredWords.size, hasGeneratedAiCategory, unlockBadge]);

  useEffect(() => {
    checkAndAwardBadges();
  }, [checkAndAwardBadges]);
  
  // Notification Scheduling
  const scheduleNotification = useCallback(async () => { /* ... existing code ... */ }, [notificationsEnabled]);
  useEffect(() => { /* ... existing service worker code ... */ }, [scheduleNotification]);
  
  // Handlers
  const handleThemeToggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleNotificationsToggle = async () => { /* ... existing code ... */ };
  const handleGoalChange = (newGoal: DailyGoal) => setDailyGoal(newGoal);
  const handleSelectCategory = (category: Category) => { setSelectedCategory(category); setCurrentView('category'); };

  const handleBack = () => {
    interstitialTriggerCount.current += 1;
    if (interstitialTriggerCount.current >= 3) {
      showInterstitialAd();
      interstitialTriggerCount.current = 0;
    }
    setCurrentView('dashboard');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleToggleLearned = useCallback((word: string) => {
    setLearnedWords(prev => {
        const newSet = new Set(prev);
        if (newSet.has(word)) {
            newSet.delete(word);
        } else {
            newSet.add(word);
            addPoints(POINTS.LEARN_WORD);
            newlyLearnedCount.current += 1;
            setDailyProgress(p => ({ ...p, wordsLearnedCount: p.wordsLearnedCount + 1 }));
            if (newlyLearnedCount.current >= 20) {
                showRewardAd(() => {});
                newlyLearnedCount.current = 0;
            }
        }
        return newSet;
    });
  }, [addPoints]);

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
    setQuizHistory(prev => [{ date: new Date().toISOString(), title: quizTitle, score, totalQuestions }, ...prev]);

    addPoints(POINTS.COMPLETE_QUIZ);
    if (totalQuestions > 0 && score === totalQuestions) {
        addPoints(POINTS.PERFECT_QUIZ_BONUS);
        setDailyProgress(p => ({ ...p, quizzesCompletedCount: p.quizzesCompletedCount + 1 }));
        const newCount = quizCompletionCount + 1;
        setQuizCompletionCount(newCount);
        if (newCount >= 15) {
          showRewardAd(() => {});
          setQuizCompletionCount(0);
        }
    }
    
    if (quizTitle === 'Master Quiz (All Words)') {
      setMasteredWords(prev => new Set([...prev, ...correctlyAnsweredWords]));
    }
    setCurrentView('dashboard');
    setQuizWords([]);
  };

  const handleQuizExit = () => { setCurrentView('dashboard'); setQuizWords([]); };

  const filteredWords = useMemo(() => {
    if (!searchQuery) return [];
    const lowercasedQuery = searchQuery.toLowerCase();
    return allWords.filter(w => w.word.toLowerCase().includes(lowercasedQuery) || w.definition.toLowerCase().includes(lowercasedQuery) || w.example.toLowerCase().includes(lowercasedQuery));
  }, [searchQuery, allWords]);

  const handleGenerateCategory = async (topic: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const generatedWords = await getVocabularyForCategory(topic);
      const newCategory: Category = { name: topic, emoji: '✨', color: 'bg-teal-500', textColor: 'text-white' };
      setWordCache(prev => ({ ...prev, [topic]: generatedWords }));
      if (!hasGeneratedAiCategory) setHasGeneratedAiCategory(true);
      addPoints(POINTS.GENERATE_CATEGORY);
      handleSelectCategory(newCategory);
      showRewardedInterstitialAd(() => {});
    } catch (error) {
      setGenerationError((error as Error).message || 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigateToAiCreate = () => { if (!searchQuery) { setPreviousView(currentView); setCurrentView('ai_create'); } };
  const handleShowHistory = () => { setCurrentView('history'); setIsSidebarOpen(false); };
  const handleShowProfile = () => { setCurrentView('profile'); setIsSidebarOpen(false); };
  const handleShowLeaderboard = () => { setCurrentView('leaderboard'); setIsSidebarOpen(false); };
  const handleShowWordPuzzle = () => { setCurrentView('word_puzzle'); setIsSidebarOpen(false); };


  const isBackButtonVisible = !['dashboard'].includes(currentView) && !searchQuery;

  const onSwipeBack = useCallback(() => { if (currentView === 'quiz') handleQuizExit(); else handleBack(); }, [currentView]);
  const { handleTouchStart, handleTouchMove, handleTouchEnd, swipeStyles } = useSwipeBack({ onSwipeBack, enabled: isBackButtonVisible });

  const renderContent = () => {
    if (searchQuery) {
      return (
        <div className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Search Results for "{searchQuery}"</h2>
            {filteredWords.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{filteredWords.map(word => <Flashcard key={word.word} wordData={word} isLearned={learnedWords.has(word.word)} onToggleLearned={handleToggleLearned} />)}</div>) : (<p>No words found.</p>)}
        </div>
      );
    }
    switch (currentView) {
      case 'profile': return <ProfileView userName={userName} onUserNameChange={setUserName} userPoints={userPoints} earnedBadges={earnedBadges} />;
      case 'leaderboard': return <LeaderboardView userName={userName} userPoints={userPoints} />;
      case 'word_puzzle': return <WordPuzzleView learnedWords={learnedWords} allWords={allWords} addPoints={addPoints} />;
      case 'ai_create': return <AiCreateView onGenerateCategory={handleGenerateCategory} isGenerating={isGenerating} generationError={generationError} />;
      case 'history': return <HistoryView history={quizHistory} />;
      case 'quiz': return <QuizView words={quizWords} onQuizComplete={handleQuizComplete} onQuizExit={handleQuizExit} title={quizTitle} />;
      case 'category': return selectedCategory && <CategoryView category={selectedCategory} words={wordCache[selectedCategory.name] || []} learnedWords={learnedWords} onToggleLearned={handleToggleLearned} onStartQuiz={handleStartQuiz} />;
      default: return <Dashboard onSelectCategory={handleSelectCategory} onStartQuiz={() => handleStartQuiz()} wordCache={wordCache} learnedWords={learnedWords} masteredWords={masteredWords} totalWords={coreWords.length} dailyGoal={dailyGoal} dailyProgress={dailyProgress} userName={userName} userPoints={userPoints} />;
    }
  };
  
  const getTitle = () => {
    if (searchQuery) return "Search";
    if (currentView === 'profile') return "My Profile";
    if (currentView === 'leaderboard') return "Leaderboard";
    if (currentView === 'word_puzzle') return "Word Puzzle";
    if (currentView === 'ai_create') return "Create with AI";
    if (currentView === 'quiz') return "Quiz Time!";
    if (currentView === 'history') return "Quiz History";
    if (currentView === 'category' && selectedCategory) return selectedCategory.name;
    return "Essential Words";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <BadgeNotification badge={newlyUnlockedBadge} onDismiss={() => setNewlyUnlockedBadge(null)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        notificationsEnabled={notificationsEnabled}
        onNotificationsToggle={handleNotificationsToggle}
        dailyGoal={dailyGoal}
        onGoalChange={handleGoalChange}
        onShowHistory={handleShowHistory}
        onShowProfile={handleShowProfile}
        onShowLeaderboard={handleShowLeaderboard}
        onShowWordPuzzle={handleShowWordPuzzle}
      />
      <div className="flex flex-col h-screen">
        <Header showBackButton={isBackButtonVisible} onBack={currentView === 'quiz' ? handleQuizExit : handleBack} onMenu={() => setIsSidebarOpen(true)} searchQuery={searchQuery} onSearchChange={setSearchQuery} title={getTitle()} />
        <main className="flex-1 overflow-y-auto" style={swipeStyles} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>{renderContent()}</main>
        <BannerAd />
      </div>
      {!searchQuery && (<button onClick={handleNavigateToAiCreate} className="fixed bottom-20 right-6 bg-gradient-to-br from-teal-400 to-primary-600 text-white px-5 py-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-30 focus:outline-none focus:ring-4 focus:ring-teal-300 flex items-center space-x-2" aria-label="Create with AI"><SparklesIcon className="h-6 w-6" /> <span className="font-semibold text-lg">AI</span></button>)}
    </div>
  );
};

export default App;