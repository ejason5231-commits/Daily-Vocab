
import React from 'react';
import { MenuIcon, BackIcon, SearchIcon } from './icons';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
  onMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  title: string;
  showSearchBar: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack, onMenu, searchQuery, onSearchChange, title, showSearchBar }) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showBackButton ? (
            <button onClick={onBack} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <BackIcon className="h-6 w-6" />
            </button>
          ) : (
            <button onClick={onMenu} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <MenuIcon className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">{title}</h1>
        </div>
        {showSearchBar && (
          <div className="flex-1 max-w-sm ml-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search all words..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
