# Phase 4 — Team Split
## ITI — Attendance & Grading Platform

> **5 developers · 5 days · Vue 3 frontend**  
> Read the non-negotiable rules in the Phase 4 plan before writing a single line.  
> Branch naming: `feature/DEV_NAME-FEATURE` e.g. `feature/mansoura-auth`

---

## ⚠️ Day 1 — Everyone Does This First (Together, ~1 hour)

**Mansoura** scaffolds the project and pushes the skeleton. Everyone else pulls before starting their branch.

```bash
# Mansoura runs this, commits, and pushes to main

npm create vue@latest frontend
cd frontend
# Choose: Vue Router ✅ | Pinia ✅ | ESLint ✅ | TypeScript ❌
npm install
npm install axios @vueuse/core qrcode html5-qrcode

# Create the full folder structure
mkdir -p src/{api,stores,router,composables,components/{ui,shared},views/{auth,branch-manager,track-admin,instructor,student}}

# Stub every view file so routes don't throw errors
for dir in auth branch-manager track-admin instructor student; do
  touch src/views/$dir/DashboardView.vue
done

# Create .env
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

Mansoura then builds the full project foundation (Axios, auth store, router) — see her section below. Everyone else stubs their own view files but does NOT start building until Mansoura pushes a working login.

---

## 👤 Mansoura — Foundation, Auth & Branch Manager

**Branch:** `feature/mansoura-auth-foundation`  
**Owns:** The entry point of the entire app. Login, routing, the Axios layer, and the most powerful role's UI.

### Responsibilities

| Area | Files |
|---|---|
| Axios instance | `src/api/axios.js` |
| Auth store | `src/stores/auth.js` |
| Router + guards | `src/router/index.js` |
| App shell | `src/App.vue`, `src/components/shared/AppSidebar.vue` |
| Composables | `src/composables/useToast.js`, `src/composables/useConfirm.js` |
| Base UI components | `src/components/ui/` (Button, Input, Modal, Table, Badge, Toast, Spinner) |
| Auth view | `src/views/auth/LoginView.vue` |
| Analytics store | `src/stores/analytics.js` |
| Users store | `src/stores/users.js` |
| Branch Manager | All 5 views in `src/views/branch-manager/` |

### Day-by-Day

**Day 1**
- Scaffold the project and run the setup commands above — push to `main` before anyone else starts
- Build `src/api/axios.js` — Axios instance with request interceptor (attach token) and response interceptor (401 → logout + redirect)
- Build `src/stores/auth.js` — login, logout, `isLoggedIn`, role booleans, `localStorage` persistence
- Build `src/router/index.js` — all routes registered (even as stubs), `beforeEach` guard with role redirect
- Build `src/views/auth/LoginView.vue` — form with email/password, error display, redirect to role dashboard after login
- **Test:** Login with all 4 accounts, confirm redirect goes to the right path

**Day 2**
- Build all 7 base UI components in `src/components/ui/` — these are shared by the whole team, so build them first and push
- Build `src/components/shared/AppSidebar.vue` — role-aware nav links + logout button
- Build `src/App.vue` — layout shell with sidebar + `<RouterView>` + `<AppToast>`
- Build `useToast` and `useConfirm` composables

**Day 3**
- Build `src/stores/analytics.js` — `fetchBranch`, `fetchCohort`, `fetchAtRisk`
- Build `src/stores/users.js` — `fetchAll`, `create`, `update`, `deactivate`
- Build `src/views/branch-manager/DashboardView.vue` — stat cards + track table from analytics API
- Build `src/views/branch-manager/UsersView.vue` — role filter tabs, user table, create/edit/deactivate modal

**Day 4**
- Build `src/views/branch-manager/CohortsView.vue` — cohort list per track, create cohort modal, assign track admin
- Build `src/views/branch-manager/TracksView.vue` — track list with create/edit
- Build `src/views/branch-manager/BillingView.vue` — billing rollup table, internal vs external summary cards (BIL-4)

**Day 5**
- Integration testing for all branch manager flows
- Review and merge PRs from the team
- Help fix routing or auth issues across any role's views

### Your Postman→Vue Checklist

- [ ] Login shows error message on wrong credentials (not a generic alert)
- [ ] Expired account login shows "Account expired" message
- [ ] After login, refreshing the page keeps the user logged in (token persists)
- [ ] Visiting `/admin` while logged in as branch_manager redirects to `/manager`
- [ ] Sidebar shows correct nav for branch manager only
- [ ] Branch dashboard stat cards show live numbers from `GET /analytics/branch`
- [ ] Users table: role filter tabs work, pagination if needed
- [ ] Create user form shows field-level `422` errors (e.g. "email already taken")
- [ ] Deactivate user triggers a confirm dialog before the API call
- [ ] Billing table shows internal vs external split with totals
- [ ] `AppModal`, `AppBadge`, `AppTable`, `AppToast` exported and working for the team

### Key Rules for Your Area

- The Axios interceptor is the single most important file in the project — every API call goes through it. Get it right before anyone starts testing
- `useToast` must be a singleton — export `toasts` as a module-level ref so any component can push to it and `App.vue` renders them all
- Route guards must use the role from the Pinia store, never from `localStorage` directly — the store is the single source of truth
- `AppSidebar` must be completely invisible on the `/login` route

---

## 👤 Giza — Track Admin Dashboard & Cohort Setup

**Branch:** `feature/giza-track-admin`  
**Owns:** The full Track Admin experience — the most configuration-heavy role in the system.

### Responsibilities

| Area | Files |
|---|---|
| Cohorts store | `src/stores/cohorts.js` |
| Courses store | `src/stores/courses.js` |
| Lab groups store | `src/stores/labGroups.js` |
| Engagements store | `src/stores/engagements.js` |
| Sessions store | `src/stores/sessions.js` |
| Track Admin Dashboard | `src/views/track-admin/DashboardView.vue` |
| Track Admin Setup | `src/views/track-admin/CohortSetupView.vue` |
| Track Admin Students | `src/views/track-admin/StudentsView.vue` |
| Track Admin Announcements | `src/views/track-admin/AnnouncementsView.vue` |

### Day-by-Day

**Day 1**
- Pull Mansoura's scaffold, create your branch
- Stub all your view files immediately so the routes don't error

**Day 2**
- Build `src/stores/cohorts.js` — `fetchAll`, `fetchOne`, `create`, `update`
- Build `src/stores/courses.js` — `fetchForCohort`, `create`, `update`, `destroy`
- Build `src/stores/labGroups.js` — `fetchForCohort`, `create`, `assignStudents`, `removeStudent`
- Build `src/stores/engagements.js` — `fetchForCohort`, `create`, `update`, `destroy`
- Build `src/stores/sessions.js` — `fetchForEngagement`, `create`, `deliver`, `destroy`

**Day 3**
- Build `src/views/track-admin/DashboardView.vue`:
  - Stat cards: students, at-risk count, pending excuses, missing submissions
  - Grade distribution chart (use a simple bar chart with `<div>` widths or a library)
  - At-risk student list table with reason badges
  - Grader-consistency table (group name, instructor, mean score)

**Day 4**
- Build `src/views/track-admin/CohortSetupView.vue` — 4-tab layout:
  - **Courses** tab: table with inline weight display, "Add Course" form, edit/delete actions
  - **Lab Groups** tab: list of groups, student count per group, "Assign Students" multi-select modal
  - **Engagements** tab: list by type, "Create Engagement" form, type selector, instructor selector
  - **Sessions** tab: engagement picker → session list, "Add Date" button, "Mark Delivered" per row

**Day 5**
- Build `src/views/track-admin/StudentsView.vue` — full cohort roster, click to open student side-panel with tags and ledger balance
- Build `src/views/track-admin/AnnouncementsView.vue` — list + "New Announcement" form with title and body
- End-to-end test the cohort setup flow: create course → create group → assign students → create engagement → add sessions

### Your Postman→Vue Checklist

- [ ] Track admin dashboard loads real cohort analytics
- [ ] Grade distribution bars are proportional to actual data
- [ ] At-risk list shows correct reasons (ledger / course)
- [ ] Grader-consistency table shows per-group mean scores
- [ ] Create course: `422` shows inline if weights don't sum to 100 (GRD-1)
- [ ] Lab group: assign students opens a searchable multi-select of cohort students
- [ ] Create engagement: `lab_group_id` field only shows when type is `lab`
- [ ] Mark session delivered: button shows spinner, success toast, then "Delivered" badge
- [ ] Student roster: click a student → side panel shows tags and ledger
- [ ] Announcement form: title and body required, success toast on post

### Key Rules for Your Area

- The courses tab must prevent changing weights after grades exist (GRD-2) — disable the weight fields and show a tooltip explaining why
- The engagement form must conditionally show `lab_group_id` only when type is `lab` — use `v-if` on the field
- Grader-consistency data comes from `analyticsStore.cohortData.lab_group_consistency` — use Mansoura's analytics store, don't create a duplicate
- The sessions tab must call `sessionStore.deliver(sessionId)` which internally calls `PATCH /sessions/{id}/deliver` — coordinate with Menna who builds the instructor attendance view that also uses sessions

---

## 👤 Menna — Attendance, Excuse Requests & QR Scanner

**Branch:** `feature/menna-attendance-qr`  
**Owns:** The daily operational loop — who's in the room, when they left, and the excuse workflow.

### Responsibilities

| Area | Files |
|---|---|
| Attendance store | `src/stores/attendance.js` |
| Ledger store | `src/stores/ledger.js` |
| Excuse requests store | `src/stores/excuseRequests.js` |
| Instructor Attendance | `src/views/instructor/AttendanceView.vue` |
| Track Admin Attendance | `src/views/track-admin/AttendanceView.vue` |
| Track Admin Excuses | `src/views/track-admin/ExcuseRequestsView.vue` |
| Student Attendance | `src/views/student/AttendanceView.vue` |
| Student Excuses | `src/views/student/ExcuseRequestsView.vue` |
| QR Display | `src/components/shared/QrDisplay.vue` |
| QR Scanner | `src/components/shared/QrScanner.vue` |

### Day-by-Day

**Day 1**
- Pull scaffold, stub your views
- Build `src/stores/attendance.js` — `fetchForSession`, `recordAttendance`, `updateRecord`, `fetchForStudent`
- Build `src/stores/ledger.js` — `fetchForStudent` (balance + history)
- Push these stores immediately — Giza's session "Mark Delivered" button and Khaled's grading flow both need the attendance store

**Day 2**
- Build `src/views/instructor/AttendanceView.vue`:
  - Session picker dropdown (only instructor's sessions)
  - Attendance table: student name, arrived_at, left_at, status badge
  - Manual record button: opens modal with student selector + status
  - "Mark Delivered" button — calls `sessionStore.deliver()`
- Build `src/views/track-admin/AttendanceView.vue`:
  - Same as instructor view but session picker shows all cohort sessions
  - Status is editable via dropdown (select present/absent/excused, triggers ledger update)

**Day 3**
- Build `src/views/track-admin/ExcuseRequestsView.vue`:
  - Filterable tabs: All / Pending / Approved / Rejected
  - Each row expands: student name, session date, reason, attachment link (opens in new tab)
  - Approve button: opens note input, submits, shows ledger adjustment in success toast
  - Reject button: opens note input, submits

**Day 4**
- Build `src/views/student/AttendanceView.vue`:
  - Ledger balance displayed prominently at the top — color coded (green ≥ 150, red < 150)
  - Full session history table: date, type, arrived/left, status badge
  - Deduction history: each event with points change (POR-2)
- Build `src/views/student/ExcuseRequestsView.vue`:
  - List of own requests with status badges
  - "New Excuse" button → modal: absence dropdown (only the student's absent records), reason textarea, optional file (1MB max, PDF/image validated client-side)

**Day 5**
- Build `src/components/shared/QrDisplay.vue` — fetches payload, renders via `qrcode` library
- Build `src/components/shared/QrScanner.vue` — `html5-qrcode`, calls `POST /qr/scan`, shows result
- Integrate QR display into the instructor attendance view (show QR button per session)
- Integrate QR scanner into the student dashboard (scan button, opens scanner modal)

### Your Postman→Vue Checklist

- [ ] Instructor attendance table loads for their session only
- [ ] Manual record: dropdown shows only students in the instructor's group
- [ ] Status update on track-admin attendance updates ledger — confirm via ledger API call
- [ ] Excuse list: filter tabs work
- [ ] Approve excuse: success toast shows "+20 points refunded to ledger"
- [ ] Reject excuse: reviewer note is required before submitting
- [ ] Student attendance: ledger balance shown, color coded
- [ ] Student attendance: session history shows correct deduction per event
- [ ] Student excuse: absence dropdown only shows the student's own absent records
- [ ] Student excuse: file too large (>1MB) shows client-side error before upload
- [ ] QR display: canvas renders a real scannable QR code
- [ ] QR scanner: first scan shows "Checked in at HH:MM", second scan shows "Checked out"
- [ ] QR scanner: already checked out session returns a clear error message

### Key Rules for Your Area

- Never allow a student to see another student's attendance or excuse requests — the API enforces this, but always use the authenticated user's ID in requests, never a URL param that could be changed
- The excuse attachment file validation must happen **client-side before the upload** — check `file.size` and `file.type` in the `change` handler, before calling the store action
- The QR scanner must stop the camera after a successful scan — call `scanner.stop()` in the success callback to avoid draining the battery
- `QrDisplay` should receive `sessionId` as a prop so it can be embedded anywhere — don't hardcode IDs

---

## 👤 Khaled — Grading, Submissions & Student Tags

**Branch:** `feature/khaled-grading`  
**Owns:** The academic layer — scores, overrides, lab submissions, and the annotation system.

### Responsibilities

| Area | Files |
|---|---|
| Grades store | `src/stores/grades.js` |
| Submissions store | `src/stores/submissions.js` |
| Tags store | `src/stores/tags.js` |
| Track Admin Grades | `src/views/track-admin/GradesView.vue` |
| Instructor Grades | `src/views/instructor/GradesView.vue` |
| Student Grades | `src/views/student/GradesView.vue` |
| Student Submissions | `src/views/student/SubmissionsView.vue` |

### Day-by-Day

**Day 1**
- Pull scaffold, stub your views
- Build `src/stores/grades.js` — `fetchSummary`, `fetchCourseGrades`, `enterExamGrade`, `overrideGrade`, `fetchOverrides`
- Build `src/stores/submissions.js` — `fetchForStudent`, `fetchForSession`, `submit`, `gradeSubmission`
- Build `src/stores/tags.js` — `fetchForStudent`, `addTag`, `deleteTag`

**Day 2**
- Build `src/views/track-admin/GradesView.vue`:
  - Course selector at top
  - Table: student name, lab score, exam score, course total, is_at_risk badge
  - "Enter Exam Grade" button per row → modal with `exam_raw_score` and `exam_raw_max` inputs
  - "Override" button per row → modal with new value input and mandatory reason textarea (GRD-6)
  - "View Override History" link → opens a side panel showing the audit trail

**Day 3**
- Build `src/views/instructor/GradesView.vue`:
  - Lists students in the instructor's lab group only (ACC-3)
  - Per student row: list of their lab submissions with raw score input + save button
  - Tags section per student: show existing tags, "Add Tag" button
  - Add Tag modal: type selector (predefined / free-text), value input
  - Predefined dropdown shows only: "uses AI", "Cheating", "loves extra work" (GRD-7)

**Day 4**
- Build `src/views/student/GradesView.vue`:
  - Ledger balance line item at the top
  - One card per course: lab score + exam score + course total
  - Grand total at the bottom — prominently styled
  - No peer data, no class rank (ACC-4)
  - At-risk warning per course if score < 60
- Build `src/views/student/SubmissionsView.vue`:
  - Table of all sessions with submission status per row
  - Status column: "Not submitted" / "Submitted" (with date) / "Graded" (with score)
  - "Submit" button opens modal: tab between URL input and file upload
  - Late penalty badge shown if `days_late > 0`

**Day 5**
- End-to-end test the full grading flow:
  1. Track admin enters exam grade for course
  2. Verify computed_score is normalized correctly in the UI
  3. Instructor grades a lab submission
  4. Student views their grade summary — grand total updates
  5. Track admin overrides a grade — modal requires reason, audit trail visible
- Integration testing with Menna (ledger affects grade summary total)

### Your Postman→Vue Checklist

- [ ] Track admin grades table shows correct normalized scores
- [ ] Enter exam grade: form shows `exam_raw_score / exam_raw_max` inputs, computed score shown after save
- [ ] Override modal: "Save" is disabled until reason has ≥ 10 characters (GRD-6)
- [ ] Override history: panel shows every override with original value and reason
- [ ] Instructor grade view shows ONLY their lab group's students (no others)
- [ ] Add tag: predefined dropdown has exactly 3 options (GRD-7)
- [ ] Add tag: free-text input accepts any string
- [ ] Student grades: ledger + course totals = grand total (verify arithmetic)
- [ ] Student grades: no class average, no peer scores visible (ACC-4)
- [ ] Student submission: URL submit works end-to-end
- [ ] Student submission: file upload with `multipart/form-data` header works
- [ ] Late penalty badge appears in yellow when `days_late > 0`
- [ ] Graded submission shows final score prominently

### Key Rules for Your Area

- **The grade summary computation must match the API exactly** — `grand_total = ledger + sum(course_totals)`. Display what the API returns, don't re-compute it in the frontend
- The override modal's reason field must be validated client-side (minimum 10 characters) before the API call — don't let an empty reason reach the server
- The instructor grades view must only show students from the authenticated instructor's group — the API enforces this, but build the UI so it never shows an empty state that confuses the user
- File uploads use `FormData` and need `Content-Type: multipart/form-data` — pass the FormData object directly to Axios and it will set the correct boundary automatically. Never set the Content-Type header manually for file uploads
- Tags are visible to track admins and instructors (ACC-5) but never to students — wrap the tags section in a `v-if="!auth.isStudent"` guard

---

## 👤 Wael — Instructor Dashboard, Announcements & Student Dashboard

**Branch:** `feature/wael-dashboards-announcements`  
**Owns:** The student-facing experience and the instructor's home screen — the two views used most every day.

### Responsibilities

| Area | Files |
|---|---|
| Announcements store | `src/stores/announcements.js` |
| Billing store | `src/stores/billing.js` (read-only, branch manager) |
| Instructor Dashboard | `src/views/instructor/DashboardView.vue` |
| Instructor Announcements | `src/views/instructor/AnnouncementsView.vue` |
| Student Dashboard | `src/views/student/DashboardView.vue` |
| Student Announcements | `src/views/student/AnnouncementsView.vue` |

### Day-by-Day

**Day 1**
- Pull scaffold, stub your views
- Build `src/stores/announcements.js` — `fetchForCohort`, `create`, `update`, `destroy`
- Build `src/stores/billing.js` — `fetchAll` (branch manager only, used in Mansoura's billing view — hand off to her)

**Day 2**
- Build `src/views/instructor/DashboardView.vue`:
  - Lab group name + student count
  - Grade distribution chart for their group (same design as track admin chart)
  - Submission tracker table: student name, submitted (✓/✗), days late, graded (✓/✗)
  - Total delivered hours this engagement

**Day 3**
- Build `src/views/instructor/AnnouncementsView.vue`:
  - Feed of cohort announcements (newest first)
  - "New Announcement" form — title + body — disabled with a clear explanation if instructor is outside their engagement window (ANN-2)
  - Each post: author, date, title, body. Edit/Delete buttons on own posts only

**Day 4**
- Build `src/views/student/DashboardView.vue`:
  - Ledger balance card — large number, green if ≥ 150, red if < 150
  - At-risk warning banner — shown when `is_at_risk = true`, explains whether it's ledger or course (ANL-1)
  - Grand total score card
  - Mini attendance trend: last 5 sessions as colored status dots
  - Quick-link cards to: Grades, Submissions, Attendance, Excuses

**Day 5**
- Build `src/views/student/AnnouncementsView.vue`:
  - Feed of cohort announcements — read only for students
  - Newest first, show author name + role + date
  - Article-style formatting: title is large, body supports line breaks (ANN-3)
- End-to-end test student and instructor flows together

### Your Postman→Vue Checklist

- [ ] Instructor dashboard loads their group's analytics (not the full cohort)
- [ ] Submission tracker table shows correct submitted/graded status
- [ ] Instructor delivered hours shown correctly
- [ ] Instructor announcements: "New Announcement" button is visible and enabled during active window
- [ ] Instructor announcements: button disabled (with tooltip) outside engagement window (ANN-2)
- [ ] Announcements: edit/delete only appears on the instructor's own posts
- [ ] Student dashboard: ledger balance colored correctly (green/red threshold at 150)
- [ ] Student dashboard: at-risk banner is prominent and explains the reason
- [ ] Student dashboard: attendance trend shows last 5 sessions as colored dots
- [ ] Student announcements: read-only feed, no create form
- [ ] Announcement feed: newest post appears at the top after creation
- [ ] Grand total displayed correctly on student dashboard

### Key Rules for Your Area

- **ANN-2 is enforced by the API but must also be handled gracefully in the UI** — don't hide the button entirely; disable it and show a tooltip explaining "You can only post announcements during your active engagement window." An invisible button is confusing; a disabled one with context is good UX
- The student dashboard is the most visited screen — make it fast. Call `GET /analytics/student` once on mount, not multiple separate API calls
- The at-risk banner must clearly explain WHY the student is at risk — parse `is_at_risk` and the course data to show "Your attendance ledger is below 150" or "Your score in Laravel Backend is below 60"
- Announcement body should preserve newlines — use `white-space: pre-wrap` in CSS or render with `<br>` replacements (ANN-3)
- The attendance trend dots on the student dashboard should reuse Menna's `attendance` store — don't create a duplicate API call. Coordinate with Menna to agree on the store method signature on Day 1

---

## Dependency Map

```
Mansoura (Axios + auth store + router)
    └── EVERYONE depends on this — she goes first

Mansoura (AppModal, AppTable, AppBadge, AppToast, AppButton, AppInput)
    └── Giza, Menna, Khaled, Wael all use these UI components

Mansoura (analytics store)
    └── Giza (track admin dashboard uses fetchCohort)
    └── Wael (instructor dashboard calls instructor analytics endpoint)

Giza (sessions store → deliver method)
    └── Menna (instructor attendance view has "Mark Delivered" button)

Menna (attendance store)
    └── Wael (student dashboard mini attendance trend)

Khaled (grades store → fetchSummary)
    └── Wael (student dashboard shows grand total)

Menna (ledger store)
    └── Khaled (grade summary includes ledger balance)
```

---

## Integration Rules

1. **Never push to `main` without one teammate reviewing your PR.** Use feature branches and open PRs daily.
2. **Agree on store method signatures before calling each other's stores.** Menna and Wael must agree on `attendanceStore.fetchForStudent(userId)` before Day 4.
3. **Every store action must return something useful** — either the data or throw an error. Never return `undefined` silently.
4. **Use `v-if="!loading"` with a spinner fallback on every data-dependent section.** No blank screens.
5. **Test on mobile viewport before Day 5.** Student views are used on phones. Open Chrome DevTools → toggle device toolbar → test at 390px width.

---

## Phase 4 — Shared Completion Checklist

Sign off on this together before the demo:

- [ ] All four role dashboards functional end-to-end — Mansoura
- [ ] No hardcoded data anywhere — All
- [ ] Auth token persists on page refresh — Mansoura
- [ ] Route guards prevent cross-role URL access — Mansoura
- [ ] All `422` errors show field-level messages inside forms — All
- [ ] All `403` responses show a readable error message — Mansoura
- [ ] File uploads: submissions and excuse attachments both work — Khaled + Menna
- [ ] File size and type validated client-side before upload — Menna + Khaled
- [ ] QR display renders a scannable code — Menna
- [ ] QR scanner sends payload to API, shows result — Menna
- [ ] Attendance ledger balance color-coded (green/red) — Menna + Wael
- [ ] At-risk banner explains the reason — Wael
- [ ] Grade override requires a reason, audit trail visible — Khaled
- [ ] Announcements: instructor post disabled outside engagement window — Wael
- [ ] `npm run build` completes without errors — All
- [ ] Tested on mobile viewport — All

---

*Full implementation details, code samples, and component patterns are in `phase4_implementation_plan.md`*
