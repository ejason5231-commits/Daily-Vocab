package com.eric.dailyvocab;

import android.Manifest;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;

import androidx.activity.result.contract.ActivityResultContracts;

import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
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

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MainActivity extends BridgeActivity {
    private static final long AD_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
    private long lastAdShownTime = 0;

    private RewardedInterstitialAd rewardedInterstitialAd;
    private RewardedAd rewardedAd;
    private InterstitialAd mInterstitialAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            PackageInfo info = getPackageManager().getPackageInfo(
                    "com.eric.dailyvocab",
                    PackageManager.GET_SIGNATURES);
            for (Signature signature : info.signatures) {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                Log.d("KeyHash:", Base64.encodeToString(md.digest(), Base64.DEFAULT));
            }
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }

        registerForActivityResult(
            new ActivityResultContracts.RequestPermission(),
            isGranted -> {}
        ).launch(Manifest.permission.RECORD_AUDIO);

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
