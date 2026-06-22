# Sri Gowthami — Student Application & Document Tracker

A modern, enterprise-grade SaaS platform for **Sri Gowthami Educational Institutions** that centralizes student admissions, document verification, application tracking, communication, approvals, and reporting.

## 🚀 Quick Start

```bash
cd sri-gowthami-tracker
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔐 Demo Login

Use the **Quick Demo Login** buttons on the login page:

| Role | Email |
|------|-------|
| **Admission Officer** | admissions@srigowthami.edu.in |
| **Verification Officer** | verify@srigowthami.edu.in |
| **Student** | student@example.com |

> Password field is optional for demo accounts — any value works.
> Admin login requires valid credentials.

## 📋 Features

### Core Modules
- ✅ **Dashboard** — Analytics with animated counters, 4 chart types, activity feed, tasks
- ✅ **Application Management** — Table/grid view, search, filters, bulk actions, pagination
- ✅ **Application Detail** — Overview, documents, timeline, notes tabs
- ✅ **Document Tracker** — Grid/list views, drag-drop upload, document viewer modal
- ✅ **Verification Workflow** — Three-column layout with queue, preview, actions
- ✅ **Student Portal** — Profile completion ring, lifecycle stepper, document checklist
- ✅ **Notification Center** — Filter tabs, read/unread toggle, type-based icons
- ✅ **Reports & Analytics** — Report builder, charts, PDF/Excel/CSV export
- ✅ **Admin Panel** — Users, Courses, Departments, Activity Logs, Settings

### Additional Features
- ✅ **AI Assistant** — Floating chatbot with FAQ responses
- ✅ **Multi-Role Access** — Super Admin, Admission Officer, Verification Officer, Student, Parent
- ✅ **Authentication** — Login with session persistence, registration with multi-step form
- ✅ **Responsive Design** — Desktop, tablet, and mobile layouts
- ✅ **Animations** — Smooth page transitions, hover effects, animated counters
- ✅ **Dark Mode Toggle** — Theme switcher in header

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | TailwindCSS v4 |
| Animations | Motion (Framer Motion v12) |
| State | Zustand v5 |
| Server State | TanStack React Query v5 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| PDF Export | jsPDF |
| Excel Export | xlsx (SheetJS) |
| Router | React Router v7 |

## 📁 Project Structure

```
src/
├── components/
│   ├── ai-assistant/     # Floating AI chatbot
│   └── layout/           # Sidebar, Header, MainLayout
├── data/
│   └── mockData.ts       # Comprehensive sample data
├── lib/
│   └── utils.ts          # Utilities (cn, formatters, helpers)
├── pages/
│   ├── auth/             # Login, Register
│   ├── AdminPage.tsx
│   ├── ApplicationDetailPage.tsx
│   ├── ApplicationsPage.tsx
│   ├── DashboardPage.tsx
│   ├── DocumentsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── ReportsPage.tsx
│   ├── StudentPortalPage.tsx
│   └── VerificationPage.tsx
├── store/                # Zustand stores
│   ├── applicationStore.ts
│   ├── authStore.ts
│   ├── documentStore.ts
│   ├── notificationStore.ts
│   └── uiStore.ts
├── types/
│   └── index.ts          # TypeScript type definitions
├── App.tsx               # Router configuration
├── main.tsx              # Entry point
└── index.css             # Design system & global styles
```

## 🎨 Design System

- **Primary**: #2563EB (Blue), #3B82F6 (Light Blue)
- **Secondary**: #10B981 (Emerald), #F59E0B (Amber)
- **Background**: #F8FAFC, #FFFFFF
- **Effects**: Glassmorphism, soft gradients, smooth shadows
- **Corners**: 16px–24px border radius
- **Font**: Inter (Google Fonts)
- **Animations**: Spring-based transitions, staggered entrances

## 📊 Sample Data

The app ships with realistic sample data:
- 15+ users across all roles
- 6 departments and 10+ courses
- 20+ applications with varied statuses
- 50+ documents with verification records
- 20+ notifications
- 30+ activity logs
- 12 months of chart data

## 🔧 Build

```bash
npm run build    # Production build
npm run preview  # Preview production build
```

## 📜 License

© 2026 Sri Gowthami Educational Institutions. All rights reserved.
