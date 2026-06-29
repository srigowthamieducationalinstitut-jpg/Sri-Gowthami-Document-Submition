// ============================================
// Application Store — Zustand v5
// ============================================
import { create } from 'zustand';
import type { Application, ApplicationStatus } from '@/types';
import { db, getDocsWithTimeout, getDocWithTimeout } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { mockApplications } from '@/data/mockData';

interface ApplicationFilters {
  status: ApplicationStatus | 'all';
  departmentId: string | 'all';
  courseId: string | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}

interface ApplicationState {
  applications: Application[];
  selectedApplication: Application | null;
  filters: ApplicationFilters;
  searchQuery: string;
  isLoading: boolean;
}

interface ApplicationActions {
  fetchApplications: () => Promise<void>;
  getApplicationById: (id: string) => Promise<Application | null>;
  addApplication: (application: Application) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  updateStatus: (id: string, status: ApplicationStatus, reason?: string) => Promise<void>;
  setSelectedApplication: (application: Application | null) => void;
  setFilter: <K extends keyof ApplicationFilters>(key: K, value: ApplicationFilters[K]) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  getFilteredApplications: () => Application[];
}

type ApplicationStore = ApplicationState & ApplicationActions;

const defaultFilters: ApplicationFilters = {
  status: 'all',
  departmentId: 'all',
  courseId: 'all',
  dateFrom: null,
  dateTo: null,
};

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  // --- State ---
  applications: [],
  selectedApplication: null,
  filters: { ...defaultFilters },
  searchQuery: '',
  isLoading: false,

  // --- Actions ---
  fetchApplications: async () => {
    set({ isLoading: true });
    try {
      const querySnapshot = await getDocsWithTimeout(collection(db, 'applications'), 1500);
      const apps = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as object),
      })) as Application[];
      set({ applications: apps });
    } catch (error) {
      console.error('[ApplicationStore][fetchApplications] failed:', error);
      set({ applications: mockApplications });
    } finally {
      set({ isLoading: false });
    }
  },

  getApplicationById: async (id: string): Promise<Application | null> => {
    try {
      const appRef = doc(db, 'applications', id);
      const snapshot = await getDocWithTimeout(appRef, 1500);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...(snapshot.data() as object) } as Application;
      }
      return null;
    } catch (error) {
      console.error('[ApplicationStore][getApplicationById] failed:', error);
      return mockApplications.find(a => a.id === id) ?? null;
    }
  },

  addApplication: async (application: Application) => {
    try {
      await setDoc(doc(db, 'applications', application.id), application);
    } catch (error) {
      console.warn('[ApplicationStore][addApplication] failed, falling back to local state:', error);
    }
    set((state) => ({
      applications: [application, ...state.applications],
    }));

    // Trigger notification for admin/officers
    try {
      const { useNotificationStore } = await import('@/store/notificationStore');
      useNotificationStore.getState().addNotification({
        userId: 'admin',
        type: 'info',
        channel: 'in_app',
        title: 'New Application Submitted',
        message: `${application.studentName} submitted a new application for ${application.courseName}.`,
        link: `/applications/${application.id}`,
      });
    } catch {
      // Non-critical
    }
  },

  updateApplication: async (id: string, updates: Partial<Application>) => {
    const now = new Date().toISOString();
    const updatedFields = { ...updates, updatedAt: now };
    try {
      await updateDoc(doc(db, 'applications', id), updatedFields);
    } catch (error) {
      console.warn('[ApplicationStore][updateApplication] failed, falling back to local state:', error);
    }
    
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updatedFields } : app
      ),
      selectedApplication:
        state.selectedApplication?.id === id
          ? { ...state.selectedApplication, ...updatedFields }
          : state.selectedApplication,
    }));
  },

  updateStatus: async (id: string, status: ApplicationStatus, reason?: string) => {
    const now = new Date().toISOString();
    const statusTimestamps: Partial<Application> = { status, updatedAt: now };

    switch (status) {
      case 'submitted':
        statusTimestamps.submittedAt = now;
        break;
      case 'under_review':
        statusTimestamps.reviewedAt = now;
        break;
      case 'approved':
        statusTimestamps.approvedAt = now;
        break;
      case 'rejected':
        statusTimestamps.rejectedAt = now;
        statusTimestamps.rejectionReason = reason;
        break;
    }

    try {
      await updateDoc(doc(db, 'applications', id), statusTimestamps);
    } catch (error) {
      console.warn('[ApplicationStore][updateStatus] failed, falling back to local state:', error);
    }

    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...statusTimestamps } : app
      ),
      selectedApplication:
        state.selectedApplication?.id === id
          ? { ...state.selectedApplication, ...statusTimestamps }
          : state.selectedApplication,
    }));

    // Trigger EmailJS email notification for application status change
    try {
      const updatedApp = get().applications.find((app) => app.id === id) || get().selectedApplication;
      if (updatedApp && updatedApp.id === id && updatedApp.studentEmail && (status === 'approved' || status === 'rejected')) {
        const { sendStatusEmail } = await import('@/lib/email');
        await sendStatusEmail(
          updatedApp.studentEmail,
          updatedApp.studentName,
          'Admission Application',
          status === 'approved' ? 'verified' : 'rejected',
          status === 'rejected' ? (reason || 'Application did not meet admission criteria') : undefined
        );
      }
    } catch (emailErr) {
      console.error('[ApplicationStore] Failed to send status email:', emailErr);
    }
  },

  setSelectedApplication: (application: Application | null) => {
    set({ selectedApplication: application });
  },

  setFilter: <K extends keyof ApplicationFilters>(key: K, value: ApplicationFilters[K]) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters }, searchQuery: '' });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredApplications: (): Application[] => {
    const { applications, filters, searchQuery } = get();

    return applications.filter((app) => {
      // --- Status filter ---
      if (filters.status !== 'all' && app.status !== filters.status) {
        return false;
      }

      // --- Department filter ---
      if (filters.departmentId !== 'all' && app.departmentId !== filters.departmentId) {
        return false;
      }

      // --- Course filter ---
      if (filters.courseId !== 'all' && app.courseId !== filters.courseId) {
        return false;
      }

      // --- Date range filter ---
      if (filters.dateFrom) {
        const appDate = new Date(app.createdAt).getTime();
        const fromDate = new Date(filters.dateFrom).getTime();
        if (appDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const appDate = new Date(app.createdAt).getTime();
        const toDate = new Date(filters.dateTo).getTime();
        if (appDate > toDate) return false;
      }

      // --- Search query ---
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchableFields = [
          app.applicationNumber,
          app.studentName,
          app.studentEmail,
          app.studentPhone,
          app.courseName,
          app.departmentName,
          app.status,
        ];
        const matches = searchableFields.some((field) =>
          field?.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }

      return true;
    });
  },
}));
