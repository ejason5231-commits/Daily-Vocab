
declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AD_CLIENT = 'ca-pub-3055032812859066';
export const BANNER_AD_UNIT = '7004729371';
export const REWARDED_AD_UNIT = '6847557528';
export const INTERSTITIAL_AD_UNIT = '5534475851';
export const REWARDED_INTERSTITIAL_AD_UNIT = '1105110403';

export const pushAd = () => {
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('Could not push ad:', e);
    }
};

const prepareProgrammaticAdSlot = (adSlotId: string): HTMLElement => {
    let container = document.getElementById('programmatic-ad-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'programmatic-ad-container';
        document.body.appendChild(container);
    }
    
    // Clear any previous ad slot from the container
    container.innerHTML = '';
    
    // We create a fresh <ins> tag for the ad. This is to avoid the
    // "All 'ins' elements... already have ads" error by providing a clean slot
    // for the ad script to operate on, even for overlay ad formats.
    const adSlot = document.createElement('ins');
    adSlot.className = 'adsbygoogle';
    adSlot.style.display = 'none'; // Overlays don't need a visible slot
    adSlot.setAttribute('data-ad-client', AD_CLIENT);
    adSlot.setAttribute('data-ad-slot', adSlotId);
    container.appendChild(adSlot);

    return container;
};


export const showInterstitialAd = () => {
    console.log("Attempting to show interstitial ad...");
    try {
        prepareProgrammaticAdSlot(INTERSTITIAL_AD_UNIT);
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
        const container = prepareProgrammaticAdSlot(REWARDED_AD_UNIT);
        
        const cleanup = () => {
            if (container) {
                container.innerHTML = '';
            }
        };

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
                    cleanup();
                },
                on_error: (error: any) => {
                    console.error('Rewarded ad error:', error);
                    if (onFailed) onFailed();
                    cleanup();
                }
            }
        });
    } catch (e) {
        console.error("Could not push rewarded ad request", e);
        if (onFailed) onFailed();
    }
};

export const showRewardedInterstitialAd = (onRewarded: () => void, onFailed?: () => void) => {
    console.log("Attempting to show rewarded interstitial ad...");
    try {
        const container = prepareProgrammaticAdSlot(REWARDED_INTERSTITIAL_AD_UNIT);
        
        const cleanup = () => {
            if (container) {
                container.innerHTML = '';
            }
        };

        (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: AD_CLIENT,
            google_ad_slot: REWARDED_INTERSTITIAL_AD_UNIT,
            google_ad_format: 'auto',
            google_rewarded_ad_callbacks: {
                on_load: () => {
                    console.log('Rewarded interstitial ad loaded.');
                },
                on_reward: (reward: any) => {
                    console.log('User earned reward from interstitial!', reward);
                    onRewarded();
                },
                on_close: () => {
                    console.log('Rewarded interstitial ad closed.');
                    cleanup();
                },
                on_error: (error: any) => {
                    console.error('Rewarded interstitial ad error:', error);
                    if (onFailed) onFailed();
                    cleanup();
                }
            }
        });
    } catch (e) {
        console.error("Could not push rewarded interstitial ad request", e);
        if (onFailed) onFailed();
    }
};
