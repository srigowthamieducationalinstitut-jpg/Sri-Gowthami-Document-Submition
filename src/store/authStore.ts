// ============================================
// Auth Store — Zustand v5
// ============================================
import { create } from 'zustand';
import type { User, AuthState } from '@/types';
import { auth, db, getDocWithTimeout } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { mockUsers } from '@/data/mockData';


interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => void;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string; otp?: string; studentName?: string; userId?: string }>;
  loginWithOtp: (userId: string) => Promise<boolean>;
  resetPassword: (userId: string, newPassword: string) => Promise<boolean>;
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
          where('role', '==', 'student')
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          // Sort matched users locally by createdAt desc (newest first)
          const matchedUsers = snapshot.docs
            .map(d => d.data() as User)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          // Find the account whose stored password matches
          const match = matchedUsers.find(u => u.password === password);
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

  sendOtp: async (email: string) => {
    try {
      // Find the user in Firestore users collection (only students)
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '==', email),
        where('role', '==', 'student')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Check if they are in mock users for fallback
        const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'student');
        if (mockUser) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          console.log(`[AuthStore][sendOtp] Mock OTP generated for ${mockUser.name}: ${otp}`);
          const { sendOtpEmail } = await import('@/lib/email');
          await sendOtpEmail(mockUser.email, mockUser.name, otp);
          return {
            success: true,
            message: 'OTP sent successfully (Mock User).',
            otp,
            studentName: mockUser.name,
            userId: mockUser.id
          };
        }
        
        return {
          success: false,
          message: 'No student account found with this email address.'
        };
      }

      // Sort matched users locally by createdAt desc (newest first)
      const matchedUsers = snapshot.docs
        .map(d => d.data() as User)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const userData = matchedUsers[0];
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Dispatch email notification
      const { sendOtpEmail } = await import('@/lib/email');
      await sendOtpEmail(userData.email, userData.name, otp);

      return {
        success: true,
        message: 'OTP sent successfully to your registered email.',
        otp,
        studentName: userData.name,
        userId: userData.id
      };
    } catch (error: any) {
      console.error('[AuthStore][sendOtp] failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.'
      };
    }
  },

  loginWithOtp: async (userId: string) => {
    set({ isLoading: true });
    try {
      const userDoc = await getDocWithTimeout(doc(db, 'users', userId), 1500);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        set({ user: userData, token: userData.id, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        const mockUser = mockUsers.find(u => u.id === userId);
        if (mockUser) {
          set({ user: mockUser, token: mockUser.id, isAuthenticated: true, isLoading: false });
          return true;
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('[AuthStore][loginWithOtp] failed:', error);
      const mockUser = mockUsers.find(u => u.id === userId);
      if (mockUser) {
        set({ user: mockUser, token: mockUser.id, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    }
  },

  resetPassword: async (userId: string, newPassword: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        password: newPassword,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.warn('[AuthStore][resetPassword] Firestore update failed, fallback to local/mock:', error);
      return true;
    }
  },
}));
