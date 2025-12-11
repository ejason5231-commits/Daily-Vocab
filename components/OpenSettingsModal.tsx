import React from 'react';

interface OpenSettingsModalProps {
    isOpen: boolean;
    onOpenSettings: () => void;
    onCancel: () => void;
    isMiui?: boolean;
    onCheckPermission?: () => void;
}

const OpenSettingsModal: React.FC<OpenSettingsModalProps> = ({ isOpen, onOpenSettings, onCancel, isMiui, onCheckPermission }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enable microphone</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">To use speech or voice features on your device, enable microphone access for Daily Vocab in system settings.</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">If you have a Xiaomi/Redmi (MIUI) device, also check Privacy → Permission → Microphone and allow the app; sometimes MIUI requires enabling permissions separately.</p>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onOpenSettings}
                        className={`flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all`}
                    >
                        Open Settings
                    </button>
                    {isMiui && (
                        <button
                            onClick={onOpenSettings}
                            className="flex-1 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white font-bold rounded-xl transition-all"
                        >
                            Open MIUI Permission Page
                        </button>
                    )}
                    {onCheckPermission && (
                        <button
                            onClick={onCheckPermission}
                            className="flex-1 py-2 bg-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold"
                        >
                            Check Permission
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpenSettingsModal;
