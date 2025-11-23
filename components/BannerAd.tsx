import React, { useEffect } from 'react';
import { pushAd, BANNER_AD_UNIT } from '../services/adService';

const AD_CLIENT = 'ca-pub-3055032812859066';

const BannerAd: React.FC = () => {
    useEffect(() => {
        const adTimer = setTimeout(() => {
            pushAd();
        }, 100);
        return () => clearTimeout(adTimer);
    }, []);

    return (
        <div className="w-full flex justify-center pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-blue-50 dark:bg-gray-900">
            <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '320px', height: '50px' }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={BANNER_AD_UNIT}
            ></ins>
        </div>
    );
};

export default BannerAd;