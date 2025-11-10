import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryView from './components/CategoryView';
import QuizView from './components/QuizView';
import Flashcard from './components/Flashcard';
import AiCreateView from './components/AiCreateView';
import { Category, VocabularyWord } from './types';
import { VOCABULARY_DATA } from './constants';
import { getVocabularyForCategory } from './services/geminiService';
import { SparklesIcon } from './components/icons';


type View = 'dashboard' | 'category' | 'quiz' | 'ai_create';

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
    return true;
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

  const [searchQuery, setSearchQuery] = useState('');
  const [wordCache, setWordCache] = useState<Record<string, VocabularyWord[]>>(VOCABULARY_DATA);
  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

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


  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(prev => !prev);
  }

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('category');
  };

  const handleBack = () => {
    if (currentView === 'ai_create') {
      setCurrentView(previousView);
    } else {
      setCurrentView('dashboard');
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
        }
        return newSet;
    });
  }, []);

  const allWords = useMemo(() => Object.values(wordCache).flat(), [wordCache]);
  const coreWords = useMemo(() => Object.values(VOCABULARY_DATA).flat(), []);


  const handleStartQuiz = (wordsForQuiz?: VocabularyWord[]) => {
    const wordsToQuiz = wordsForQuiz || coreWords;
    setQuizWords(wordsToQuiz);

    if (wordsForQuiz) { 
      setQuizTitle(selectedCategory?.name || 'Category Quiz');
    } else {
      setQuizTitle('Master Quiz (All Words)');
    }

    setCurrentView('quiz');
  };
  
  const handleQuizComplete = (correctlyAnsweredWords: string[]) => {
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
      const newCategory: Category = {
        name: topic,
        emoji: '✨',
        color: 'bg-teal-500',
        textColor: 'text-white'
      };
      setWordCache(prevCache => ({
        ...prevCache,
        [topic]: generatedWords
      }));
      handleSelectCategory(newCategory);
    } catch (error) {
      console.error(error);
      setGenerationError((error as Error).message || 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigateToAiCreate = () => {
    // Don't navigate away if a search is active
    if (!searchQuery) {
        setPreviousView(currentView);
        setCurrentView('ai_create');
    }
  };


  const renderContent = () => {
    if (searchQuery) {
      return (
        <div className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Search Results for "{searchQuery}"
            </h2>
            {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredWords.map(word => (
                      <Flashcard 
                        key={word.word} 
                        wordData={word} 
                        isLearned={learnedWords.has(word.word)}
                        onToggleLearned={handleToggleLearned}
                      />
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">No words found.</p>
            )}
        </div>
      );
    }
    switch (currentView) {
      case 'ai_create':
        return <AiCreateView 
          onGenerateCategory={handleGenerateCategory}
          isGenerating={isGenerating}
          generationError={generationError}
        />
      case 'quiz':
        return <QuizView 
          words={quizWords} 
          onQuizComplete={handleQuizComplete} 
          onQuizExit={handleQuizExit} 
          title={quizTitle} 
        />;
      case 'category':
        return selectedCategory && (
            <CategoryView 
                category={selectedCategory} 
                words={wordCache[selectedCategory.name] || []}
                learnedWords={learnedWords}
                onToggleLearned={handleToggleLearned}
                onStartQuiz={handleStartQuiz}
            />
        );
      case 'dashboard':
      default:
        return (
            <Dashboard 
                onSelectCategory={handleSelectCategory} 
                onStartQuiz={() => handleStartQuiz()}
                wordCache={wordCache}
                learnedWords={learnedWords}
                masteredWords={masteredWords}
                totalWords={coreWords.length}
            />
        );
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
      />
      <div className="flex flex-col h-screen">
        <Header
          showBackButton={(currentView === 'category' || currentView === 'quiz' || currentView === 'ai_create') && !searchQuery}
          onBack={currentView === 'quiz' ? handleQuizExit : handleBack}
          onMenu={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          title={getTitle()}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {!searchQuery && (
        <button
          onClick={handleNavigateToAiCreate}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-teal-400 to-primary-600 text-white px-5 py-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-30 focus:outline-none focus:ring-4 focus:ring-teal-300 flex items-center space-x-2"
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