import React, { useMemo } from 'react';
import { LeaderboardEntry } from '../types';
import { FAKE_LEADERBOARD_USERS } from '../gamificationConstants';
import { LeaderboardIcon, TrophyIcon } from './icons';

interface LeaderboardViewProps {
  userName: string;
  userPoints: number;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userName, userPoints }) => {
  const leaderboardData: LeaderboardEntry[] = useMemo(() => {
    const userEntry: LeaderboardEntry = { name: userName, points: userPoints, isUser: true };
    const combined = [...FAKE_LEADERBOARD_USERS, userEntry];
    return combined.sort((a, b) => b.points - a.points);
  }, [userName, userPoints]);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center flex items-center justify-center">
        <LeaderboardIcon className="h-8 w-8 mr-3" />
        Leaderboard
      </h2>
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <ol className="space-y-3">
          {leaderboardData.map((entry, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <li
                key={index}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${entry.isUser ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}
              >
                <div className="flex items-center w-12 text-lg font-bold">
                  {isTopThree ? (
                    <TrophyIcon className={`h-6 w-6 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-yellow-600'}`} />
                  ) : (
                    <span className="w-6 text-center text-gray-500 dark:text-gray-400">{rank}</span>
                  )}
                </div>
                <div className="flex-grow font-semibold text-gray-800 dark:text-white">
                  {entry.name} {entry.isUser && "(You)"}
                </div>
                <div className="text-lg font-bold text-primary-500 dark:text-primary-400">
                  {entry.points.toLocaleString()}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default LeaderboardView;
