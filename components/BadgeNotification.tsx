import React, { useState, useEffect } from 'react';
import { Badge } from '../types';
import { TrophyIcon } from './icons';

interface BadgeNotificationProps {
  badge: Badge | null;
  onDismiss: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fix: Changed NodeJS.Timeout to `number` for browser compatibility.
    let timer: number;
    if (badge) {
      setIsVisible(true);
      timer = window.setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade-out animation before calling onDismiss
        setTimeout(onDismiss, 300);
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
    >
      {badge && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 flex items-center space-x-4 border-2 border-yellow-400">
          <div className="flex-shrink-0 text-3xl">{badge.emoji}</div>
          <div>
            <p className="font-bold text-yellow-500 text-sm">BADGE UNLOCKED!</p>
            <p className="font-semibold text-gray-800 dark:text-white">{badge.name}</p>
          </div>
          <button onClick={onDismiss} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default BadgeNotification;
