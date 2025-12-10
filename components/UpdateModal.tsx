import React from 'react';

interface UpdateModalProps {
  isOpen: boolean;
  isForceUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  onUpdate: () => void;
  onSkip?: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  isForceUpdate,
  latestVersion,
  currentVersion,
  onUpdate,
  onSkip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-11/12 border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-400 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">
          {isForceUpdate ? 'Update Required' : 'New Version Available'}
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
          {isForceUpdate
            ? `You must update to version ${latestVersion} to continue using the app.`
            : `A new version (${latestVersion}) is available with improvements and bug fixes.`}
        </p>

        {/* Version Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Version</p>
          <p className="font-bold text-gray-900 dark:text-white">{currentVersion}</p>
          <div className="flex justify-center my-2">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latest Version</p>
          <p className="font-bold text-blue-600 dark:text-blue-400">{latestVersion}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {!isForceUpdate && onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors duration-200"
            >
              Later
            </button>
          )}
          <button
            onClick={onUpdate}
            className="flex-1 py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-200 active:scale-95"
          >
            {isForceUpdate ? 'Update Now' : 'Update'}
          </button>
        </div>

        {isForceUpdate && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            This update is required to use Daily Vocab. You cannot proceed without updating.
          </p>
        )}
      </div>
    </div>
  );
};

export default UpdateModal;
