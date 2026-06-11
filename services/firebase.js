import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA-uu9a8uftlS8G7Ll4emTaMOsU-JGFYL4",
  authDomain: "lord-15ca8.firebaseapp.com",
  projectId: "lord-15ca8",
  storageBucket: "lord-15ca8.firebasestorage.app",
  messagingSenderId: "900619146694",
  appId: "1:900619146694:web:5abc4720843adadcc64ec7",
  measurementId: "G-X9B9R6R2GD",
};

export const firebaseReady = true;
export const firebaseConfigError = '';
export const firebaseProjectInfo = firebaseConfig.projectId;

const existingApp = getApps().find((item) => item.name === '[DEFAULT]');
const app = existingApp || initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_error) {
  auth = getAuth(app);
}

let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({ forceOwnership: true }),
    }),
  });
} catch (_error) {
  const { getFirestore } = require('firebase/firestore');
  db = getFirestore(app);
}

export { app, auth, db };
