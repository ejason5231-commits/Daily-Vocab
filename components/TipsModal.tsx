
import React from 'react';
import { SparklesIcon, QuizIcon, HeadphonesIcon, CloseIcon, CheckCircleIconSolid } from './icons';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: 'home' | 'quiz' | 'podcast' | 'profile') => void;
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleAction = (tab: 'home' | 'quiz' | 'podcast' | 'profile') => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-scale-in border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full z-10"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-2">
            Welcome! 🚀
          </h2>
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            Tips to improve your English
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => handleAction('home')}
            className="w-full flex items-center bg-blue-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-blue-100 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] text-left group"
          >
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-full mr-3 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">1. Learn Daily Vocab</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Go to Dashboard</p>
            </div>
          </button>

          <button 
            onClick={() => handleAction('quiz')}
            className="w-full flex items-center bg-purple-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-purple-100 dark:border-gray-600 hover:bg-purple-100 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] text-left group"
          >
            <div className="bg-purple-100 text-purple-600 p-2.5 rounded-full mr-3 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
              <QuizIcon className="w-6 h-6" />
            </div>
            <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">2. Take Quizzes</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start a Quiz</p>
            </div>
          </button>

          <button 
            onClick={() => handleAction('podcast')}
            className="w-full flex items-center bg-red-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-red-100 dark:border-gray-600 hover:bg-red-100 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] text-left group"
          >
            <div className="bg-red-100 text-red-600 p-2.5 rounded-full mr-3 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
              <HeadphonesIcon className="w-6 h-6" />
            </div>
             <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">3. Listen to Podcasts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse Podcasts</p>
            </div>
          </button>

          <button 
            onClick={() => handleAction('profile')}
            className="w-full flex items-center bg-green-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-green-100 dark:border-gray-600 hover:bg-green-100 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] text-left group"
          >
            <div className="bg-green-100 text-green-600 p-2.5 rounded-full mr-3 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircleIconSolid className="w-6 h-6" />
            </div>
             <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">4. Check your Daily Goal</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">View Profile</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;
