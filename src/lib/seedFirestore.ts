import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { mockApplications } from '@/data/mockData';
import type { Application, Document } from '@/types';

export async function seedFirestoreIfNeeded() {
  try {
    const appsRef = collection(db, 'applications');
    const snapshot = await getDocs(appsRef);
    
    if (snapshot.empty) {
      console.log('[Seed] Firestore applications collection is empty. Seeding data...');
      
      // 1. Seed applications
      for (const app of mockApplications) {
        const updatedApp: Application = { ...app };
        if (app.studentEmail === 'student@example.com') {
          updatedApp.studentId = 'iG21D4iqLtTZRsDvCalngufs2yd2'; // Match student@example.com Firebase UID
        }
        await setDoc(doc(db, 'applications', app.id), updatedApp);
      }
      
      // 2. Seed some default documents for app_001 and app_002 so the verifier has something to work with!
      const seedDocs: Document[] = [
        // Documents for Ananya Patel (app_001)
        {
          id: 'doc_ap_001',
          applicationId: 'app_001',
          studentName: 'Ananya Patel',
          studentEmail: 'ananya.p@example.com',
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
          studentEmail: 'ananya.p@example.com',
          type: 'marks_memo_12',
          fileName: '12th_Marks_Ananya.pdf',
          fileUrl: 'https://example.com/mock-marks.pdf',
          fileSize: 680000,
          mimeType: 'application/pdf',
          status: 'verified',
          uploadedAt: new Date().toISOString(),
          comments: []
        },
        // Documents for Kiran Desai (app_002)
        {
          id: 'doc_kd_001',
          applicationId: 'app_002',
          studentName: 'Kiran Desai',
          studentEmail: 'kiran.d@example.com',
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
          studentEmail: 'kiran.d@example.com',
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

      for (const docObj of seedDocs) {
        await setDoc(doc(db, 'documents', docObj.id), docObj);
      }
      console.log('[Seed] Seeding of applications and documents complete!');
    }
  } catch (error) {
    console.error('[Seed] Error checking or seeding Firestore:', error);
  }
}
