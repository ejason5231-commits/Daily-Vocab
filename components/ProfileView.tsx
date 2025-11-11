import React, { useState } from 'react';
import { Badge } from '../types';
import { BADGES } from '../gamificationConstants';
import { TrophyIcon } from './icons';

interface ProfileViewProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  userPoints: number;
  earnedBadges: Set<string>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ userName, onUserNameChange, userPoints, earnedBadges }) => {
  const [nameInput, setNameInput] = useState(userName);

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUserNameChange(nameInput.trim());
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">My Profile</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleNameChange} className="flex-grow w-full sm:w-auto">
          <label htmlFor="userName" className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Name</label>
          <div className="flex gap-2 mt-1">
            <input
              id="userName"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow hover:bg-primary-600 transition-colors">
              Save
            </button>
          </div>
        </form>
        <div className="text-center sm:text-right">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
            <p className="text-3xl font-bold text-yellow-500">{userPoints.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-4 flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
            Badges ({earnedBadges.size} / {BADGES.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${isEarned ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                <div className={`text-4xl transition-transform duration-300 ${isEarned ? 'grayscale-0 scale-110' : 'grayscale'}`}>
                  {badge.emoji}
                </div>
                <p className={`mt-2 font-semibold text-sm ${isEarned ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {badge.name}
                </p>
                <p className={`mt-1 text-xs ${isEarned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
