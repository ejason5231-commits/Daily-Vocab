
import React from 'react';
import { CloseIcon, SunIcon, MoonIcon, BellIcon, YouTubeIcon, FacebookIcon, LeaderboardIcon, MicrophoneIcon, LockIcon, CheckCircleIconSolid } from './icons';
import { DailyGoal } from '../types';
import { TIERS } from '../gamificationConstants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationsToggle: () => void;
  microphoneEnabled: boolean;
  onMicrophoneToggle: () => void;
  dailyGoal: DailyGoal;
  onGoalChange: (newGoal: DailyGoal) => void;
  onShowDashboard: () => void;
  onShowLeaderboard: () => void;
  userQuizScore: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeToggle, 
  notificationsEnabled, 
  onNotificationsToggle,
  microphoneEnabled, 
  onMicrophoneToggle,
  dailyGoal,
  onGoalChange,
  onShowDashboard,
  onShowLeaderboard,
  userQuizScore,
}) => {
  const goalOptions = [10, 20, 30, 40, 50];
  const currentTier = TIERS.slice().reverse().find(tier => userQuizScore >= tier.minPoints) || TIERS[0];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[55] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Your Rank</h3>
          <ul className="space-y-1">
            {TIERS.map(tier => {
              const isUnlocked = userQuizScore >= tier.minPoints;
              const isCurrent = tier.name === currentTier.name;
              const isCompleted = isUnlocked && !isCurrent;

              return (
                <li key={tier.name}>
                  <button 
                    onClick={isUnlocked ? onShowDashboard : undefined}
                    disabled={!isUnlocked}
                    className={`w-full flex items-center text-left p-2 rounded-md transition-all duration-200 ${
                      isCurrent
                        ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500 scale-105 shadow-md'
                        : isCompleted
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xl mr-2">
                      {isCompleted ? <CheckCircleIconSolid className="h-6 w-6 text-green-500" /> : tier.emoji}
                    </div>
                    <div className="flex-grow">
                      <span className={`font-semibold ${isCurrent ? 'text-primary-700 dark:text-primary-300' : ''}`}>{tier.name}</span>
                      <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">{tier.rangeText}</span>
                    </div>
                    {!isUnlocked && <LockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <nav className="p-4 border-b border-gray-200 dark:border-gray-700">
          <ul>
            <li className="mb-2">
              <button onClick={onShowLeaderboard} className="w-full flex items-center text-left p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <LeaderboardIcon className="h-5 w-5 mr-3" />
                <span>Leaderboard</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Daily Goal</h3>
          <div className="space-y-2">
            <div>
              <label htmlFor="goalType" className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal Type</label>
              <select 
                id="goalType"
                value={dailyGoal.type}
                onChange={(e) => onGoalChange({ ...dailyGoal, type: e.target.value as 'words' | 'quizzes' })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
              >
                <option value="words">Learn New Words</option>
                <option value="quizzes">Complete Quizzes</option>
              </select>
            </div>
            <div>
              <label htmlFor="goalValue" className="text-sm font-medium text-gray-700 dark:text-gray-300">Target</label>
              <select 
                id="goalValue"
                value={dailyGoal.value}
                onChange={(e) => onGoalChange({ ...dailyGoal, value: parseInt(e.target.value, 10) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
              >
                {goalOptions.map(option => (
                  <option key={option} value={option}>{option} {dailyGoal.type === 'words' ? 'Words' : 'Quizzes'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul>
              <li className="mb-2">
              <div className="flex items-center justify-between p-2">
                <span className="text-gray-700 dark:text-gray-300 flex items-center"><BellIcon className="h-5 w-5 mr-3" /> Notifications</span>
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
                <span className="text-gray-700 dark:text-gray-300 flex items-center"><MicrophoneIcon className="h-5 w-5 mr-3" /> Microphone</span>
                <button 
                  onClick={onMicrophoneToggle} 
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 ${microphoneEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block w-4 h-4 transform transition-transform duration-300 rounded-full bg-white ${microphoneEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
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
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
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
