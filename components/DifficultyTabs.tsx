import React from 'react';
import { LockIcon } from './icons';

interface DifficultyTabsProps {
    className?: string;
}

export const DifficultyTabs: React.FC<DifficultyTabsProps> = ({ className = "" }) => {
    const levels = [
        { id: 1, label: 'A1-A2', unlocked: true },
        { id: 2, label: 'B1', unlocked: false },
        { id: 3, label: 'B2', unlocked: false },
        { id: 4, label: 'C1', unlocked: false },
    ];

    return (
        <div className={`w-full flex justify-center items-center gap-2 ${className}`}>
            {levels.map((lvl) => (
                <button
                    key={lvl.id}
                    className={`
                        relative flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-95 border-b-4 flex flex-col items-center justify-center
                        ${lvl.unlocked 
                            ? 'bg-primary-500 text-white border-primary-700 hover:bg-primary-600 shadow-primary-500/20' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-400 dark:border-gray-800 cursor-not-allowed'}
                    `}
                    disabled={!lvl.unlocked}
                >
                    <div className="flex items-center justify-center whitespace-nowrap">
                        {!lvl.unlocked && <LockIcon className="w-3 h-3 mr-1 opacity-70" />}
                        <span>{lvl.label}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};
