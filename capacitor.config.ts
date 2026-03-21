import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.golfbuddy.app',
  appName: 'GolfBuddy',
  webDir: 'dist',
  server: {
    // For production, remove this block.
    // For dev, uncomment the url line below and run `npm run dev` first:
    // url: 'http://YOUR_LOCAL_IP:5173',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#064e3b',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#064e3b',
    },
  },
};

export default config;
