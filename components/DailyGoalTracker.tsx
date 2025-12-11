
import React from 'react';
import { DailyGoal, DailyProgress } from '../types';
import { CheckCircleIconSolid, QuizIcon, SparklesIcon } from './icons';

const DailyGoalTracker: React.FC<{ goal: DailyGoal; progress: DailyProgress; onGoalComplete?: () => void }> = ({ goal, progress, onGoalComplete }) => {
  const isGoalCompleted = () => {
    if (goal.type === 'words') {
      return progress.wordsLearnedCount >= goal.value;
    }
    return progress.quizzesCompletedCount >= goal.value;
  };

  // Trigger callback when goal is completed
  React.useEffect(() => {
    if (isGoalCompleted() && onGoalComplete) {
      onGoalComplete();
    }
  }, [progress.wordsLearnedCount, progress.quizzesCompletedCount, goal, onGoalComplete]);

  const progressValue = goal.type === 'words' ? progress.wordsLearnedCount : progress.quizzesCompletedCount;
  const percentage = goal.value > 0 ? (progressValue / goal.value) * 100 : 0;
  const goalText = `Learn ${goal.value} new words`;
  const quizGoalText = `Complete ${goal.value} quizzes`;

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-2 ${isGoalCompleted() ? 'border-green-500' : 'border-transparent'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Today's Goal</h3>
        {isGoalCompleted() && (
          <div className="flex items-center space-x-1 text-green-500">
            <CheckCircleIconSolid className="h-5 w-5" />
            <span className="font-semibold text-sm">Complete!</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3 mb-2">
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${goal.type === 'words' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
            {goal.type === 'words' ? 
                <SparklesIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" /> : 
                <QuizIcon className="h-5 w-5 text-purple-500 dark:text-purple-300" />
            }
        </div>
        <span className="text-gray-700 dark:text-gray-300 font-medium">
            {goal.type === 'words' ? goalText : quizGoalText}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>Progress</span>
        <span className="font-semibold">{Math.min(progressValue, goal.value)} / {goal.value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${isGoalCompleted() ? 'bg-green-500' : 'bg-primary-500'}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalTracker;
