import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'PadPet',
  webDir: 'www',
    plugins: {
    Keyboard: {
      resize: 'ionic'  
    }
  }
};

export default config;
