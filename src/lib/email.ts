import emailjs from '@emailjs/browser';
import { getDocumentTypeLabel } from './utils';

interface EmailParams {
  to_email: string;
  student_name: string;
  document_type: string;
  document_name: string;
  file_name?: string;
  status: string;
  rejection_reason?: string;
  [key: string]: unknown;
}

/**
 * Sends an email notification to the student using EmailJS.
 *
 * @param toEmail - The recipient's email address.
 * @param studentName - The student's full name.
 * @param documentType - The document label/type.
 * @param status - The new status of the document ('verified' | 'rejected').
 * @param rejectionReason - The rejection reason, if status is 'rejected'.
 * @param documentName - The original name of the document file.
 */
export async function sendStatusEmail(
  toEmail: string,
  studentName: string,
  documentType: string,
  status: 'verified' | 'rejected',
  rejectionReason?: string,
  documentName?: string
): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Missing required environment variables. Email notification skipped.');
    return;
  }

  // Get friendly display label (e.g. "marks_memo" -> "Marks Memo", "aadhaar" -> "Aadhaar Card")
  const friendlyDocName = getDocumentTypeLabel(documentType);

  const templateParams: EmailParams = {
    to_email: toEmail,
    student_name: studentName,
    document_type: friendlyDocName,
    document_name: friendlyDocName,
    file_name: documentName || friendlyDocName,
    status: status === 'verified' ? 'Verified' : 'Rejected',
    rejection_reason: status === 'rejected' ? (rejectionReason || 'No reason provided') : 'N/A',
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, {
      publicKey: publicKey,
    });
    console.log('[EmailJS] Status email sent successfully:', response.status, response.text);
  } catch (error) {
    console.error('[EmailJS] Failed to send status email:', error);
  }
}
