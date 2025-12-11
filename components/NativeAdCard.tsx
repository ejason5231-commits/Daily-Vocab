import React, { useEffect, useState } from 'react';
import { AdMob } from '@capacitor-community/admob';

// Production native ad unit (keep in sync with `App.tsx` / Android strings if you changed it)
const NATIVE_AD_UNIT_ID = 'ca-app-pub-3055032812859066/6800104806';

const NativeAdCard: React.FC = () => {
  const [loadResult, setLoadResult] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[AdMob] NativeAdCard: loading native ad...', NATIVE_AD_UNIT_ID);
        const res = await AdMob.loadNativeAd({ adId: NATIVE_AD_UNIT_ID });
        console.log('[AdMob] NativeAdCard load response:', res);
        if (mounted) setLoadResult(res);
      } catch (e) {
        console.error('[AdMob] NativeAdCard failed to load native ad:', e);
        if (mounted) setLoadResult(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Note: many AdMob native implementations render a native view on top of the WebView.
  // This component reserves the slot and logs the plugin response. If your plugin renders
  // the native view, you may not receive HTML image/text assets to render here.
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full min-h-[200px] flex flex-col justify-center items-center relative border border-gray-100 dark:border-gray-700">
      <div className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded">Ad</div>
      <div className="p-4 text-center w-full">
        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Sponsored</p>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg w-full">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl">📢</span>
            </div>
            <h3 className="text-md font-bold text-gray-800 dark:text-white mb-1">Native Ad Slot</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This area will display a native ad view on supported platforms.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-full transition-colors w-full max-w-[120px]">Visit</button>
          </div>
        </div>

        <div className="text-[10px] text-gray-300 dark:text-gray-600 mt-2 font-mono">
          {loadResult ? (
            <pre className="text-[10px] text-left max-h-24 overflow-auto">{JSON.stringify(loadResult)}</pre>
          ) : (
            <span>Loading ad...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NativeAdCard;
