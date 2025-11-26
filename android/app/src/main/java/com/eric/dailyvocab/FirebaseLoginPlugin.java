package com.eric.dailyvocab;

import android.content.Intent;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;

@CapacitorPlugin(name = "FirebaseLogin")
public class FirebaseLoginPlugin extends Plugin {

    private GoogleSignInClient mGoogleSignInClient;
    private FirebaseAuth mAuth;
    private ActivityResultLauncher<Intent> signInLauncher;

    @Override
    public void load() {
        super.load();
        mAuth = FirebaseAuth.getInstance();

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getContext().getString(R.string.default_web_client_id))
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(getActivity(), gso);

        signInLauncher = getActivity().registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                    try {
                        GoogleSignInAccount account = task.getResult(ApiException.class);
                        if (account != null && account.getIdToken() != null) {
                            firebaseAuthWithGoogle(account.getIdToken());
                        } else {
                            JSObject errorObj = new JSObject();
                            errorObj.put("error", "Google sign-in failed (no id token)");
                            notifyListeners("googleSignInFailed", errorObj);
                        }
                    } catch (ApiException e) {
                        JSObject errorObj = new JSObject();
                        errorObj.put("error", e.getMessage());
                        notifyListeners("googleSignInFailed", errorObj);
                    }
                });
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        signInLauncher.launch(signInIntent);
        call.resolve();
    }

    private void firebaseAuthWithGoogle(String idToken) {
        AuthCredential credential = GoogleAuthProvider.getCredential(idToken, null);
        mAuth.signInWithCredential(credential)
                .addOnCompleteListener(getActivity(), task -> {
                    if (task.isSuccessful()) {
                        FirebaseUser user = mAuth.getCurrentUser();
                        JSObject userJson = new JSObject();
                        if (user != null) {
                            userJson.put("displayName", user.getDisplayName());
                            userJson.put("email", user.getEmail());
                            if (user.getPhotoUrl() != null) {
                                userJson.put("photoUrl", user.getPhotoUrl().toString());
                            } else {
                                userJson.put("photoUrl", "");
                            }
                        }
                        notifyListeners("googleSignInSuccess", userJson);
                    } else {
                        JSObject errorObj = new JSObject();
                        errorObj.put("error", "Firebase authentication failed");
                        notifyListeners("googleSignInFailed", errorObj);
                    }
                });
    }
}
