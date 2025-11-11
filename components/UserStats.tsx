import React from 'react';
import { DailyGoal, DailyProgress } from '../types';
import { CheckCircleIconSolid, QuizIcon, SparklesIcon } from './icons';

interface UserStatsProps {
  userName: string;
  userPoints: number;
  goal: DailyGoal;
  progress: DailyProgress;
}

const UserStats: React.FC<UserStatsProps> = ({ userName, userPoints, goal, progress }) => {
  const isGoalCompleted = goal.type === 'words' 
    ? progress.wordsLearnedCount >= goal.value 
    : progress.quizzesCompletedCount >= goal.value;
  
  const progressValue = goal.type === 'words' ? progress.wordsLearnedCount : progress.quizzesCompletedCount;
  const percentage = goal.value > 0 ? (progressValue / goal.value) * 100 : 0;
  const goalText = goal.type === 'words' ? `Learn ${goal.value} new words` : `Complete ${goal.value} quizzes`;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Welcome, {userName}!</h3>
            <p className="text-sm text-yellow-500 font-semibold">{userPoints.toLocaleString()} Points</p>
          </div>
          {/* Fix: Removed parentheses from isGoalCompleted as it is a boolean constant. */}
          {isGoalCompleted && (
            <div className="flex items-center space-x-1 text-green-500 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
              <CheckCircleIconSolid className="h-4 w-4" />
              <span className="font-semibold text-xs">Goal Met!</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3 my-3">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${goal.type === 'words' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
              {goal.type === 'words' 
                  ? <SparklesIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" /> 
                  : <QuizIcon className="h-5 w-5 text-purple-500 dark:text-purple-300" />
              }
          </div>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Today's Goal: {goalText}
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold">{Math.min(progressValue, goal.value)} / {goal.value}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
              // Fix: Removed parentheses from isGoalCompleted as it is a boolean constant.
              className={`h-2.5 rounded-full transition-all duration-500 ${isGoalCompleted ? 'bg-green-500' : 'bg-primary-500'}`} 
              style={{ width: `${Math.min(percentage, 100)}%` }}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
