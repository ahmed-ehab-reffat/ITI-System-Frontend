# TrackIQ — ITI Attendance & Grading Platform (Frontend)

Vue 3 frontend for the ITI Attendance & Grading Platform. A role-based single-page application that manages attendance, grading, submissions, and analytics for a single ITI branch running multiple training tracks.

**Live:** [https://iti-system-frontend.vercel.app](https://iti-system-frontend.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Router | Vue Router 5 |
| State | Pinia 3 |
| HTTP | Axios |
| CSS | Tailwind CSS 4 |
| Build | Vite 8 |
| QR | `qrcode` (generation), `html5-qrcode` (scanning) |
| Testing | Vitest + Vue Test Utils |
| Linting | ESLint + OxLint + Prettier |

---

## Project Structure

```
src/
├── api/                  # Axios instance with interceptors
├── assets/               # Tailwind config, global styles, logo
├── components/
│   ├── ui/               # Button, Input, Modal, Table, Badge, Spinner, Pagination, Toast
│   ├── shared/           # Sidebar, StatCard, ConfirmModal, TagManager, QrDisplay, QrScanner
│   ├── track-admin/      # CoursesSetup, LabGroupsSetup, EngagementsSetup, SessionsSetup, etc.
│   ├── instructor/       # EngagementCard, SessionSelector, QrCodeDisplay
│   ├── student/          # AtRiskBanner, CourseGradeCard
│   ├── manager/          # TrackStatCard, AtRiskList, GraderConsistencyTable
│   ├── billing/          # BillingTable, BillingDetail
│   └── announcements/    # AnnouncementCard, AnnouncementForm
├── composables/          # useAuth, useApi, useToast, useConfirm, useNfcScanner
├── layouts/              # MainLayout
├── router/               # Route definitions + role-based guards
├── stores/               # 16 Pinia stores (auth, users, tracks, cohorts, courses, etc.)
└── views/
    ├── auth/             # LoginView
    ├── branch-manager/   # Dashboard, Users, Cohorts, Tracks, Billing
    ├── track-admin/      # Dashboard, CohortSetup, Students, Grades, Attendance, Excuses, Announcements
    ├── instructor/       # Dashboard, Grades, Attendance, QR Generate
    ├── student/          # Dashboard, Grades, Submissions, Attendance, Excuses, QR Scan
    └── shared/           # AnnouncementsView
```

---

## Roles & Features

### Branch Manager (`/manager/*`)
- Branch-wide analytics dashboard (students, cohorts, at-risk, instructors)
- User management (CRUD, role filtering, compensation config, deactivation)
- Cohort and track management
- Billing rollup (internal vs external instructor hours)

### Track Admin (`/admin/*`)
- Cohort dashboard (grade distribution, grader consistency, at-risk students, submission status)
- Cohort setup (courses, lab groups, engagements, sessions)
- Gradebook (enter exam grades, override with mandatory reason, audit trail)
- Attendance management (inline status updates, ledger delta feedback)
- Excuse request workflow (approve/reject with notes)
- Announcements

### Instructor (`/instructor/*`)
- Engagement dashboard
- Lab grading (view submissions, PDF viewer, URL links, enter scores, manage tags)
- Attendance (session selector, QR code display, manual records, mark delivered)

### Student (`/student/*`)
- Dashboard (at-risk banner, attendance balance, grade cards)
- Grade summary (ledger, per-course breakdown, grand total)
- Submissions (URL or file upload, resubmit, late penalty tracking)
- Attendance history (ledger balance, session log, deduction history)
- Excuse requests (submit with attachment)
- QR/NFC check-in

---

## Getting Started

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm

### Setup

```bash
git clone https://github.com/ahmedehhab/ITI-System-Frontend.git
cd ITI-System-Frontend
npm install
```

### Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000/api
```

For production, the `.env` points to `http://3.126.139.204/api` and Vercel rewrites `/api/*` to that backend.

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Other Commands

```bash
npm run test:unit    # Run unit tests
npm run lint         # Lint with ESLint + OxLint
npm run type-check   # TypeScript checking
npm run format       # Format with Prettier
```

---

## Architecture

### Authentication

- JWT token stored in `localStorage` (`auth_token`)
- User object persisted in `localStorage` (`auth_user`)
- Axios request interceptor attaches `Authorization: Bearer` header to every request
- Axios response interceptor catches `401` and forces logout + redirect to `/login`
- Route guards enforce role-based access; `track_admin` can also access manager routes

### State Management

16 Pinia stores handle API calls and local state:

| Store | Purpose |
|---|---|
| `auth` | Login, logout, role detection, token persistence |
| `users` | User CRUD with pagination |
| `tracks` | Track CRUD with pagination |
| `cohorts` | Cohort lifecycle management |
| `courses` | Course CRUD scoped to cohort |
| `labGroups` | Lab group management + student assignment |
| `engagements` | Instructor-course assignments |
| `sessions` | Session management, mark delivered |
| `attendance` | Record/fetch attendance per session |
| `grades` | Grade summary, exam entry, overrides |
| `submissions` | Student work submission + grading |
| `excuseRequests` | Excuse workflow (submit, approve, reject) |
| `announcements` | Announcement CRUD |
| `billing` | Billing records + summary |
| `ledger` | Attendance ledger balance + history |
| `tags` | Student tags (instructor use) |
| `analytics` | Branch/cohort analytics, at-risk data |

### Design System

- Material Design 3-inspired token system (Tailwind CSS `@theme`)
- Primary: `#A9CFE0` / `#345968`
- Font: Inter
- Icons: Material Symbols Outlined
- Responsive: mobile sidebar with overlay, desktop fixed sidebar

---

## API Communication

All API calls go through `src/api/axios.js`:

- **Base URL:** `VITE_API_URL`
- **Request interceptor:** Attaches auth token, strips `Content-Type` for `FormData`
- **Response interceptor:** Global `401` handling (logout + redirect)

---

## Deployment

Deployed on **Vercel** with API proxy:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://3.126.139.204/api/:path*" }
  ]
}
```

---

## Contributors

| Name | GitHub |
|---|---|
| Ahmed Ehab Ahmed | [@ahmed-ehab-reffat](https://github.com/ahmed-ehab-reffat) |
| Ahmed Ehab Farouq | [@ahmedehhab](https://github.com/ahmedehhab) |
| Khaled Cherif | [@Khaleddd11](https://github.com/Khaleddd11) |
| Ahmed Wael | [@notahmedwael](https://github.com/notahmedwael) |
| Menna Mohamed | [@menna7634](https://github.com/menna7634) |

---

## License

This project was developed as a capstone project for the Information Technology Institute (ITI) Full-Stack Web Development program.
