import React from 'react';
import { MenuIcon, BackIcon, SearchIcon, DailyVocabLogo, ProfileIcon } from './icons';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
  onMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  title: string;
  showSearchBar: boolean;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showBackButton, 
  onBack, 
  onMenu, 
  searchQuery, 
  onSearchChange, 
  title, 
  showSearchBar,
  userName = "Learner"
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40 pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between h-16">
        
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
          {showSearchBar && (
            <div className="hidden sm:block w-48 lg:w-64 mr-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white dark:focus:bg-gray-800 transition-all"
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={onMenu} 
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            aria-label="User Settings"
          >
            <ProfileIcon className="h-8 w-8 sm:h-9 sm:w-9 text-gray-300 dark:text-gray-600 hover:text-green-500 dark:hover:text-green-400 transition-colors" />
          </button>
        </div>
      </div>
      
      {/* Mobile Search Bar (visible only on small screens when search is enabled) */}
      {showSearchBar && (
        <div className="sm:hidden px-4 pb-2">
           <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white dark:focus:bg-gray-800 shadow-inner transition-all"
                />
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;