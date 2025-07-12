import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omareltattar.workouttracker',
  appName: 'Workout Tracker',
  webDir: 'build',
  server: {
    cleartext: true,
    allowNavigation: [
      'workout-tracker-1-zqp2.onrender.com',
      'localhost'
    ]
  }
};

export default config;
