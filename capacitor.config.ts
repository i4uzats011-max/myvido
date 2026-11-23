import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.focustube.app',
  appName: 'FocusTube',
  webDir: 'out',
  server: {
    // When running the mobile app connected to your live deployed Vercel site
    url: 'https://focustube.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#0f0f0f',
  }
};

export default config;
