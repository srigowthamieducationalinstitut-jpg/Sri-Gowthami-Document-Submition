// ============================================
// Auth Store — Zustand v5
// ============================================
import { create } from 'zustand';
import type { User, AuthState } from '@/types';
import { auth, db, getDocWithTimeout } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { mockUsers } from '@/data/mockData';


interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // --- State ---
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state until initAuth determines authentication status

  // --- Actions ---
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      const userDoc = await getDocWithTimeout(doc(db, 'users', firebaseUser.uid), 1500);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        console.error(`User profile not found in Firestore for UID: ${firebaseUser.uid}`);
        await signOut(auth);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch (firebaseAuthError) {
      // Firebase Auth failed — try Firestore-native student accounts
      // (registered without Firebase Auth to allow duplicate emails)
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('email', '==', email),
          where('role', '==', 'student'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          // Find the account whose stored password matches
          const match = snapshot.docs
            .map(d => d.data() as User)
            .find(u => u.password === password);
          if (match) {
            set({ user: match, token: match.id, isAuthenticated: true, isLoading: false });
            return true;
          }
        }
      } catch (firestoreError) {
        console.warn('Firestore student lookup failed:', firestoreError);
      }

      // Final fallback: mock users (for demo/dev)
      const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (mockUser) {
        console.log('Falling back to mock login:', mockUser);
        set({ user: mockUser, token: 'mock-token', isAuthenticated: true, isLoading: false });
        return true;
      }

      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initAuth: () => {
    set({ isLoading: true });
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const userDoc = await getDocWithTimeout(doc(db, 'users', firebaseUser.uid), 1500);
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({
              user: userData,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            console.error(`User profile document not found in Firestore for UID: ${firebaseUser.uid}`);
            const mockUser = firebaseUser.email
              ? mockUsers.find(u => u.email.toLowerCase() === firebaseUser.email!.toLowerCase())
              : null;
            if (mockUser) {
              console.log('User profile document not found. Falling back to mock user:', mockUser);
              set({
                user: mockUser,
                token: 'mock-token',
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile during initialization:', error);
          const mockUser = firebaseUser.email
            ? mockUsers.find(u => u.email.toLowerCase() === firebaseUser.email!.toLowerCase())
            : null;
          if (mockUser) {
            console.log('Falling back to mock user profile:', mockUser);
            set({
              user: mockUser,
              token: 'mock-token',
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
  },
}));
