import React from 'react';

// Google Test Ad Unit ID for Native Advanced
export const NATIVE_TEST_ID = 'ca-app-pub-3940256099942544/2247696110';

const NativeAdCard: React.FC = () => {
  // NOTE: True Native Ads in Capacitor are rendered as native views on top of the WebView.
  // Embedding them in a scrollable list (like this grid) requires advanced handling 
  // (e.g. updating positions on scroll) which can be janky or requires specific plugin support.
  //
  // For this UI, we are reserving the slot where the Native Ad would be placed.
  // In a production scenario, you might use a Banner (MREC size) here or a specialized 
  // Native Ad component if your plugin version supports web-component embedding.

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full min-h-[200px] flex flex-col justify-center items-center relative border border-gray-100 dark:border-gray-700">
      <div className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
        Ad
      </div>
      <div className="p-4 text-center w-full">
        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Sponsored</p>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg w-full">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">📢</span>
                </div>
                <h3 className="text-md font-bold text-gray-800 dark:text-white mb-1">Google Native Ad</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This is a test ad placeholder.</p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-full transition-colors w-full max-w-[120px]">
                    Install
                </button>
            </div>
        </div>
        
        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-2 font-mono">ID: {NATIVE_TEST_ID}</p>
      </div>
    </div>
  );
};

export default NativeAdCard;
