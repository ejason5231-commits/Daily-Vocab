
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdMob, RewardInterstitialAdPluginEvents } from '@capacitor-community/admob';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TipsModal from './components/TipsModal';
import Dashboard from './components/Dashboard';
import CategoryView from './components/CategoryView';
import QuizView from './components/QuizView';
import AiCreateView from './components/AiCreateView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import PodcastView from './components/PodcastView'; // Added Import
import BadgeNotification from './components/BadgeNotification';
import LevelUpNotification from './components/LevelUpNotification';
import BottomNavigation from './components/BottomNavigation';
import LoginModal from './components/LoginModal';
import UpdateModal from './components/UpdateModal';
import { Category, VocabularyWord, DailyGoal, DailyProgress, Badge } from './types';
import { CATEGORIES, VOCABULARY_DATA } from './constants';
import { getVocabularyForCategory } from './services/geminiService';
import { useSwipeBack } from './hooks/useSwipeBack';
import { BADGES, POINTS } from './gamificationConstants';
import { SparklesIcon } from './components/icons';
import { checkForUpdate, openPlayStoreUpdate } from './services/updateService';
import { setupAllNotifications } from './services/notificationService';

interface QuizCompletionResult {
  correctlyAnsweredWords: string[];
  score: number;
  totalQuestions: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

// Ad Unit IDs (Production IDs) - replace these with the exact IDs from your AdMob account if different
const AD_UNIT_IDS = {
  rewardInterstitial: 'ca-app-pub-3055032812859066/1105110403', // Production reward interstitial
  interstitial: 'ca-app-pub-3055032812859066/5534475851',        // Production interstitial
  nativeAd: 'ca-app-pub-3055032812859066/6800104806',            // Production native ad
};

// Last time an interstitial ad was shown (for cooldown)
let lastInterstitialAdTime = Date.now(); // Initialize to current time to enforce cooldown from start
const INTERSTITIAL_COOLDOWN_MS = 60000; // 60 seconds

// When true, navigation-triggered interstitials should be skipped once.
let suppressNextInterstitial = false;

// When true, a reward interstitial is pending/shown, so skip navigation-triggered regular interstitials
let pendingRewardInterstitial = false;

// Initialize AdMob
const initializeAdMob = async () => {
  try {
    // Initialize AdMob. For production do NOT enable initializeForTesting.
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: false,
    });
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('AdMob initialization failed:', error);
  }
};

// Show rewarded interstitial ad
export const showRewardInterstitial = async () => {
  try {
    console.log('[AdMob] Loading reward interstitial ad...');
    // Set pending flag to prevent regular interstitials from overlapping
    pendingRewardInterstitial = true;
    
    // Use prepareRewardInterstitialAd and showRewardInterstitialAd (correct API per plugin docs)
    await AdMob.prepareRewardInterstitialAd({
      adId: AD_UNIT_IDS.rewardInterstitial,
    });

    const rewardItem = await AdMob.showRewardInterstitialAd();
    console.log('[AdMob] Reward interstitial ad shown successfully', rewardItem);
    // Treat reward interstitial as an interstitial for cooldown purposes
    try {
      lastInterstitialAdTime = Date.now();
    } catch (e) {
      // ignore
    }
  } catch (error) {
    console.error('[AdMob] Failed to show reward interstitial ad:', error);
  } finally {
    // Clear pending flag after a short delay to allow the ad to finish
    setTimeout(() => {
      pendingRewardInterstitial = false;
      console.log('[AdMob] Reward interstitial pending flag cleared');
    }, 500);
  }
};

// Show interstitial ad with cooldown
export const showInterstitialAd = async () => {
  try {
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialAdTime;
    
    // Check if cooldown period has passed
    if (timeSinceLastAd < INTERSTITIAL_COOLDOWN_MS) {
      const remainingCooldown = Math.ceil((INTERSTITIAL_COOLDOWN_MS - timeSinceLastAd) / 1000);
      console.log(`[AdMob] Interstitial on cooldown. ${remainingCooldown}s remaining.`);
      return;
    }

    console.log(`[AdMob] Showing interstitial ad (${timeSinceLastAd}ms since last ad)`);
    await AdMob.prepareInterstitial({
      adId: AD_UNIT_IDS.interstitial,
    });

    await AdMob.showInterstitial();
    lastInterstitialAdTime = now;
    console.log('[AdMob] Interstitial ad shown successfully');
  } catch (error) {
    console.error('[AdMob] Failed to show interstitial ad:', error);
  }
};

// Helper to suppress next navigation-triggered interstitial (used before showing reward interstitials)
export const suppressNextNavigationInterstitial = () => {
  suppressNextInterstitial = true;
  console.log('[AdMob] Navigation interstitial suppressed for next reward ad');
};

// Show native ad (returns ad data for custom rendering)
export const loadNativeAd = async () => {
  try {
    console.log('Loading native ad...');
    // Note: Native ads require custom implementation in the UI component
    // This loads the ad and the component should handle display
    const res = await AdMob.loadNativeAd({
      adId: AD_UNIT_IDS.nativeAd,
    });
    console.log('[AdMob] Native ad load response:', res);
    console.log('Native ad loaded successfully');
    // Return the full response so UI components can inspect/render ad assets
    return res;
  } catch (error) {
    console.error('Failed to load native ad:', error);
    return null;
  }
};

// Banner ads are intentionally not used in this app.

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'category' | 'quiz' | 'ai_create' | 'leaderboard' | 'quiz_journey' | 'profile' | 'podcast'>('dashboard');
  const [previousView, setPreviousView] = useState<'dashboard' | 'category' | 'quiz' | 'ai_create' | 'leaderboard' | 'quiz_journey' | 'profile' | 'podcast'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'podcast' | 'profile'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ isForceUpdate: boolean; latestVersion: string; currentVersion: string } | null>(null); 

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
  const [userName, setUserName] = useState(() => {
    return window.localStorage.getItem('userName') || "Learner";
  });
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return window.localStorage.getItem('profileImage');
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // Data State
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('A1-A2');
  
  const activeCategories = useMemo(() => {
      return CATEGORIES;
  }, [selectedDifficulty]);

  const [wordCache, setWordCache] = useState<Record<string, VocabularyWord[]>>(VOCABULARY_DATA);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => {
    const stored = window.localStorage.getItem('learnedWords');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [masteredWords, setMasteredWords] = useState<Set<string>>(() => {
    const stored = window.localStorage.getItem('masteredWords');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  
  const [aiGeneratedWords, setAiGeneratedWords] = useState<VocabularyWord[]>([]);
  
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>(() => {
      const stored = window.localStorage.getItem('unlockedLevels');
      return stored ? JSON.parse(stored) : {};
  });

  const [globalUnlockedLevel, setGlobalUnlockedLevel] = useState<number>(() => {
      const stored = window.localStorage.getItem('globalUnlockedLevel');
      return stored ? parseInt(stored, 10) : 1;
  });

  const [userPoints, setUserPoints] = useState<number>(() => {
      const stored = window.localStorage.getItem('userPoints');
      return stored ? parseInt(stored, 10) : 0;
  });
  
  const [userCoins, setUserCoins] = useState<number>(() => {
      const stored = window.localStorage.getItem('userCoins');
      return stored ? parseInt(stored, 10) : 0;
  });

  const [userStreak, setUserStreak] = useState<number>(() => {
      const stored = window.localStorage.getItem('userStreak');
      return stored ? parseInt(stored, 10) : 0;
  });
  const [lastActiveDate, setLastActiveDate] = useState<string>(() => {
      return window.localStorage.getItem('lastActiveDate') || '';
  });

  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
      const stored = window.localStorage.getItem('earnedBadges');
      return stored ? JSON.parse(stored) : [];
  });
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => {
    const stored = window.localStorage.getItem('dailyGoal');
    return stored ? JSON.parse(stored) : { type: 'words', value: 40 };
  });
  
  // -- NEW: Progress History Tracking --
  const [progressHistory, setProgressHistory] = useState<Record<string, DailyProgress>>(() => {
      const stored = window.localStorage.getItem('progressHistory');
      return stored ? JSON.parse(stored) : {};
  });

  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const today = getTodayString();
    
    // First try getting from history state initialized above
    const storedHistory = window.localStorage.getItem('progressHistory');
    if (storedHistory) {
        const historyMap = JSON.parse(storedHistory);
        if (historyMap[today]) return historyMap[today];
    }

    // Fallback/Legacy
    const stored = window.localStorage.getItem('dailyProgress');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    }
    return { date: today, wordsLearnedCount: 0, quizzesCompletedCount: 0 };
  });

  const [badgeNotification, setBadgeNotification] = useState<Badge | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<{level: number, categoryName: string} | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Tips modal shown on first run
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [quizStartLevel, setQuizStartLevel] = useState<number | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('');
  
  const allJourneyWords = useMemo(() => {
    return (Object.values(wordCache) as VocabularyWord[][]).reduce((acc, val) => acc.concat(val), [] as VocabularyWord[]);
  }, [wordCache]);

  // --- Effects ---

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize AdMob on app startup
  useEffect(() => {
    initializeAdMob().catch(error => {
      console.error('AdMob initialization error:', error);
    });

    // Add listener for reward interstitial ad events
    const rewardListener = AdMob.addListener(
      RewardInterstitialAdPluginEvents.Rewarded,
      (rewardItem: any) => {
        console.log('User earned reward from interstitial:', rewardItem);
      }
    );

    // Cleanup listener on unmount
    return () => {
      rewardListener.remove();
    };
  }, []);

  // Show Tips modal on first run (unless user has dismissed it before)
  useEffect(() => {
    try {
      const shown = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('tipsShown') : null;
      if (!shown) {
        setIsTipsOpen(true);
      }
    } catch (e) {
      console.error('Failed to read tipsShown flag:', e);
      // Fallback: show tips
      setIsTipsOpen(true);
    }
  }, []);

  // Check for app updates and setup notifications on startup
  useEffect(() => {
    const initializeAppServices = async () => {
      try {
        // Check for updates
        const updateCheck = checkForUpdate();
        if (updateCheck.needsUpdate) {
          setUpdateInfo({
            isForceUpdate: updateCheck.isForceUpdate,
            latestVersion: updateCheck.latestVersion,
            currentVersion: '0.0.1', // Match CURRENT_APP_VERSION from updateService
          });
          setShowUpdateModal(true);
        }

        // Setup daily notifications
        await setupAllNotifications();
        console.log('Daily notifications scheduled');
      } catch (error) {
        console.error('Error initializing app services:', error);
      }
    };

    initializeAppServices();
  }, []);

  // Show interstitial ad when changing screens (except quiz)
  useEffect(() => {
    if (previousView !== currentView && currentView !== 'quiz' && previousView !== 'quiz') {
      // If suppression flag is set (e.g., AI generation), skip one navigation-triggered interstitial
      if (suppressNextInterstitial) {
        console.log('[AdMob] Suppressing navigation-triggered interstitial (AI generation)');
        suppressNextInterstitial = false;
      } else if (pendingRewardInterstitial) {
        // Skip navigation-triggered interstitial if a reward interstitial is pending/shown
        console.log('[AdMob] Skipping navigation interstitial (reward interstitial pending)');
      } else {
        console.log(`[AdMob] Navigation triggered: ${previousView} → ${currentView}. Attempting interstitial...`);
        // Show interstitial ad with cooldown
        showInterstitialAd().catch(error => {
          console.error('Error showing interstitial ad:', error);
        });
      }
    }
    setPreviousView(currentView);
  }, [currentView]);

  // Show interstitial ad when returning to home/dashboard
  useEffect(() => {
    if (currentView === 'dashboard' && previousView !== 'dashboard' && previousView !== '') {
      if (suppressNextInterstitial) {
        console.log('[AdMob] Suppressing dashboard-return interstitial (AI generation)');
        suppressNextInterstitial = false;
      } else if (pendingRewardInterstitial) {
        // Skip navigation-triggered interstitial if a reward interstitial is pending/shown
        console.log('[AdMob] Skipping dashboard-return interstitial (reward interstitial pending)');
      } else {
        console.log(`[AdMob] Returning to dashboard from ${previousView}. Attempting interstitial...`);
        showInterstitialAd().catch(error => {
          console.error('Error showing interstitial ad on home return:', error);
        });
      }
    }
  }, [currentView, previousView]);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    } else {
      localStorage.removeItem('profileImage');
    }
  }, [profileImage]);

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

  // Save both dailyProgress (for quick access) and history (for calendar)
  useEffect(() => {
    localStorage.setItem('dailyProgress', JSON.stringify(dailyProgress));
    
    // Update history map
    setProgressHistory(prev => {
        const newHistory = { ...prev, [dailyProgress.date]: dailyProgress };
        localStorage.setItem('progressHistory', JSON.stringify(newHistory));
        return newHistory;
    });
  }, [dailyProgress]);

  useEffect(() => {
    localStorage.setItem('userStreak', userStreak.toString());
  }, [userStreak]);

  useEffect(() => {
    localStorage.setItem('lastActiveDate', lastActiveDate);
  }, [lastActiveDate]);

  // --- Handlers ---

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("Learner");
    setIsSidebarOpen(false);
  };

  const handleUpdateClick = async () => {
    try {
      await openPlayStoreUpdate();
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Failed to open Play Store:', error);
    }
  };

  const handleSkipUpdate = () => {
    setShowUpdateModal(false);
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
        
        // Show reward interstitial when 15 words marked as learned
        if (next.size % 15 === 0) {
          suppressNextInterstitial = true;
          console.log('[AdMob] Triggering reward for 15 learned words milestone');
          (async () => {
            try {
              await showRewardInterstitial();
            } catch (e) {
              // ignore ad failures
            }
          })();
        }
        
        return next;
      });
      updateDailyProgress('words');
      addCoins(POINTS.LEARN_WORD); 
    }
  };

  const updateStreak = () => {
    const today = getTodayString();
    if (lastActiveDate === today) return; 

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActiveDate === yesterdayString) {
        newStreak = userStreak + 1;
    }

    setUserStreak(newStreak);
    setLastActiveDate(today);
  };

  const updateDailyProgress = (type: 'words' | 'quizzes') => {
    updateStreak();

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

  const handleDailyGoalCompleted = () => {
    // Show reward interstitial when daily goal is completed
    suppressNextInterstitial = true;
    console.log('[AdMob] Triggering reward for daily goal completion');
    (async () => {
      try {
        await showRewardInterstitial();
      } catch (e) {
        // ignore ad failures
      }
    })();
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('category');
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
    addPoints(1); 
  };

  const handleQuizComplete = (result: QuizCompletionResult) => {
    updateDailyProgress('quizzes');
    
    setMasteredWords(prev => {
      const next = new Set(prev);
      result.correctlyAnsweredWords.forEach(word => next.add(word));
      return next;
    });
  };

  const handleSaveProgress = (answeredWords: string[]) => {
    if (answeredWords.length === 0) return;
    
    setMasteredWords(prev => {
      const next = new Set(prev);
      answeredWords.forEach(word => next.add(word));
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
      const existingCategory = activeCategories.find(c => c.name.toLowerCase() === topic.toLowerCase());
      if (existingCategory) {
        setSelectedCategory(existingCategory);
        setCurrentView('category');
        setActiveTab('home');
        setIsGenerating(false);
        return;
      }

      const newWords = await getVocabularyForCategory(topic);
      setAiGeneratedWords(newWords);

      const tempCategory: Category = {
          name: topic,
          emoji: '✨',
          color: 'bg-teal-500',
          textColor: 'text-white'
      };
      
      // Suppress the navigation-triggered interstitial once because we'll show a reward interstitial instead
      suppressNextInterstitial = true;
      setSelectedCategory(tempCategory);
      setCurrentView('category');
      setActiveTab('home');

      // Show reward interstitial when AI generates words
      (async () => {
        try {
          await showRewardInterstitial();
        } catch (e) {
          // ignore ad failures
        }
      })();

    } catch (error) {
      setGenerationError("Failed to generate words. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
      setIsQuizActive(false); 
      setAiGeneratedWords([]); 
      
      if (currentView === 'quiz') {
          if (selectedCategory) {
            setCurrentView('category');
          } else {
            setCurrentView('dashboard');
          }
      } else if (currentView === 'category' || currentView === 'leaderboard' || currentView === 'ai_create' || currentView === 'podcast') {
          setCurrentView('dashboard');
          setActiveTab('home');
      }
      // After handling the back navigation, attempt an interstitial
      // but respect suppression flags and pending reward interstitials
      try {
        if (suppressNextInterstitial) {
          console.log('[AdMob] Suppressing back-button interstitial');
          suppressNextInterstitial = false;
        } else if (pendingRewardInterstitial) {
          console.log('[AdMob] Skipping back-button interstitial (reward pending)');
        } else {
          showInterstitialAd().catch(error => {
            console.error('Error showing interstitial after back navigation:', error);
          });
        }
      } catch (e) {
        console.error('Back navigation interstitial check failed:', e);
      }
  };

  const handleTabChange = (tab: 'home' | 'quiz' | 'podcast' | 'profile') => {
      setActiveTab(tab);
      setIsQuizActive(false); 

      if (tab === 'home') {
          setCurrentView('dashboard');
          setSelectedCategory(null);
          setAiGeneratedWords([]); 
      } else if (tab === 'quiz') {
          setCurrentView('quiz_journey');
          setSelectedCategory(null);
      } else if (tab === 'profile') {
          setCurrentView('profile');
          setSelectedCategory(null);
      } else if (tab === 'podcast') {
          setCurrentView('podcast');
          setSelectedCategory(null);
      }
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd, swipeStyles } = useSwipeBack({
    onSwipeBack: handleBack,
    enabled: (currentView === 'category' || currentView === 'quiz' || currentView === 'leaderboard' || currentView === 'podcast')
  });

  const showHeader = activeTab !== 'quiz' && currentView !== 'quiz';

  const getHeaderTitle = () => {
      if (selectedCategory) return selectedCategory.name;
      if (currentView === 'leaderboard') return 'Leaderboard';
      if (currentView === 'profile') return 'My Profile';
      if (currentView === 'podcast') return 'Podcast';
      return 'Daily Vocab';
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 transition-colors duration-300 font-sans overflow-x-hidden">
      
      {isGenerating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-2xl flex flex-row items-center gap-4 border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
            <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <SparklesIcon className="w-8 h-8 text-teal-500 animate-spin-slow relative z-10" />
            </div>
            <div className="flex flex-col justify-center">
                <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 leading-none mb-1">
                    Generating...
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                  Crafting your lesson...
                </p>
            </div>
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {updateInfo && (
        <UpdateModal 
          isOpen={showUpdateModal}
          isForceUpdate={updateInfo.isForceUpdate}
          latestVersion={updateInfo.latestVersion}
          currentVersion={updateInfo.currentVersion}
          onUpdate={handleUpdateClick}
          onSkip={updateInfo.isForceUpdate ? undefined : handleSkipUpdate}
        />
      )}

      <TipsModal
        isOpen={isTipsOpen}
        onClose={() => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem('tipsShown', '1');
            }
          } catch (e) {
            console.error('Failed to set tipsShown flag:', e);
          }
          setIsTipsOpen(false);
        }}
        onNavigate={(tab) => {
          // Use existing handler to change tabs/views
          handleTabChange(tab);
        }}
      />

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
          // Trigger interstitial only for explicit navigation button press
          showInterstitialAd().catch(error => {
            console.error('Error showing interstitial after dashboard navigation:', error);
          });
        }}
        onShowLeaderboard={() => {
            setCurrentView('leaderboard');
            setActiveTab('home');
            setIsSidebarOpen(false);
          // Trigger interstitial only for explicit navigation button press
          showInterstitialAd().catch(error => {
            console.error('Error showing interstitial after leaderboard navigation:', error);
          });
        }}
        userQuizScore={userPoints}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />

      {showHeader && (
        <Header 
          showBackButton={currentView !== 'dashboard' && currentView !== 'ai_create' && currentView !== 'profile' && currentView !== 'quiz_journey'}
          onBack={handleBack}
          onMenu={() => setIsLoginModalOpen(true)} // Profile icon opens Login Modal directly
          title={getHeaderTitle()}
          showAiBar={currentView === 'dashboard'}
          userName={userName}
          profileImage={profileImage}
          onAiGenerate={handleAiGenerate}
          showProfileButton={currentView !== 'profile'}
        />
      )}

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
                categories={activeCategories}
                onSelectCategory={handleSelectCategory}
                wordCache={wordCache}
                learnedWords={learnedWords}
                masteredWords={masteredWords}
                totalWords={(Object.values(wordCache) as VocabularyWord[][]).reduce((acc, words) => acc + words.length, 0)}
                dailyGoal={dailyGoal}
                dailyProgress={dailyProgress}
                userName={userName}
                userPoints={userPoints}
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
                onGoalComplete={handleDailyGoalCompleted}
            />
            )}

            {currentView === 'category' && selectedCategory && (
            <CategoryView 
                category={selectedCategory}
                words={wordCache[selectedCategory.name] || aiGeneratedWords}
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
                masteredWords={masteredWords}
                onSaveProgress={handleSaveProgress}
            />
            )}

            {currentView === 'quiz_journey' && (
            <QuizView
                words={allJourneyWords}
                onQuizComplete={handleQuizComplete}
                onQuizExit={() => {}} 
                title="Vocab Journey"
                categoryName="Vocab Journey"
                unlockedLevel={globalUnlockedLevel}
                onUnlockLevel={handleGlobalLevelUnlock}
                onQuizStatusChange={setIsQuizActive}
                userPoints={userPoints}
                userCoins={userCoins}
                onCorrectAnswer={handleCorrectAnswer}
                masteredWords={masteredWords}
                onSaveProgress={handleSaveProgress}
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

            {currentView === 'podcast' && (
              <PodcastView />
            )}

            {currentView === 'profile' && (
              <ProfileView 
                userName={userName} 
                userLevel={Math.floor(userPoints / 500) + 1} 
                userPoints={userPoints}
                userCoins={userCoins}
                userStreak={userStreak}
                profileImage={profileImage}
                onUpdateName={setUserName}
                onUpdateProfileImage={setProfileImage}
                onOpenSettings={() => setIsSidebarOpen(true)}
                onShowLeaderboard={() => {
                   setCurrentView('leaderboard');
                   setActiveTab('home'); 
                }}
                isLoggedIn={isLoggedIn}
                onLogin={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
                onNavigate={handleTabChange}
                progressHistory={progressHistory}
                dailyGoal={dailyGoal}
              />
            )}
        </main>
      </div>

      {currentView === 'dashboard' && (
        <button
            onClick={() => setCurrentView('ai_create')}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 bg-gradient-to-r from-teal-400 to-teal-600 text-white w-16 h-16 rounded-full shadow-lg shadow-teal-500/40 hover:scale-110 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center animate-bounce-slow"
            aria-label="Create AI Topic"
        >
            <SparklesIcon className="w-6 h-6 mb-0.5" />
            <span className="text-[10px] font-black leading-none">AI</span>
        </button>
      )}

      {!isQuizActive && (
        <BottomNavigation 
          currentTab={activeTab} 
          onTabChange={handleTabChange} 
          onOpenSettings={() => setIsSidebarOpen(true)}
        />
      )}

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
