
import React, { useState, useRef } from 'react';
import {
  StarIcon, CoinIcon, FireIcon,
  InviteIcon, TrophyIcon, AvatarIcon, PencilIcon, CameraIcon, LoginIcon, LogoutIcon
} from './icons';

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
  onLogout
}) => {
  // Calculate XP Progress based on Level (assuming 500 XP per level)
  const xpPerLevel = 500;
  const currentLevelXP = userPoints % xpPerLevel;
  const xpPercentage = (currentLevelXP / xpPerLevel) * 100;

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logout Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handlePodcastClick = () => {
    window.open('https://youtube.com/@learnengwitheric?si=HebmKBv0XVOT6j6I', '_blank');
  };

  const podcastThumbnails = [
    {
      id: 1,
      title: "Daily Conversations",
      image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=500&q=60" // People talking
    },
    {
      id: 2,
      title: "Master Vocabulary",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=60" // Books/Learning
    },
    {
      id: 3,
      title: "Travel English",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=500&q=60" // Travel
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 pb-24 relative">

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

      {/* Header / User Info */}
      <div className="flex flex-col items-center mb-8 animate-fade-in-up">
        {/* Avatar Section */}
        <div
          className="w-24 h-24 mb-4 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center p-1 relative cursor-pointer group"
          onClick={handleImageClick}
        >
          <div className="w-full h-full rounded-full overflow-hidden relative">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <AvatarIcon className="w-full h-full text-gray-800 dark:text-gray-200" />
            )}

            {/* Overlay for Change Photo */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CameraIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Online Status Dot */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
        </div>

        {/* Name Section */}
        <div className="flex items-center justify-center mb-1">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                {userName}
              </h1>
              <PencilIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mt-1">
          Language Explorer
        </p>

        {/* Login/Logout Button */}
        <div className="mt-4">
          {!isLoggedIn ? (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-semibold shadow-md transition-transform transform active:scale-95"
            >
              <LoginIcon className="w-4 h-4" />
              <span>Log In</span>
            </button>
          ) : (
            <button
              onClick={handleLogoutClick}
              className="flex items-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-full font-semibold shadow-sm transition-transform transform active:scale-95"
            >
              <LogoutIcon className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics / Achievements (Three Card Layout) */}
      <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Level Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mb-2">
            <TrophyIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <span className="text-xs text-gray-400 font-semibold uppercase mb-1">Level</span>
          <span className="text-lg font-bold text-gray-800 dark:text-white">{userLevel}</span>
        </div>

        {/* Coins Card (Matches Quiz Task Bar Coins) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mb-2">
            <CoinIcon className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="text-xs text-gray-400 font-semibold uppercase mb-1">Coins</span>
          <span className="text-lg font-bold text-gray-800 dark:text-white">{userCoins.toLocaleString()}</span>
        </div>

        {/* XP Card (Matches Quiz Task Bar XP) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
            <StarIcon className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-xs text-gray-400 font-semibold uppercase mb-1">XP</span>
          <span className="text-lg font-bold text-gray-800 dark:text-white">{userPoints.toLocaleString()}</span>
        </div>
      </div>

      {/* Daily Streak Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Daily Streak</h2>
          <div className="flex items-center space-x-1 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg border border-orange-100 dark:border-orange-800">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600 dark:text-orange-400">{userStreak} Days</span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
          <span>XP Progress (Lvl {userLevel})</span>
          <span>{currentLevelXP}/{xpPerLevel}</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${xpPercentage}%` }}
          ></div>
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

      {/* Listen to Podcast Section (Scrollable Photos) */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          Listen to Podcast
          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">New Episodes</span>
        </h2>
        <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar touch-pan-x">
          {podcastThumbnails.map((item) => (
            <button
              key={item.id}
              onClick={handlePodcastClick}
              className="flex-shrink-0 w-64 h-40 relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Play Button Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 text-red-600 rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>

              {/* Text */}
              <div className="absolute bottom-0 left-0 p-4">
                <span className="text-[10px] font-bold text-red-500 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm mb-1 inline-block">WATCH NOW</span>
                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{item.title}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProfileView;
