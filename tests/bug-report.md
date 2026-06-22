# Sri Gowthami Student Tracker — Bug Report

## Bug Report Format
| Bug ID | Page | Steps to Reproduce | Expected | Actual | Severity | Status |
|--------|------|-------------------|----------|--------|----------|--------|

---

## Bugs Found During Development

| Bug ID | Page | Steps to Reproduce | Expected | Actual | Severity | Status |
|--------|------|-------------------|----------|--------|----------|--------|
| BUG-001 | Documents | 1. Open /documents 2. Observe network tab | One-time fetch, no continuous polling | `getDocsWithTimeout()` fetched once but missed real-time updates | Medium | **Fixed** — Replaced with `onSnapshot()` listener for real-time updates |
| BUG-002 | Dashboard | 1. Open /dashboard 2. Check useEffect deps | No re-fetch on every render | `useEffect` had `[fetchApplications, fetchDocuments]` — store functions are new references each render | High | **Fixed** — Changed deps to `[]` |
| BUG-003 | Login | 1. Open /login 2. Click Sign In with empty fields | Validation errors shown per field | No field-level validation, only browser native `required` | Medium | **Fixed** — Added custom validation with per-field error messages |
| BUG-004 | Application Detail | 1. Open /applications/:id 2. Check useEffect | No re-fetch loop | `useEffect` had `[fetchApplications, fetchDocuments]` as deps | High | **Fixed** — Changed deps to `[]` |
| BUG-005 | Notification Store | 1. Login 2. Check notifications | Fetches from Firestore | Only used mock data, no Firestore integration | Medium | **Fixed** — Added full Firestore CRUD with mock fallback |
| BUG-006 | Application Detail | 1. Open detail page 2. Check document display | All 8 document types shown in checklist | Only uploaded documents shown, missing types not visible | Medium | **Fixed** — Added full 8-type checklist grid showing uploaded + "Not Uploaded" placeholders |
| BUG-007 | Documents | 1. Open /documents 2. Click student name | Navigate to application detail page | Only toggled expand, no navigation | Low | **Fixed** — Added click-to-navigate on student name → `/applications/:id` |
| BUG-008 | Documents | 1. Open /documents with slow network | Skeleton loading state shown | Blank page while loading, then data appears | Medium | **Fixed** — Added `SkeletonRow` loading state |
| BUG-009 | Documents | 1. Open /documents with no documents | Empty state component shown | "No students found matching your filters" even when no filters applied | Low | **Fixed** — Added proper `EmptyState` component with contextual message |
| BUG-010 | Application Detail | 1. Open detail 2. Try to reject doc | Rejection reason modal shown | Direct reject without reason input | Medium | **Fixed** — Added reject reason modal with textarea |
| BUG-011 | Document Store | 1. Verify a document | Notification sent to student | No notification trigger on verify/reject | Medium | **Fixed** — Added automatic notification dispatch on status change |

---

## Severity Legend
- **Critical** → App crashes or is completely unusable
- **High** → Core feature broken, blocking user workflow
- **Medium** → Feature works but with incorrect behavior
- **Low** → UI/visual issue or minor inconvenience
