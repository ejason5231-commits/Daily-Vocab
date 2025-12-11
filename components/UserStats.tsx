
import React from 'react';
import { DailyGoal, DailyProgress } from '../types';
import { CheckCircleIconSolid, QuizIcon, SparklesIcon } from './icons';

interface UserStatsProps {
  userName: string;
  userPoints: number;
  goal: DailyGoal;
  progress: DailyProgress;
  onGoalComplete?: () => void;
}

const UserStats: React.FC<UserStatsProps> = ({ userName, userPoints, goal, progress, onGoalComplete }) => {
  const isGoalCompleted = goal.type === 'words' 
    ? progress.wordsLearnedCount >= goal.value 
    : progress.quizzesCompletedCount >= goal.value;
  
  const progressValue = goal.type === 'words' ? progress.wordsLearnedCount : progress.quizzesCompletedCount;
  const percentage = goal.value > 0 ? (progressValue / goal.value) * 100 : 0;

  // Trigger callback when goal is completed
  React.useEffect(() => {
    if (isGoalCompleted && onGoalComplete) {
      onGoalComplete();
    }
  }, [progress.wordsLearnedCount, progress.quizzesCompletedCount, goal, onGoalComplete]);
  
  return (
    <div className="bg-white dark:bg-gray-800 py-3 px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-row items-center justify-between gap-4">
       {/* User Info */}
       <div className="flex flex-col">
          <div className="flex items-center space-x-2">
             <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">Hi, {userName}</span>
             {isGoalCompleted && <CheckCircleIconSolid className="h-4 w-4 text-green-500" />}
          </div>
          <div className="flex items-center space-x-2 mt-1">
             <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{userPoints.toLocaleString()} pts</span>
          </div>
       </div>

       {/* Goal Info - Right Aligned */}
       <div className="flex flex-col items-end flex-grow max-w-[60%] sm:max-w-[40%]">
          <div className="flex items-center space-x-1.5 mb-1.5">
            {goal.type === 'words' ? <SparklesIcon className="h-3 w-3 text-blue-500" /> : <QuizIcon className="h-3 w-3 text-purple-500" />}
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
               Goal: <span className="text-gray-700 dark:text-gray-200 font-bold">{progressValue}/{goal.value}</span> {goal.type === 'words' ? 'Words' : 'Quizzes'}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
             <div className={`h-full rounded-full transition-all duration-500 ${isGoalCompleted ? 'bg-green-500' : 'bg-primary-500'}`} style={{width: `${Math.min(percentage, 100)}%`}}></div>
          </div>
       </div>
    </div>
  );
};

export default UserStats;
