# Sri Gowthami Student Tracker — Test Cases

## Test Case Template
| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|

---

## AUTHENTICATION TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-001 | Auth | Valid student login | User exists | 1. Open /login 2. Enter student@example.com / Test@1234 3. Click Sign In | Redirects to /my-application | High |
| TC-002 | Auth | Valid officer login | User exists | 1. Open /login 2. Enter admissions@srigowthami.edu.in / Test@1234 3. Click Sign In | Redirects to /dashboard | High |
| TC-003 | Auth | Wrong password | User exists | 1. Open /login 2. Enter valid email + wrong password 3. Click Sign In | Shows "Invalid email or password" error | High |
| TC-004 | Auth | Empty email field | None | 1. Open /login 2. Leave email empty 3. Click Sign In | Shows "Email address is required" below email field | Medium |
| TC-005 | Auth | Empty password field | None | 1. Open /login 2. Enter valid email, leave password empty 3. Click Sign In | Shows "Password is required" below password field | Medium |
| TC-006 | Auth | Invalid email format | None | 1. Open /login 2. Enter "notanemail" 3. Click Sign In | Shows "Please enter a valid email address" | Medium |
| TC-007 | Auth | Password too short | None | 1. Open /login 2. Enter valid email + "abc" 3. Click Sign In | Shows "Password must be at least 6 characters" | Medium |
| TC-008 | Auth | Quick login buttons | None | 1. Open /login 2. Click "Admissions" quick login | Logs in and redirects to /dashboard | Medium |

---

## ROLE-BASED ACCESS TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-009 | RBAC | Student visits /admin | Logged in as student | 1. Login as student 2. Navigate to /admin | Redirects to /my-application | High |
| TC-010 | RBAC | Student visits /documents | Logged in as student | 1. Login as student 2. Navigate to /documents | Redirects to /my-application | High |
| TC-011 | RBAC | Officer visits /my-application | Logged in as officer | 1. Login as officer 2. Navigate to /my-application | Redirects to /dashboard | High |
| TC-012 | RBAC | Verifier visits /admin | Logged in as verifier | 1. Login as verifier 2. Navigate to /admin | Redirects to /dashboard | High |
| TC-013 | RBAC | Admin visits all routes | Logged in as admin | 1. Login as admin 2. Visit /dashboard, /applications, /documents, /admin, /reports | All routes accessible | High |

---

## DOCUMENT UPLOAD TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-014 | Upload | Upload valid PDF | Logged in, doc selected | 1. Open document viewer 2. Click Resubmit 3. Select PDF file (<2MB) | Shows Pending badge, file info updated | High |
| TC-015 | Upload | Upload valid JPG image | Logged in, doc selected | 1. Open document viewer 2. Click Resubmit 3. Select JPG file | Shows Pending badge, preview shows image | High |
| TC-016 | Upload | Upload oversized file | Logged in, doc selected | 1. Open document viewer 2. Click Resubmit 3. Select file >2MB | Shows size error alert | Medium |
| TC-017 | Upload | Upload without selecting file | Logged in, doc selected | 1. Open document viewer 2. Click Resubmit 3. Cancel file picker | No change, no error | Low |

---

## DOCUMENT VERIFICATION TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-018 | Verify | Officer clicks Verify | Logged in as officer, doc pending | 1. Open application detail 2. Click Verify on a document | Badge changes to Verified (green) instantly | High |
| TC-019 | Verify | Officer clicks Reject | Logged in as officer, doc pending | 1. Open application detail 2. Click Reject 3. Enter reason 4. Confirm | Badge changes to Rejected (red), reason saved | High |
| TC-020 | Verify | Verify updates dashboard count | Logged in as officer | 1. Note Verified count on dashboard 2. Verify a document 3. Return to dashboard | Verified count increased by 1 | High |
| TC-021 | Verify | Reject with reason | Logged in as officer | 1. Click Reject on document 2. Enter "Blurry image" 3. Confirm | Reason saved and visible in document details | Medium |
| TC-022 | Verify | Student sees verified badge | Doc just verified | 1. Login as student 2. Navigate to documents | Green "Verified" badge visible on document | High |

---

## DOWNLOAD TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-023 | Download | Officer downloads PDF | Logged in as officer, doc has file | 1. Open document viewer 2. Click Download | File saves to device | Medium |
| TC-024 | Download | Officer downloads image | Logged in as officer, image doc | 1. Open document viewer 2. Click Download | Image saves to device | Medium |
| TC-025 | Download | Student cannot see download | Logged in as student | 1. Open document viewer | Download button is hidden | Medium |

---

## REAL-TIME TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-026 | Realtime | Officer verifies → student dashboard updates | Two browser tabs | 1. Tab A: officer verifies doc 2. Tab B: student views docs | Student sees green badge without reload | High |
| TC-027 | Realtime | New document uploaded → officer sees it | Two browser tabs | 1. Tab A: student uploads doc 2. Tab B: officer on documents page | Officer sees new doc without reload | High |

---

## SKELETON LOADER & EMPTY STATE TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-028 | UI | Skeleton shows while loading | None | 1. Navigate to /documents 2. Observe initial load | Skeleton cards/rows visible during data fetch | Medium |
| TC-029 | UI | Empty state on no documents | Account with no docs | 1. Login with clean account 2. Visit /documents | EmptyState component shown, not blank page | Medium |
| TC-030 | UI | StatusBadge colors correct | Documents with various statuses | 1. View documents page 2. Check badge colors | Green=verified, Orange=pending, Red=rejected, Blue=under_review, Gray=uploaded | Medium |

---

## NETWORK ERROR TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-031 | Network | Offline mode | App loaded | 1. Open DevTools → Network → Offline 2. Reload app | Fallback mock data shows, not blank screen | High |
| TC-032 | Network | Slow network | App loaded | 1. Throttle to Slow 3G 2. Reload | Skeleton shows, data eventually loads | Medium |
| TC-033 | Network | Restore network | App in offline mode | 1. Restore network 2. Navigate to dashboard | Real data loads replacing mock data | Medium |

---

## SESSION TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-034 | Session | Browser close persists auth | Logged in | 1. Login 2. Close tab 3. Reopen URL | User stays logged in (Firebase persists) | High |
| TC-035 | Session | Clear storage logs out | Logged in | 1. Login 2. Clear localStorage 3. Refresh | Redirects to /login | Medium |

---

## URL MANIPULATION TESTS

| TC-ID | Category | Description | Precondition | Steps | Expected Result | Priority |
|-------|----------|-------------|-------------|-------|-----------------|----------|
| TC-036 | Security | Student visits restricted URLs | Logged in as student | 1. Manually type /admin, /documents, /applications, /reports, /students | All redirect to /my-application | High |
| TC-037 | Security | Officer visits student URLs | Logged in as officer | 1. Manually type /my-application, /student-hub, /application-status | All redirect to /dashboard | High |
