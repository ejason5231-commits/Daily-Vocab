import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eric.dailyvocab',
  appName: 'Daily Vocab',
  webDir: 'dist',                    // ← change only if your build folder is different (dist, build, etc.)
  server: {
    androidScheme: 'https'
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  }
};

export default config;