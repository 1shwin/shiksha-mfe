import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';
// import config from './config.json';
import firebaseConfig from './firebaseConfig';

let firebaseApp;
if (firebaseConfig.projectId) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}
let messaging;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && firebaseApp) {
  messaging = getMessaging(firebaseApp);
} else {
  console.warn('Service workers are not supported or Firebase is not initialized.');
}

export const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  try {
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      });
      return token;
    } else {
      console.log('Permission failed');
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {

      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
