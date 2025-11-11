import React from 'react';
import { QuizResult } from '../types';
import { QuizIcon } from './icons';

interface HistoryViewProps {
  history: QuizResult[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Quiz History</h2>
        <p className="text-gray-600 dark:text-gray-400">Complete a quiz to see your results here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Quiz History</h2>
      <div className="space-y-4">
        {history.map((result, index) => {
          const percentage = result.totalQuestions > 0 ? (result.score / result.totalQuestions) * 100 : 0;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4 transition-transform duration-200 hover:scale-105">
              <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <QuizIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 dark:text-white pr-2">{result.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(result.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                  <span>Score: <span className="font-bold">{result.score} / {result.totalQuestions}</span></span>
                  <span className="font-bold text-lg text-primary-500">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
