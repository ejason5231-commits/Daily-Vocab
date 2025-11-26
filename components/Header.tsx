
import React, { useState } from 'react';
import { MenuIcon, BackIcon, DailyVocabLogo, ProfileIcon, SparklesIcon } from './icons';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
  onMenu: () => void;
  title: string;
  showAiBar: boolean;
  userName?: string;
  profileImage?: string | null;
  onAiGenerate: (topic: string) => void;
  showProfileButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  showBackButton, 
  onBack, 
  onMenu, 
  title, 
  showAiBar,
  userName = "Learner",
  profileImage,
  onAiGenerate,
  showProfileButton = true
}) => {
  const [aiInput, setAiInput] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim()) {
      onAiGenerate(aiInput.trim());
      setAiInput('');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 fixed top-0 left-0 right-0 z-40 pt-[env(safe-area-inset-top)] shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between h-14 sm:h-16">
        
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <div className="flex items-center">
              <button onClick={onBack} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 transition-colors">
                <BackIcon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{title}</h1>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="mr-3">
                <DailyVocabLogo className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white tracking-tight leading-none">
                  Daily Vocab
                 </h1>
                 <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                   Hello, {userName}!
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {showAiBar && (
            <form onSubmit={handleGenerate} className="hidden sm:flex w-64 lg:w-80 mr-2 relative items-center">
              <input
                type="text"
                placeholder="Topic (e.g. Space)..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="w-full pl-4 pr-20 py-1.5 border border-gray-200 rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-full transition-colors flex items-center"
              >
                <SparklesIcon className="w-3 h-3 mr-1" />
                Generate
              </button>
            </form>
          )}
          
          {showProfileButton && (
            <button 
              onClick={onMenu} 
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              aria-label="User Settings"
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm" 
                />
              ) : (
                <ProfileIcon className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 dark:text-gray-600 hover:text-green-500 dark:hover:text-green-400 transition-colors" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile AI Bar (visible only on small screens when AI bar is enabled) */}
      {showAiBar && (
        <div className="sm:hidden px-4 pb-1">
           <form onSubmit={handleGenerate} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter topic..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full pl-4 pr-24 py-2 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-gray-800 shadow-inner transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm"
                >
                   <SparklesIcon className="w-3 h-3 mr-1" />
                   Generate
                </button>
            </form>
        </div>
      )}
    </header>
  );
};

export default Header;
