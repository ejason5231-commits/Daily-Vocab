
import React from 'react';
import { LockIcon } from './icons';

interface DifficultyTabsProps {
    className?: string;
    selectedDifficulty: string;
    onSelectDifficulty: (level: string) => void;
    userPoints: number;
}

export const DifficultyTabs: React.FC<DifficultyTabsProps> = ({ 
    className = "", 
    selectedDifficulty, 
    onSelectDifficulty,
    userPoints 
}) => {
    const levels = [
        { id: 'A1-A2', label: 'A1-A2', requiredPoints: 0 },
        { id: 'B1', label: 'B1', requiredPoints: 1000 },
        { id: 'B2', label: 'B2', requiredPoints: 2000 },
        { id: 'C1', label: 'C1', requiredPoints: 3000 },
    ];

    return (
        <div className={`w-full flex justify-center items-center gap-2 ${className}`}>
            {levels.map((lvl) => {
                const isUnlocked = userPoints >= lvl.requiredPoints;
                const isSelected = selectedDifficulty === lvl.id;

                return (
                    <button
                        key={lvl.id}
                        onClick={() => isUnlocked && onSelectDifficulty(lvl.id)}
                        className={`
                            relative flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-95 border-b-4 flex flex-col items-center justify-center
                            ${isSelected 
                                ? 'bg-[#123499] text-white border-[#0a1f5e] shadow-blue-900/20' 
                                : isUnlocked
                                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-blue-200'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-900 cursor-not-allowed'}
                        `}
                        disabled={!isUnlocked}
                    >
                        <div className="flex items-center justify-center whitespace-nowrap">
                            {!isUnlocked && <LockIcon className="w-3 h-3 mr-1 opacity-70" />}
                            <span>{lvl.label}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
