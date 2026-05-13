import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';
// import config from './config.json';
import firebaseConfig from './firebaseConfig';

export let firebaseApp;
if (firebaseConfig.projectId) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export let messaging;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && firebaseApp) {
  messaging = getMessaging(firebaseApp);
} else {
  console.warn('Service workers are not supported or Firebase is not initialized.');
}

export const requestPermission = async () => {
  if (typeof window === 'undefined') return;

  const permission = await Notification.requestPermission();
  try {
    if (permission === 'granted' && messaging) {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      });
      return token;
    } else {
      console.log('Permission failed or messaging not initialized');
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } else {
      reject(new Error('Firebase messaging is not initialized or supported in this environment.'));
    }
  });
