// ============================================
// Sri Gowthami Student Tracker — Core Types
// ============================================

// --- User & Auth ---
export type UserRole = 'super_admin' | 'admission_officer' | 'verification_officer' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string;
  applicationId?: string;
  isActive: boolean;
  password?: string;   // stored only for Firestore-native accounts (no Firebase Auth)
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// --- Student ---
export interface Student {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  parentName: string;
  parentPhone: string;
  address: Address;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

// --- Application ---
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'admission_completed';

export interface Application {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseId: string;
  courseName: string;
  departmentId: string;
  departmentName: string;
  status: ApplicationStatus;
  personalDetails: PersonalDetails;
  academicDetails: AcademicDetails;
  address: Address;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  fatherName: string;
  fatherPhone?: string;
  motherName: string;
  motherPhone?: string;
  category: 'general' | 'obc' | 'sc' | 'st' | 'ews';
  religion: string;
  nationality: string;
}

export interface AcademicDetails {
  previousInstitution: string;
  board: string;
  yearOfPassing: string;
  percentage: number;
  courseApplied: string;
  specialization?: string;
}

// --- Documents ---
export type DocumentType = 
  | 'aadhaar'
  | 'marks_memo_10'
  | 'marks_memo_12'
  | 'tc_10'
  | 'tc_12'
  | 'passport_photo'
  | 'bonafide_10'
  | 'bonafide_12'
  | 'migration_certificate'
  | 'rank_card'
  | 'caste_certificate'
  | 'income_certificate'
  | 'medical_certificate'
  | 'other';

export type DocumentStatus = 'uploaded' | 'pending' | 'under_review' | 'verified' | 'rejected';

export interface Document {
  id: string;
  applicationId: string;
  studentName: string;
  studentEmail?: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  comments: DocumentComment[];
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

// --- Verification ---
export interface VerificationRecord {
  id: string;
  documentId: string;
  documentType: DocumentType;
  applicationId: string;
  studentName: string;
  verifiedBy: string;
  verifierName: string;
  status: 'approved' | 'rejected' | 'pending_resubmission';
  comments: string;
  verifiedAt: string;
}

// --- Notifications ---
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// --- Courses & Departments ---
export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  duration: string;
  totalSeats: number;
  filledSeats: number;
  fee: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDept: string;
  totalCourses: number;
  totalStudents: number;
  isActive: boolean;
}

// --- Activity Logs ---
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  entityType: 'application' | 'document' | 'user' | 'notification' | 'system';
  entityId: string;
  ipAddress?: string;
  createdAt: string;
}

// --- Dashboard ---
export interface DashboardStats {
  totalApplications: number;
  verifiedApplications: number;
  pendingDocuments: number;
  rejectedApplications: number;
  todaySubmissions: number;
  monthlyAdmissions: number;
  totalStudents: number;
  approvalRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// --- AI Chat ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

// --- Reports ---
export type ReportType = 'admission' | 'verification' | 'pending_documents' | 'student_summary';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generatedBy: string;
  dateRange: { start: string; end: string };
  data: Record<string, unknown>;
  createdAt: string;
}

// --- Timeline ---
export interface TimelineEvent {
  id: string;
  applicationId: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
  timestamp?: string;
  user?: string;
}

// --- Table & Filter ---
export interface FilterOption {
  label: string;
  value: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}
