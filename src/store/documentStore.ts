// ============================================
// Document Store — Zustand v5 (Real-time)
// ============================================
import { create } from 'zustand';
import type { Document, DocumentStatus, DocumentComment } from '@/types';
import { db, getDocWithTimeout } from '@/lib/firebase';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, where, arrayUnion, onSnapshot, getDoc,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  isLoading: boolean;
  _unsubscribe: Unsubscribe | null;
}

interface DocumentActions {
  fetchDocuments: (applicationId?: string) => void;
  subscribeToDocuments: (applicationId?: string) => Unsubscribe;
  unsubscribeDocuments: () => void;
  getDocumentById: (id: string) => Promise<Document | null>;
  addDocument: (document: Document) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  updateDocumentStatus: (
    id: string,
    status: DocumentStatus,
    verifiedBy?: string,
    rejectionReason?: string
  ) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  addComment: (documentId: string, comment: Omit<DocumentComment, 'id' | 'createdAt'>) => Promise<void>;
  setSelectedDocument: (document: Document | null) => void;
  getDocumentsByApplication: (applicationId: string) => Document[];
  getDocumentStats: () => {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    underReview: number;
  };
}

type DocumentStore = DocumentState & DocumentActions;

const generateId = (): string =>
  `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const generateCommentId = (): string =>
  `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const fallbackDocuments: Document[] = [
  {
    id: 'doc_ap_001',
    applicationId: 'app_001',
    studentName: 'Ananya Patel',
    type: 'aadhaar',
    fileName: 'Aadhaar_Ananya.pdf',
    fileUrl: 'https://example.com/mock-aadhaar.pdf',
    fileSize: 450000,
    mimeType: 'application/pdf',
    status: 'verified',
    uploadedAt: new Date().toISOString(),
    comments: []
  },
  {
    id: 'doc_ap_002',
    applicationId: 'app_001',
    studentName: 'Ananya Patel',
    type: 'marks_memo_12',
    fileName: '12th_Marks_Ananya.pdf',
    fileUrl: 'https://example.com/mock-marks.pdf',
    fileSize: 680000,
    mimeType: 'application/pdf',
    status: 'verified',
    uploadedAt: new Date().toISOString(),
    comments: []
  },
  {
    id: 'doc_kd_001',
    applicationId: 'app_002',
    studentName: 'Kiran Desai',
    type: 'aadhaar',
    fileName: 'Aadhaar_Kiran.pdf',
    fileUrl: 'https://example.com/mock-aadhaar.pdf',
    fileSize: 420000,
    mimeType: 'application/pdf',
    status: 'pending',
    uploadedAt: new Date().toISOString(),
    comments: []
  },
  {
    id: 'doc_kd_002',
    applicationId: 'app_002',
    studentName: 'Kiran Desai',
    type: 'marks_memo_10',
    fileName: '10th_Marks_Kiran.pdf',
    fileUrl: 'https://example.com/mock-marks.pdf',
    fileSize: 720000,
    mimeType: 'application/pdf',
    status: 'pending',
    uploadedAt: new Date().toISOString(),
    comments: []
  }
];

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // --- State ---
  documents: [],
  selectedDocument: null,
  isLoading: false,
  _unsubscribe: null,

  // --- Actions ---

  /**
   * One-time fetch using onSnapshot internally.
   * For a persistent real-time listener, use subscribeToDocuments().
   */
  fetchDocuments: (applicationId?: string) => {
    set({ isLoading: true });
    try {
      const docsRef = collection(db, 'documents');
      const q = applicationId
        ? query(docsRef, where('applicationId', '==', applicationId))
        : docsRef;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as object),
          })) as Document[];
          set({ documents: docs, isLoading: false });
        },
        (error) => {
          console.error('[DocumentStore][fetchDocuments] onSnapshot error:', error);
          const filteredFallback = applicationId
            ? fallbackDocuments.filter(d => d.applicationId === applicationId)
            : fallbackDocuments;
          set({ documents: filteredFallback, isLoading: false });
        }
      );

      // Store unsubscribe so we can clean up
      const prev = get()._unsubscribe;
      if (prev) prev();
      set({ _unsubscribe: unsubscribe });
    } catch (error) {
      console.error('[DocumentStore][fetchDocuments] failed:', error);
      const filteredFallback = applicationId
        ? fallbackDocuments.filter(d => d.applicationId === applicationId)
        : fallbackDocuments;
      set({ documents: filteredFallback, isLoading: false });
    }
  },

  /**
   * Subscribe to real-time updates. Returns the unsubscribe function.
   */
  subscribeToDocuments: (applicationId?: string): Unsubscribe => {
    set({ isLoading: true });

    const docsRef = collection(db, 'documents');
    const q = applicationId
      ? query(docsRef, where('applicationId', '==', applicationId))
      : docsRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as object),
        })) as Document[];
        set({ documents: docs, isLoading: false });
      },
      (error) => {
        console.error('[DocumentStore][subscribeToDocuments] onSnapshot error:', error);
        const filteredFallback = applicationId
          ? fallbackDocuments.filter(d => d.applicationId === applicationId)
          : fallbackDocuments;
        set({ documents: filteredFallback, isLoading: false });
      }
    );

    // Clean up previous subscription
    const prev = get()._unsubscribe;
    if (prev) prev();
    set({ _unsubscribe: unsubscribe });

    return unsubscribe;
  },

  /**
   * Clean up any active onSnapshot listener.
   */
  unsubscribeDocuments: () => {
    const unsub = get()._unsubscribe;
    if (unsub) {
      unsub();
      set({ _unsubscribe: null });
    }
  },

  /**
   * Fetch a single document by ID.
   */
  getDocumentById: async (id: string): Promise<Document | null> => {
    try {
      const docRef = doc(db, 'documents', id);
      const snapshot = await getDocWithTimeout(docRef, 1500);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...(snapshot.data() as object) } as Document;
      }
      return null;
    } catch (error) {
      console.error('[DocumentStore][getDocumentById] failed:', error);
      return fallbackDocuments.find(d => d.id === id) ?? null;
    }
  },

  addDocument: async (document: Document) => {
    try {
      await setDoc(doc(db, 'documents', document.id), document);
    } catch (error) {
      console.warn('[DocumentStore][addDocument] failed, falling back to local state:', error);
    }
    set((state) => ({
      documents: [document, ...state.documents],
    }));
  },

  removeDocument: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (error) {
      console.warn('[DocumentStore][removeDocument] failed, falling back to local state:', error);
    }
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      selectedDocument:
        state.selectedDocument?.id === id ? null : state.selectedDocument,
    }));
  },

  updateDocumentStatus: async (
    id: string,
    status: DocumentStatus,
    verifiedBy?: string,
    rejectionReason?: string
  ) => {
    const now = new Date().toISOString();
    const updates: Partial<Document> = { status };
    if (status === 'verified') {
      updates.verifiedAt = now;
      updates.verifiedBy = verifiedBy || '';
    } else if (status === 'rejected') {
      updates.rejectionReason = rejectionReason || '';
    }

    try {
      // Use setDoc with merge: true so it works for non-existing (mock) documents too
      await setDoc(doc(db, 'documents', id), updates, { merge: true });
    } catch (error) {
      console.warn('[DocumentStore][updateDocumentStatus] Firestore update failed, falling back to local state:', error);
    }

    // Update local state regardless of Firestore write success
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      selectedDocument:
        state.selectedDocument?.id === id
          ? { ...state.selectedDocument, ...updates }
          : state.selectedDocument,
    }));

    // Trigger notification and email for the student
    try {
      const { useNotificationStore } = await import('@/store/notificationStore');
      const targetDoc = get().documents.find(d => d.id === id);
      if (targetDoc) {
        const docTypeLabel = targetDoc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (status === 'verified') {
          useNotificationStore.getState().addNotification({
            userId: targetDoc.applicationId,
            type: 'success',
            channel: 'in_app',
            title: 'Document Verified',
            message: `Your ${docTypeLabel} has been verified by ${verifiedBy || 'an officer'}.`,
            link: `/applications/${targetDoc.applicationId}`,
          });
        } else if (status === 'rejected') {
          useNotificationStore.getState().addNotification({
            userId: targetDoc.applicationId,
            type: 'error',
            channel: 'in_app',
            title: 'Document Rejected',
            message: `Your ${docTypeLabel} was rejected. Reason: ${rejectionReason || 'Not specified'}.`,
            link: `/applications/${targetDoc.applicationId}`,
          });
        }

        // Trigger EmailJS email notification
        if (status === 'verified' || status === 'rejected') {
          let studentEmail = targetDoc.studentEmail;
          
          if (!studentEmail) {
            // Try resolving student email from local application store
            try {
              const { useApplicationStore } = await import('@/store/applicationStore');
              const localApp = useApplicationStore.getState().applications.find(a => a.id === targetDoc.applicationId);
              if (localApp) {
                studentEmail = localApp.studentEmail;
              }
            } catch (localAppErr) {
              console.warn('[DocumentStore] Failed to fetch email from local applicationStore:', localAppErr);
            }
          }

          if (!studentEmail) {
            // Try resolving student email from Firestore
            try {
              const appRef = doc(db, 'applications', targetDoc.applicationId);
              const appSnap = await getDoc(appRef);
              if (appSnap.exists()) {
                studentEmail = appSnap.data()?.studentEmail;
              }
            } catch (appErr) {
              console.warn('[DocumentStore] Failed to fetch application for studentEmail fallback:', appErr);
            }
          }

          if (studentEmail) {
            const { sendStatusEmail } = await import('@/lib/email');
            await sendStatusEmail(
              studentEmail,
              targetDoc.studentName,
              targetDoc.type,
              status,
              rejectionReason,
              targetDoc.fileName
            );
          } else {
            console.warn(`[DocumentStore] No student email found for document ${id}. Email notification skipped.`);
          }
        }
      }
    } catch (err) {
      console.error('[DocumentStore] Error processing student notifications:', err);
    }
  },

  updateDocument: async (id: string, updates: Partial<Document>) => {
    try {
      await updateDoc(doc(db, 'documents', id), updates);
    } catch (error) {
      console.warn('[DocumentStore][updateDocument] failed, falling back to local state:', error);
    }
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      selectedDocument:
        state.selectedDocument?.id === id
          ? { ...state.selectedDocument, ...updates }
          : state.selectedDocument,
    }));
  },

  addComment: async (
    documentId: string,
    comment: Omit<DocumentComment, 'id' | 'createdAt'>
  ) => {
    const newComment: DocumentComment = {
      ...comment,
      id: generateCommentId(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId
          ? { ...d, comments: [...d.comments, newComment] }
          : d
      ),
      selectedDocument:
        state.selectedDocument?.id === documentId
          ? {
              ...state.selectedDocument,
              comments: [...state.selectedDocument.comments, newComment],
            }
          : state.selectedDocument,
    }));

    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        comments: arrayUnion(newComment)
      });
    } catch (error) {
      console.error('[DocumentStore][addComment] failed:', error);
      // Revert optimistic update on failure
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === documentId
            ? { ...d, comments: d.comments.filter(c => c.id !== newComment.id) }
            : d
        ),
      }));
    }
  },

  setSelectedDocument: (document: Document | null) => {
    set({ selectedDocument: document });
  },

  getDocumentsByApplication: (applicationId: string): Document[] => {
    return get().documents.filter((d) => d.applicationId === applicationId);
  },

  getDocumentStats: () => {
    const { documents } = get();
    return {
      total: documents.length,
      verified: documents.filter((d) => d.status === 'verified').length,
      pending: documents.filter((d) => d.status === 'pending' || d.status === 'uploaded').length,
      rejected: documents.filter((d) => d.status === 'rejected').length,
      underReview: documents.filter((d) => d.status === 'under_review').length,
    };
  },
}));

export { generateId as generateDocumentId };
