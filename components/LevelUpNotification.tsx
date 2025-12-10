
import React, { useState, useEffect } from 'react';
import { TrophyIcon } from './icons';

interface LevelUpNotificationProps {
  notification: { level: number; categoryName: string } | null;
  onDismiss: () => void;
  onStartNextLevel?: (level: number) => void;
}

const playLevelUpSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'triangle'; // A softer, more "game-like" sound
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 for a happy arpeggio
    const now = audioCtx.currentTime;
    let startTime = now;

    notes.forEach((note) => {
      gainNode.gain.setValueAtTime(0.2, startTime);
      oscillator.frequency.setValueAtTime(note, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      startTime += 0.1;
    });

    oscillator.start(now);
    oscillator.stop(startTime);
  } catch (e) {
    console.error("Could not play level up sound:", e);
  }
};

const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({ notification, onDismiss, onStartNextLevel }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: number;
    if (notification) {
      setIsVisible(true);
      playLevelUpSound();
      timer = window.setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade-out animation before calling onDismiss
        setTimeout(onDismiss, 300);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const cartoonIcon = () => (
    <div className="relative">
      <TrophyIcon className="h-10 w-10 text-yellow-400" />
      <span className="absolute -top-1 -right-1 text-2xl animate-pulse">🎉</span>
    </div>
  );

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
    >
      {notification && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 flex items-center space-x-4 border-2 border-primary-500">
          <div className="flex-shrink-0">
            {cartoonIcon()}
          </div>
          <div>
            <p className="font-bold text-primary-500 text-sm">LEVEL UNLOCKED!</p>
            <p className="font-semibold text-gray-800 dark:text-white">Congratulations! You've unlocked Level {notification.level}.</p>
            {onStartNextLevel && (
              <div className="mt-2">
                <button onClick={() => onStartNextLevel(notification.level)} className="px-3 py-2 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-lg font-bold">Start Level {notification.level}</button>
              </div>
            )}
          </div>
          <button onClick={onDismiss} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default LevelUpNotification;
