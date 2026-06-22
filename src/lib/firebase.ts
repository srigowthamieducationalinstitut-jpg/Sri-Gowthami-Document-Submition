import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics: Analytics | null = null;
isSupported().then((supported: boolean) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err: unknown) => {
  console.error('Firebase Analytics is not supported in this environment:', err);
});

import { getDoc, getDocs } from 'firebase/firestore';

export async function getDocWithTimeout(docRef: any, timeoutMs = 1500) {
  return Promise.race([
    getDoc(docRef),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore getDoc timed out')), timeoutMs)
    ),
  ])
}

export async function getDocsWithTimeout(query: any, timeoutMs = 1500) {
  return Promise.race([
    getDocs(query),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore getDocs timed out')), timeoutMs)
    ),
  ])
}

export { app, auth, db, analytics };

