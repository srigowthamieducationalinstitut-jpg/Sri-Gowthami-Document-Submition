import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

// Helper to manually parse the .env file
const envConfig = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      envConfig[key] = val;
    }
  });
} catch (err) {
  console.error('Failed to read .env file:', err);
  process.exit(1);
}

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
  measurementId: envConfig.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const demoUsers = [
  {
    email: 'quintexxsolutions@gmail.com',
    password: 'Test@1234',
    name: 'Super Admin',
    role: 'super_admin',
    phone: '+91 9999999999',
  },
  {
    email: 'admissions@srigowthami.edu.in',
    password: 'Test@1234',
    name: 'Admission Officer',
    role: 'admission_officer',
    phone: '+91 8888888888',
  },
  {
    email: 'verify@srigowthami.edu.in',
    password: 'Test@1234',
    name: 'Verification Officer',
    role: 'verification_officer',
    phone: '+91 7777777777',
  },
  {
    email: 'student@example.com',
    password: 'Test@1234',
    name: 'Demo Student',
    role: 'student',
    phone: '+91 6666666666',
  }
];

async function seed() {
  console.log('[Seed] Starting Firebase Authentication & Firestore seeding...');
  for (const user of demoUsers) {
    try {
      console.log(`[Seed] Registering user in Firebase Auth: ${user.email}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const firebaseUser = userCredential.user;
      
      console.log(`[Seed] Creating Firestore profile for UID: ${firebaseUser.uid}...`);
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Seed] Successfully seeded: ${user.email}`);
      await signOut(auth);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`[Seed] User ${user.email} already exists in Firebase Auth.`);
      } else {
        console.error(`[Seed] Error seeding ${user.email}:`, error.message || error);
      }
    }
  }
  console.log('[Seed] Seeding completed.');
  process.exit(0);
}

seed();
