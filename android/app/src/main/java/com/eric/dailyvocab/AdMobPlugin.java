package com.eric.dailyvocab;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AdMobPlugin")
public class AdMobPlugin extends Plugin {

    @PluginMethod()
    public void showRewardedInterstitialAd(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            ((MainActivity) getActivity()).showRewardedInterstitialAd();
        });
        call.resolve();
    }

    @PluginMethod()
    public void showRewardedAd(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            ((MainActivity) getActivity()).showRewardedAd();
        });
        call.resolve();
    }

    @PluginMethod()
    public void showInterstitialAd(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            ((MainActivity) getActivity()).showInterstitialAd();
        });
        call.resolve();
    }
}
