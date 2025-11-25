package com.eric.dailyvocab;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback;

public class MainActivity extends BridgeActivity {
    private static final long AD_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
    private long lastAdShownTime = 0;

    private RewardedInterstitialAd rewardedInterstitialAd;
    private RewardedAd rewardedAd;
    private InterstitialAd mInterstitialAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(AdMobPlugin.class);

        MobileAds.initialize(this, initializationStatus -> {});

        loadRewardedInterstitialAd();
        loadRewardedAd();
        loadInterstitialAd();
    }

    private void loadRewardedInterstitialAd() {
        RewardedInterstitialAd.load(this, "ca-app-pub-3055032812859066/1105110403",
                new AdRequest.Builder().build(), new RewardedInterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(RewardedInterstitialAd ad) {
                        rewardedInterstitialAd = ad;
                    }
                });
    }

    private void loadRewardedAd() {
        RewardedAd.load(this, "ca-app-pub-3055032812859066/6847557528",
                new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
                    @Override
                    public void onAdLoaded(RewardedAd ad) {
                        rewardedAd = ad;
                    }
                });
    }

    private void loadInterstitialAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        InterstitialAd.load(this, "ca-app-pub-3055032812859066/5534475851", adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(InterstitialAd interstitialAd) {
                        mInterstitialAd = interstitialAd;
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError loadAdError) {
                        mInterstitialAd = null;
                    }
                });
    }

    private boolean canShowAd() {
        return System.currentTimeMillis() - lastAdShownTime > AD_INTERVAL_MS;
    }

    public void showRewardedInterstitialAd() {
        if (rewardedInterstitialAd != null && canShowAd()) {
            rewardedInterstitialAd.show(this, rewardItem -> {
                // Handle the reward.
            });
            lastAdShownTime = System.currentTimeMillis();
            loadRewardedInterstitialAd();
        }
    }

    public void showRewardedAd() {
        if (rewardedAd != null && canShowAd()) {
            rewardedAd.show(this, rewardItem -> {
                // Handle the reward.
            });
            lastAdShownTime = System.currentTimeMillis();
            loadRewardedAd();
        }
    }

    public void showInterstitialAd() {
        if (mInterstitialAd != null && canShowAd()) {
            mInterstitialAd.show(this);
            lastAdShownTime = System.currentTimeMillis();
            loadInterstitialAd();
        }
    }
}
