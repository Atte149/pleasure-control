import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pleasurecontrol.app',
  appName: 'Pleasure Control',
  webDir: 'dist',
  android: {
    // Intiface uses an unencrypted ws:// websocket; Android blocks cleartext by
    // default, so allow it for the app to reach the desktop server over LAN.
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;

