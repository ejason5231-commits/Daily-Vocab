
declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AD_CLIENT = 'ca-pub-3055032812859066';
export const BANNER_AD_UNIT = '7004729371';
export const REWARDED_AD_UNIT = '6847557528';
export const INTERSTITIAL_AD_UNIT = '5534475851';

export const pushAd = () => {
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('Could not push ad:', e);
    }
};

export const showInterstitialAd = () => {
    console.log("Attempting to show interstitial ad...");
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: AD_CLIENT,
            google_ad_slot: INTERSTITIAL_AD_UNIT,
            google_ad_format: 'auto',
            google_ad_scene: 'interstitial',
        });
        console.log("Interstitial ad request pushed.");
    } catch (e) {
        console.error("Could not show interstitial ad", e);
    }
};

export const showRewardAd = (onRewarded: () => void, onFailed?: () => void) => {
    console.log("Attempting to show rewarded ad...");
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: AD_CLIENT,
            google_ad_slot: REWARDED_AD_UNIT,
            google_ad_format: 'auto',
            google_rewarded_ad_callbacks: {
                on_load: () => {
                    console.log('Rewarded ad loaded.');
                },
                on_reward: (reward: any) => {
                    console.log('User earned reward!', reward);
                    onRewarded();
                },
                on_close: () => {
                    console.log('Rewarded ad closed.');
                },
                on_error: (error: any) => {
                    console.error('Rewarded ad error:', error);
                    if (onFailed) onFailed();
                }
            }
        });
    } catch (e) {
        console.error("Could not push rewarded ad request", e);
        if (onFailed) onFailed();
    }
};
