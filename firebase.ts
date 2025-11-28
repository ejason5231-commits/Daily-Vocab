import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// TODO: Replace with your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBMQQwoY7zSj8HLfW9DL1Lf08kvURBdO4g",
      authDomain: "daily-vocab-81a98.firebaseapp.com",
      projectId: "daily-vocab-81a98",
      storageBucket: "daily-vocab-81a98.firebasestorage.app",
      messagingSenderId: "209806154102",
      appId: "1:209806154102:web:88e513cf0849684a474257",
      measurementId: "G-QZMQFLCE4X"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
