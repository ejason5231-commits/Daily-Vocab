package com.eric.dailyvocab;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.admob.AdMob;

import java.security.MessageDigest;
import java.util.Arrays;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdMob.class);
        super.onCreate(savedInstanceState);

        // --- Your existing Facebook KeyHash code ---
        try {
            PackageInfo info = getPackageManager().getPackageInfo(
                    "com.eric.dailyvocab",
                    PackageManager.GET_SIGNATURES);

            if (info != null && info.signatures != null) {
                for (Signature signature : info.signatures) {
                    MessageDigest md = MessageDigest.getInstance("SHA");
                    md.update(signature.toByteArray());
                    Log.d("KeyHash:", Base64.encodeToString(md.digest(), Base64.DEFAULT));
                }
            }
        } catch (Exception e) {
            Log.e("KeyHash", "Exception while generating KeyHash", e);
        }
    }
}
