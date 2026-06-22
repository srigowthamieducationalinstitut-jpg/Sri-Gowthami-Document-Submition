// ============================================
// Notification Store — Zustand v5 (Firestore)
// ============================================
import { create } from 'zustand';
import type { Notification } from '@/types';
import { db } from '@/lib/firebase';
import {
  collection, doc, setDoc, updateDoc, getDocs,
  query, where, writeBatch, orderBy, limit,
} from 'firebase/firestore';
import { mockNotifications } from '@/data/mockData';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  fetchNotifications: (userId?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: Notification['type']) => Notification[];
}

type NotificationStore = NotificationState & NotificationActions;

const computeUnreadCount = (notifications: Notification[]): number =>
  notifications.filter((n) => !n.read).length;

const generateNotificationId = (): string =>
  `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // --- State ---
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // --- Actions ---
  fetchNotifications: async (userId?: string) => {
    set({ isLoading: true });

    try {
      const notifRef = collection(db, 'notifications');
      const q = userId
        ? query(notifRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50))
        : query(notifRef, orderBy('createdAt', 'desc'), limit(50));

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as object),
      })) as Notification[];

      // Sort newest first
      const sorted = notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({
        notifications: sorted,
        unreadCount: computeUnreadCount(sorted),
      });
    } catch (error) {
      console.error('[NotificationStore][fetchNotifications] failed:', error);

      // Fallback to mock data
      const notifications = userId
        ? mockNotifications.filter((n) => n.userId === userId)
        : [...mockNotifications];

      const sorted = notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({
        notifications: sorted,
        unreadCount: computeUnreadCount(sorted),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => {
      const updatedNotifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updatedNotifications,
        unreadCount: computeUnreadCount(updatedNotifications),
      };
    });

    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('[NotificationStore][markAsRead] failed:', error);
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unread = notifications.filter((n) => !n.read);

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    try {
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('[NotificationStore][markAllAsRead] failed:', error);
    }
  },

  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Add to local state immediately
    set((state) => {
      const updatedNotifications = [newNotification, ...state.notifications];
      return {
        notifications: updatedNotifications,
        unreadCount: computeUnreadCount(updatedNotifications),
      };
    });

    // Write to Firestore (fire and forget — non-blocking)
    setDoc(doc(db, 'notifications', newNotification.id), newNotification).catch(
      (error) => {
        console.error('[NotificationStore][addNotification] Firestore write failed:', error);
      }
    );
  },

  removeNotification: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updatedNotifications,
        unreadCount: computeUnreadCount(updatedNotifications),
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  getUnreadNotifications: (): Notification[] => {
    return get().notifications.filter((n) => !n.read);
  },

  getNotificationsByType: (type: Notification['type']): Notification[] => {
    return get().notifications.filter((n) => n.type === type);
  },
}));
