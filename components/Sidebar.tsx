import React from 'react';
import { CloseIcon, SunIcon, MoonIcon, BellIcon, YouTubeIcon, FacebookIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationsToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, onThemeToggle, notificationsEnabled, onNotificationsToggle }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Vocabulary Level</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg text-left transition-colors bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 ring-1 ring-primary-500">
              <span className="text-xl">🥉</span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Bronze</span>
                <span className="text-xs text-primary-600 dark:text-primary-300">(1–1,000 words)</span>
              </div>
            </button>
            <button className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg text-left transition-colors text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">
              <span className="text-xl">🥈</span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Silver</span>
                <span className="text-xs">(1,001–2,000 words)</span>
              </div>
            </button>
            <button className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg text-left transition-colors text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">
              <span className="text-xl">🥇</span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Gold</span>
                <span className="text-xs">(2,001–4,000 words)</span>
              </div>
            </button>
            <button className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg text-left transition-colors text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">
              <span className="text-xl">💎</span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Platinum</span>
                <span className="text-xs">(4,001–6,000 words)</span>
              </div>
            </button>
            <button className="w-full flex items-center space-x-2 px-2 py-1 rounded-lg text-left transition-colors text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">
              <span className="text-xl">💠</span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Diamond</span>
                <span className="text-xs">(6,001–10,000 words)</span>
              </div>
            </button>
          </div>
        </div>

        <nav className="p-4">
          <ul>
              <li className="mb-2">
              <div className="flex items-center justify-between p-2">
                <span className="text-gray-700 dark:text-gray-300 flex items-center"><BellIcon className="h-5 w-5 mr-2" /> Notifications</span>
                <button 
                  onClick={onNotificationsToggle} 
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 ${notificationsEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block w-4 h-4 transform transition-transform duration-300 rounded-full bg-white ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </li>
              <li className="mb-2">
              <div className="flex items-center justify-between p-2">
                <span className="text-gray-700 dark:text-gray-300">Theme</span>
                <button onClick={onThemeToggle} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 bg-gray-200 dark:bg-gray-600">
                  <span className={`inline-block w-4 h-4 transform transition-transform duration-300 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}>
                      {theme === 'dark' ? <MoonIcon className="h-3 w-3 text-white"/> : <SunIcon className="h-3 w-3 text-yellow-500" />}
                  </span>
                </button>
              </div>
            </li>
            <li className="border-t border-gray-200 dark:border-gray-700 my-2"></li>
            <li className="mb-2">
              <button className="w-full text-left p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Check for Updates</button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">About</h3>
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Created by <span className="font-semibold text-gray-700 dark:text-gray-300">Eric Jason</span>
            </p>
            <div className="space-y-2">
              <a 
                href="https://www.youtube.com/@LearnEngwithEric" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <YouTubeIcon className="h-6 w-6 text-red-600" />
                <span className="text-sm font-medium">YouTube Channel</span>
              </a>
              <a 
                href="https://facebook.com/LearnEngwithEric" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <FacebookIcon className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Facebook Page</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;