
import React from 'react';
import { CloseIcon, SunIcon, MoonIcon, BellIcon, MicrophoneIcon, YouTubeIcon, FacebookIcon, StarIcon, TelegramIcon } from './icons';
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
  onMicrophoneToggle
}) => {
  const handleRateApp = () => {
    // In a real app, this would link to the App Store or Play Store
    // window.open('https://play.google.com/store/apps/details?id=com.dailyvocab.app', '_blank');
    alert("Thank you for your rating! ⭐⭐⭐⭐⭐");
  };

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
            
            {/* Preferences */}
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

            {/* Support */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Support</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleRateApp}
                  className="w-full flex flex-col items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-full flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-200 ml-1">Rate this app</span>
                    <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                  {/* Five Stars Display - Closer to text */}
                  <div className="flex justify-start items-center space-x-1 pl-1">
                       {[1, 2, 3, 4, 5].map((i) => (
                           <div key={i}>
                             <StarIcon className="w-5 h-5 text-yellow-400 drop-shadow-sm" />
                           </div>
                       ))}
                  </div>
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
                className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-md text-[#FF0000] border border-gray-100 hover:bg-red-50 transition-all transform hover:scale-110"
                aria-label="YouTube Channel"
              >
                <YouTubeIcon className="w-8 h-8" />
              </a>
              <a 
                href="https://www.facebook.com/share/1CuA2oir9e/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-md text-[#1877F2] border border-gray-100 hover:bg-blue-50 transition-all transform hover:scale-110"
                aria-label="Facebook Page"
              >
                <FacebookIcon className="w-8 h-8" />
              </a>
              <a 
                href="https://t.me/LearnEnglishwithEric" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-md text-[#229ED9] border border-gray-100 hover:bg-sky-50 transition-all transform hover:scale-110"
                aria-label="Telegram Channel"
              >
                <TelegramIcon className="w-8 h-8" />
              </a>
            </div>
            <p className="text-xs text-gray-400">Daily Vocab by English with Eric</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
