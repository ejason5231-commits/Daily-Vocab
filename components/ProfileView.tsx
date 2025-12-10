
import React, { useState, useRef } from 'react';
import { 
  StarIcon, CoinIcon, FireIcon, 
  InviteIcon, TrophyIcon, AvatarIcon, PencilIcon, CameraIcon, LoginIcon, LogoutIcon, CloseIcon
} from './icons';
import { DailyGoal, DailyProgress } from '../types';

interface ProfileViewProps {
  userName: string;
  userLevel: number;
  userPoints: number;
  userCoins: number;
  userStreak: number;
  profileImage?: string | null;
  onUpdateName?: (name: string) => void;
  onUpdateProfileImage?: (imageDataUrl: string) => void;
  onOpenSettings: () => void;
  onShowLeaderboard: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate?: (tab: 'home' | 'quiz' | 'podcast' | 'profile') => void;
  progressHistory: Record<string, DailyProgress>;
  dailyGoal: DailyGoal;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  userName, 
  userLevel, 
  userPoints, 
  userCoins,
  userStreak,
  profileImage,
  onUpdateName,
  onUpdateProfileImage,
  onOpenSettings,
  onShowLeaderboard,
  isLoggedIn,
  onLogin,
  onLogout,
  onNavigate,
  progressHistory,
  dailyGoal
}) => {
  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logout Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Info Modal State
  const [activeAlert, setActiveAlert] = useState<{ message: string, targetTab?: 'home' | 'quiz' } | null>(null);

  const handleEditClick = () => {
    setIsEditingName(true);
    setTimeout(() => {
        nameInputRef.current?.focus();
    }, 50);
  };

  const handleNameSave = () => {
    if (tempName.trim() && onUpdateName) {
        onUpdateName(tempName.trim());
    } else {
        setTempName(userName); // Revert if empty
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleNameSave();
    }
  };

  // Image Upload Handling
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfileImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            onUpdateProfileImage(result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  const getLevelLabel = (level: number): string => {
    if (level <= 1) return "A1-A2";
    if (level === 2) return "B1";
    if (level === 3) return "B2";
    return "C1"; // Level 4 and above
  };

  // --- Calendar Widget Logic ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isGoalMet = (dateStr: string) => {
      const progress = progressHistory[dateStr];
      if (!progress) return false;
      if (dailyGoal.type === 'words') return progress.wordsLearnedCount >= dailyGoal.value;
      return progress.quizzesCompletedCount >= dailyGoal.value;
  };

  const getDayClass = (day: number) => {
      // Use local date string construction to avoid timezone issues for simple checking
      const date = new Date(currentYear, currentMonth, day);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${d}`;

      const isToday = day === today.getDate();
      const met = isGoalMet(dateStr);
      
      let classes = "w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all relative ";
      
      if (met) {
          classes += "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-none ";
      } else if (isToday) {
          classes += "bg-blue-100 text-blue-600 border-2 border-blue-500 font-bold ";
      } else {
          classes += "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ";
      }
      return { classes, dateStr };
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-1 pb-24 relative">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Log Out</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Are you sure do you want to log out?</p>
            
            <button 
              onClick={confirmLogout}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all mb-3"
            >
              Logout
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Generic Info Modal - Positioned at Language Explorer Level (approx pt-52) */}
      {activeAlert && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-52">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setActiveAlert(null)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all animate-scale-in">
            <p className="text-lg font-bold text-gray-800 dark:text-white mb-6 whitespace-pre-line">{activeAlert.message}</p>
            
            <button 
              onClick={() => setActiveAlert(null)}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              OK
            </button>

            {activeAlert.targetTab && onNavigate && (
              <button 
                onClick={() => {
                  setActiveAlert(null);
                  onNavigate(activeAlert.targetTab!);
                }}
                className="w-full mt-3 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Go
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header / User Info - Compact Layout */}
      <div className="flex flex-col items-center mb-4 animate-fade-in-up">
        {/* Avatar Section */}
        <div 
            className="w-16 h-16 mb-2 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center p-1 relative cursor-pointer group"
            onClick={handleImageClick}
        >
           <div className="w-full h-full rounded-full overflow-hidden relative">
               {profileImage ? (
                   <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                   <AvatarIcon className="w-full h-full text-gray-800 dark:text-gray-200" />
               )}
           </div>
           
           {/* Camera Icon Badge - Always Visible */}
           <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md border border-gray-200 dark:border-gray-600 transform transition-transform hover:scale-110">
               <CameraIcon className="w-3 h-3 text-blue-500" />
           </div>
        </div>

        {/* Name Section */}
        <div className="flex items-center justify-center mb-0.5">
            {isEditingName ? (
                <div className="flex items-center">
                    <input 
                        ref={nameInputRef}
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={handleKeyDown}
                        className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none text-center min-w-[150px]"
                    />
                </div>
            ) : (
                <div className="flex items-center group cursor-pointer" onClick={handleEditClick}>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mr-2">
                        {userName}
                    </h1>
                    <PencilIcon className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
            )}
        </div>

        {/* Login/Logout Button */}
        <div className="mt-1">
            {!isLoggedIn ? (
                <button 
                    onClick={onLogin}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-full font-semibold shadow-md transition-transform transform active:scale-95 text-xs"
                >
                    <LoginIcon className="w-3 h-3" />
                    <span>Log In</span>
                </button>
            ) : (
                <button 
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full font-semibold shadow-sm transition-transform transform active:scale-95 text-xs"
                >
                    <LogoutIcon className="w-3 h-3" />
                    <span>Log Out</span>
                </button>
            )}
        </div>
      </div>

      {/* Key Metrics / Achievements (Three Card Layout) */}
      <div className="grid grid-cols-3 gap-2 mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Level Card */}
        <button 
          onClick={() => setActiveAlert({ message: "Get 1000XP to Level Up", targetTab: 'quiz' })}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 active:scale-95"
        >
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-full mb-1">
            <TrophyIcon className="w-4 h-4 text-yellow-600" />
          </div>
          <span className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">Level</span>
          <span className="text-base font-bold text-gray-800 dark:text-white">{getLevelLabel(userLevel)}</span>
        </button>

        {/* Coins Card */}
        <button 
          onClick={() => setActiveAlert({ message: "Mark the words ‘Learned’ to get points.", targetTab: 'home' })}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 active:scale-95"
        >
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-full mb-1">
            <CoinIcon className="w-4 h-4 text-yellow-500" />
          </div>
          <span className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">Coins</span>
          <span className="text-base font-bold text-gray-800 dark:text-white">{userCoins.toLocaleString()}</span>
        </button>

        {/* XP Card */}
        <button 
          onClick={() => setActiveAlert({ message: "Complete the quizzes to Level Up!", targetTab: 'quiz' })}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 active:scale-95"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full mb-1">
            <StarIcon className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">XP</span>
          <span className="text-base font-bold text-gray-800 dark:text-white">{userPoints.toLocaleString()}</span>
        </button>
      </div>

      {/* Daily Streak Section - Redesigned Style */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-0 shadow-lg border border-orange-100 dark:border-gray-700 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
         {/* Top Banner / Hero */}
         <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 sm:p-5 text-white flex items-center justify-between relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10">
                 <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                     <circle cx="20" cy="20" r="20" fill="currentColor"/>
                     <circle cx="80" cy="80" r="30" fill="currentColor"/>
                 </svg>
             </div>
             
             <div className="relative z-10">
                 <h2 className="text-lg sm:text-xl font-bold opacity-90">Daily Streak</h2>
                 <div className="flex items-baseline space-x-2 mt-1">
                     <span className="text-4xl font-black">{userStreak}</span>
                     <span className="text-lg font-medium opacity-80">Days</span>
                 </div>
             </div>
             
             <div className="relative z-10 bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/30 shadow-inner">
                 <FireIcon className="w-8 h-8 text-white animate-pulse" />
             </div>
         </div>

         {/* Calendar Strip */}
         <div className="p-4 sm:p-5 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center px-1">
                {Array.from({ length: 7 }).map((_, index) => { 
                    const cycleProgress = userStreak % 7;
                    const filledCount = (cycleProgress === 0 && userStreak > 0) ? 7 : cycleProgress;
                    const isFilledVisual = index < filledCount;

                    return (
                         <div key={index} className="flex flex-col items-center gap-1">
                            <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                    isFilledVisual 
                                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-500 shadow-sm' 
                                    : 'bg-gray-100 text-gray-400 border-2 border-transparent dark:bg-gray-700 dark:text-gray-500'
                                }`}
                            >
                                {isFilledVisual ? <FireIcon className="w-4 h-4" /> : (index + 1)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 font-medium">
                You're on fire! Practice daily to keep the flame alive.
            </p>
         </div>
      </div>

      {/* Daily Goal Calendar Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700 mb-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Goal Calendar</h2>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{monthNames[currentMonth]} {currentYear}</span>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-xs font-bold text-gray-400">{d}</div>
              ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 justify-items-center">
              {blanks.map((b) => <div key={`blank-${b}`} className="w-8 h-8"></div>)}
              {days.map((d) => {
                  const { classes, dateStr } = getDayClass(d);
                  return (
                      <div key={d} className={classes}>
                          {d}
                          {/* Checkmark for met goals */}
                          {isGoalMet(dateStr) && (
                              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700">
                                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Goal Met</span>
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100"></div>
                  <span>Today</span>
              </div>
          </div>
      </div>

      {/* Engage & Share Section */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Engage & Share</h2>
        <div className="flex space-x-4">
          <button className="flex-1 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1">
            <InviteIcon className="w-8 h-8 mb-2" />
            <span className="font-bold text-sm">Invite Friends</span>
          </button>
          <button 
            onClick={onShowLeaderboard}
            className="flex-1 flex flex-col items-center justify-center bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-1"
          >
            <TrophyIcon className="w-8 h-8 mb-2" />
            <span className="font-bold text-sm">Leaderboard</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProfileView;
