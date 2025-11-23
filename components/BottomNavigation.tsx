
import React from 'react';
import { HomeIcon, QuizIcon, SparklesIcon, SettingsIcon } from './icons';

interface BottomNavigationProps {
  currentTab: 'home' | 'quiz' | 'ai';
  onTabChange: (tab: 'home' | 'quiz' | 'ai') => void;
  onOpenSettings: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onTabChange, onOpenSettings }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)] z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 group ${currentTab === 'home' ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <div className={`p-1 rounded-full transition-transform duration-200 ${currentTab === 'home' ? 'bg-primary-100 dark:bg-primary-900/30 scale-110' : 'group-hover:scale-105'}`}>
            <HomeIcon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">Home</span>
        </button>
        <button 
          onClick={() => onTabChange('quiz')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 group ${currentTab === 'quiz' ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <div className={`p-1 rounded-full transition-transform duration-200 ${currentTab === 'quiz' ? 'bg-primary-100 dark:bg-primary-900/30 scale-110' : 'group-hover:scale-105'}`}>
            <QuizIcon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">Quiz</span>
        </button>
        <button 
          onClick={() => onTabChange('ai')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 group ${currentTab === 'ai' ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <div className={`p-1 rounded-full transition-transform duration-200 ${currentTab === 'ai' ? 'bg-primary-100 dark:bg-primary-900/30 scale-110' : 'group-hover:scale-105'}`}>
            <SparklesIcon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">AI Create</span>
        </button>
        <button 
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 group text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <div className="p-1 rounded-full transition-transform duration-200 group-hover:scale-105">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
