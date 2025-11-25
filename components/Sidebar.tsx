
import React from 'react';
import { CloseIcon, SunIcon, MoonIcon, BellIcon, MicrophoneIcon, LeaderboardIcon, ProfileIcon, DailyVocabLogo, YouTubeIcon, FacebookIcon } from './icons';
import { DailyGoal } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationsToggle: () => void;
  microphoneEnabled: boolean;
  onMicrophoneToggle: () => void;
  onShowDashboard: () => void;
  onShowLeaderboard: () => void;
  userQuizScore: number;
  dailyGoal: DailyGoal;
  onGoalChange: (goal: DailyGoal) => void;
  isLoggedIn: boolean;
  userName: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
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
  onShowDashboard,
  onShowLeaderboard,
  isLoggedIn,
  userName,
  onLoginClick,
  onLogoutClick
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Absolute Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors z-20"
          aria-label="Close Sidebar"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col h-full">
          
          <div className="flex-1 overflow-y-auto p-5 pt-12 space-y-6">
            
            {/* Login / Profile Section */}
            <div className="bg-blue-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-blue-100 dark:border-gray-600">
              {isLoggedIn ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Hi, {userName}!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ready to learn?</p>
                  <button 
                    onClick={onLogoutClick}
                    className="w-full py-2 px-4 bg-white dark:bg-gray-800 text-red-500 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                   <DailyVocabLogo className="w-12 h-12 mb-2" />
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Join Daily Vocab</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Save your progress and compete on the leaderboard!</p>
                   <button 
                    onClick={() => { onClose(); onLoginClick(); }}
                    className="w-full py-2.5 px-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition-colors"
                   >
                     Log In / Sign Up
                   </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-2"></div>

            {/* Appearance */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Preferences</h3>
              <div className="space-y-2">
                <button 
                  onClick={onThemeToggle}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-500'}`}>
                      {theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </button>

                <button 
                  onClick={onNotificationsToggle}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-red-100 text-red-500">
                      <BellIcon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">Notifications</span>
                  </div>
                   <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </button>
                
                 <button 
                  onClick={onMicrophoneToggle}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-500">
                      <MicrophoneIcon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">Microphone</span>
                  </div>
                   <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${microphoneEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${microphoneEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Navigation</h3>
              <div className="space-y-2">
                <button 
                  onClick={onShowLeaderboard}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                    <LeaderboardIcon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Leaderboard</span>
                </button>
              </div>
            </div>

          </div>
          
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Follow on</h3>
            <div className="flex justify-center space-x-6 mb-4">
              <a 
                href="https://youtube.com/@learnengwitheric?si=HebmKBv0XVOT6j6I" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-700 rounded-full shadow-md text-[#FF0000] border border-gray-100 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-gray-600 transition-all transform hover:scale-110"
                aria-label="YouTube Channel"
              >
                <YouTubeIcon className="w-8 h-8" />
              </a>
              <a 
                href="https://www.facebook.com/share/1CuA2oir9e/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-700 rounded-full shadow-md text-[#1877F2] border border-gray-100 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all transform hover:scale-110"
                aria-label="Facebook Page"
              >
                <FacebookIcon className="w-8 h-8" />
              </a>
            </div>
            <p className="text-xs text-gray-400">Daily Vocab v1.0 by Eric AppDev</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
