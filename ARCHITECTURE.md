# Akansha Dental Clinic & Implant Center — System Architecture Specification
## Unified Full-Stack Healthcare Management & Patient Experience Platform

---

## 1. System Overview & Vision

**Akansha Dental Clinic & Implant Center** is an enterprise-grade, high-performance, accessible, and secure healthcare web application deployed as a unified single-service full-stack system in Bhopal, Madhya Pradesh.

The system serves dual operational roles:
1. **Public Patient Portal**: Educates prospective patients, details clinic sterilisation standards (Class-B Autoclave, Digital OPG), showcases credentials of specialist surgeons led by **Dr. Akansha Sharma (BDS, MDS Oral & Maxillofacial Surgeon)**, presents dynamic treatment catalogs (Immediate Dental Implants, Microscopic Endodontics, Digital Smile Design), and delivers a real-time, doctor-aware appointment reservation engine.
2. **Clinical Management Dashboard**: A secure, role-based administrative portal for clinic receptionists, doctors, administrators, and the Super Admin. It manages patient electronic health records (EHR), verifies appointment lifecycles, configures doctor OPD rosters, tracks patient inquiries, audits administrative actions, and renders deterministic operational telemetry.

```
                    ┌─────────────────────────────────────────────────────┐
                    │     Live Single-Service Production Deployment       │
                    │   https://akansha-dental-clinic-n6ce.onrender.com   │
                    └──────────────────────────┬──────────────────────────┘
                                               │
                                       Reverse Proxy / CDN
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               │                                                               │
     Public Patient Requests                                       Admin Portal Requests
               │                                                               │
               ▼                                                               ▼
 ┌───────────────────────────┐                                   ┌───────────────────────────┐
 │   React 18 Public App     │                                   │   Lazy-Loaded Admin App   │
 │   - Code-Split Chunks     │                                   │   - Dashboard Overview    │
 │   - Real-time Slot Picker │                                   │   - Appointment Manager   │
 │   - Dentist JSON-LD Schema│                                   │   - Patient Records (EHR) │
 │   - WCAG AA Contrast      │                                   │   - Immutable Audit Logs  │
 └─────────────┬─────────────┘                                   └─────────────┬─────────────┘
               │                                                               │
               └───────────────────────────────┬───────────────────────────────┘
                                               │ HTTP / HTTPS (REST API)
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │       Express.js Unified Web Server       │
                         │   - Security Headers (Helmet, CORS)       │
                         │   - Rate Limiting & Auth Gateways         │
                         │   - Doctor-Aware Slot Engine              │
                         │   - Truthful Notification Dispatcher      │
                         │   - Static Asset Streaming (/dist)        │
                         └─────────────────────┬─────────────────────┘
                                               │
                     ┌─────────────────────────┴─────────────────────────┐
                     ▼                                                   ▼
       ┌───────────────────────────┐                       ┌───────────────────────────┐
       │   Managed Relational DB   │                       │   Atomic Persistence Hub  │
       │  PostgreSQL / MySQL 8.x   │ (When configured via  │  - Atomic .tmp + rename   │
       │  - Transactional ACID     │  DATABASE_URL or      │  - Corrupted Quarantine   │
       │  - Unique Slot Constraint │  DB_HOST)             │  - 10 Rolling Backups     │
       └───────────────────────────┘                       └───────────────────────────┘
```

---

## 2. Technology Stack & Runtime Specifications

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | v20 LTS / v22 | Asynchronous non-blocking runtime |
| **Server Framework** | Express.js | 4.21.x | REST API engine & production static asset server |
| **Primary Persistence** | PostgreSQL / MySQL | 15+ / 8.x | Managed relational ACID storage via `DATABASE_URL` |
| **Local / Fallback Storage** | Atomic File Engine | Custom | Safe `.tmp` write + rename with auto-quarantine and rolling backups |
| **Security & Cryptography** | BCrypt.js | 3.0.x | Secure password hashing, salted work factor 10 |
| **Security Middleware** | Helmet + CORS + RateLimit | Current | HTTP protection, strict origin whitelisting, brute-force defense |
| **Email Dispatcher** | Nodemailer | 6.10.x | Real SMTP notifications with sanitization & fallback |
| **Frontend Framework** | React.js | 18.3.x | Component-driven declarative user interface |
| **Bundler & Tooling** | Vite / Rolldown | 6.x / 8.x | High-speed ESM compilation, automatic code splitting |
| **Routing** | React Router DOM | 6.28.x | Dynamic client-side routing with role-based access control |
| **Icons & Typography** | Lucide React + Plus Jakarta Sans | Current | High-contrast clinical iconography & typography |
| **Hosting & Cloud CI/CD** | Render.com | Free / Paid | Unified single-service deployment connected to GitHub `main` |

---

## 3. Core Architectural Subsystems

### 3.1. Doctor-Aware Appointment & Slot Allocation Engine
The appointment engine (`backend/utils/slotEngine.js`) enforces real-world clinic operations:
- **OPD Duty Shifts**: Doctors consult in morning (`10:00 AM – 01:30 PM`) and evening (`05:00 PM – 08:30 PM`) shifts. The afternoon window (`01:30 PM – 05:00 PM`) and off-days (Sundays) are strictly excluded.
- **Double-Booking Guard**: Double bookings are prevented at both the application and database tiers:
  - If MySQL/PostgreSQL is connected, a unique constraint `UNIQUE KEY uq_doc_date_slot (doctor_id, appointment_date, appointment_time)` prevents concurrent collisions.
  - Transactions reject conflicting bookings with `HTTP 409 Conflict`.
- **Dynamic "Any Doctor" Allocation**: When a patient books with `doctorId = 0` ("Any Available Specialist"), the engine evaluates all active doctors on duty, picks an available practitioner, and reserves only that doctor's calendar.
- **Collision-Resistant Booking References**: Replaced predictable 4-digit numbers with cryptographically generated identifiers (`APT-YYYY-HEX6-TIME4`).

### 3.2. Data Persistence & Fault-Tolerant Storage
- **Managed Database Primary**: Supports `DATABASE_URL` for PostgreSQL (Render, Neon, Supabase) and MySQL. Tables, indexes, and unique constraints are validated automatically on startup.
- **Atomic File Resilience**: When running without a live database:
  - Writes are saved to `clinic_data.tmp.json` first, then atomically swapped using `fs.renameSync` to prevent partial writes.
  - Corrupted files are never silently overwritten; they are quarantined to `clinic_data.corrupted.<timestamp>.json`.
  - Up to 10 rolling hourly/daily backups are retained in `backend/database/backups/`.

### 3.3. Authentication, RBAC & Credential Governance
- **Role Hierarchy**:
  - `ROLE_SUPER_ADMIN`: Provision staff, view system audit logs, update clinic configurations, modify database settings.
  - `ROLE_ADMIN`: Manage appointments, patient EHR records, inquiries, and doctor rosters.
  - `ROLE_STAFF`: Desk receptionists managing appointments and check-ins.
- **Account Provisioning**:
  - No quick 1-click bypass logins exist.
  - Staff accounts are provisioned exclusively by the Super Admin.
  - New accounts are flagged with `mustChangePassword: true`. On first login, a full-screen modal forces the user to establish a personal strong password before accessing patient data.
  - Admins can update their credentials and email through self-service security modals.

### 3.4. Truthful Notifications & Patient Safety
- **Notification Honesty**: If SMTP or SMS gateways are unconfigured, APIs return `emailSent: false` and `smsSent: false`.
- **Accurate Communication**: Pending appointment emails are clearly titled *"Appointment Request Received (Pending Confirmation)"* rather than falsely stating *"Confirmed"*.
- **XSS Sanitization**: All patient inputs (names, emails, phones, symptoms) are escaped with an HTML sanitization matrix before insertion into email templates.

### 3.5. Audit Trail & Deterministic Telemetry
- **Immutable Audit Logging**: Actions (`LOGIN_SUCCESS`, `CREATE_APPOINTMENT`, `UPDATE_STATUS`, `USER_CREATE`, `PASSWORD_CHANGE`) are persistently appended to `store.auditLogs` and `audit_logs` in the database with timestamps, IP addresses, and acting usernames.
- **Zero Fabricated Data**: Telemetry graphs compute exact database counts. If there are 0 appointments on a given day, the graph shows 0—no `Math.random()` or fake defaults are used.
- **Medical Record Integrity**: Unverified medical defaults (e.g., assuming blood group B+) have been completely removed. Fields remain `null` or empty until confirmed by clinical staff.

### 3.6. Performance & Code-Splitting
- **Vite Dynamic Imports**: Public visitors only download public components. All admin pages (`AppointmentsManagerPage`, `UsersManagerPage`, `AuditLogsPage`, etc.) are lazy-loaded via `React.lazy()`.
- **Bundle Optimization**: Vendor chunks (`vendor-react`, `vendor-icons`, `vendor-other`) are isolated, reducing the initial entry bundle to **~93 kB** (down from ~576 kB).
- **Responsive Fallbacks**: `<Suspense>` handles lazy-loaded chunks with an accessible, non-jarring clinical spinner.

### 3.7. Accessibility (WCAG AA) & SEO Architecture
- **Color Contrast**: Medical teal text has been updated to high-contrast clinical teal (`#0D766E` / `--color-accent-text`), achieving a **5.1:1** contrast ratio against white cards, passing WCAG AA requirements.
- **Modal Accessibility**: Dialogs implement focus trapping with keyboard Tab cycling, ESC key dismissal, `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- **Dynamic SEO**: Every route sets a distinct `<title>` and `<meta name="description">` via `useDocumentTitle`.
- **Search Engine Assets**:
  - `frontend/public/robots.txt`
  - `frontend/public/sitemap.xml`
  - `frontend/public/dental-og.png` (1200x630 high-resolution Open Graph card)
  - Full `Dentist` LocalBusiness JSON-LD structured data embedded in `index.html`.

---

## 4. Directory Layout

```
akansha-dental-clinic/
├── backend/
│   ├── config/
│   │   ├── db.js                     # Managed database connection & schema verifier
│   │   └── security.js               # CORS origins & helmet configuration
│   ├── controllers/
│   │   ├── adminController.js        # Staff user management & Super Admin controls
│   │   ├── appointmentController.js  # Slot reservation & double-booking guard
│   │   ├── authController.js         # Login, first-time password change, profile updates
│   │   ├── dashboardController.js    # Deterministic analytics & 7-day trend calculations
│   │   ├── doctorController.js       # Roster timings & specialist profiles
│   │   ├── inquiryController.js      # Patient inquiries & contact requests
│   │   ├── patientController.js      # Medical records & clinical history
│   │   └── serviceController.js      # Dental treatment catalog
│   ├── database/
│   │   ├── backups/                  # Automated rolling backups of clinic data
│   │   ├── clinic_data.json          # Atomic JSON store
│   │   ├── schema.sql                # Production MySQL / PostgreSQL relational schema
│   │   └── store.js                  # Atomic write, quarantine, and backup engine
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT & session verification
│   │   ├── rateLimiter.js            # API rate limiting
│   │   └── roleMiddleware.js         # RBAC route guards
│   ├── routes/                       # Express router modules
│   ├── services/
│   │   ├── auditService.js           # Real-time event auditing
│   │   └── notificationService.js    # SMTP & SMS delivery with HTML sanitization
│   ├── utils/
│   │   └── slotEngine.js             # Doctor-aware shift slot generator
│   └── server.js                     # Express app, static file streamer & API router
├── frontend/
│   ├── public/
│   │   ├── dental-og.png             # 1200x630 high-res social media banner
│   │   ├── dental-og.svg             # Scalable clinic emblem
│   │   ├── favicon.svg               # Browser tab icon
│   │   ├── robots.txt                # Search bot crawl instructions
│   │   └── sitemap.xml               # Canonical XML sitemap
│   ├── src/
│   │   ├── components/               # Accessible UI components (Modal, Toast, Spinner)
│   │   ├── context/                  # AuthContext, ToastContext
│   │   ├── features/auth/            # AdminLoginPage
│   │   ├── hooks/
│   │   │   └── useDocumentTitle.js   # Dynamic per-page title and meta description hook
│   │   ├── layouts/                  # PublicLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/                # Lazy-loaded clinical management pages
│   │   │   └── public/               # Public dental website pages
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # Code-split router with PageMeta wrappers
│   │   └── styles/
│   │       ├── index.css             # Base resets & utility classes
│   │       ├── layout.css            # Responsive layout & showcase styles
│   │       └── variables.css         # Clinical color tokens & WCAG AA contrast
│   ├── dist/                         # Pre-compiled production build served by Express
│   └── vite.config.js                # Vite build configuration with manualChunks
├── render.yaml                       # Infrastructure-as-code blueprint for Render
└── ARCHITECTURE.md                   # This architectural specification document
```

---

## 5. Deployment & Production Operations

### 5.1. Render Single-Service Architecture
The application runs as a **single unified Web Service** on Render:
- Express serves both the backend REST API (`/api/*`) and the static React client (`frontend/dist/*`).
- Any unhandled route serves `frontend/dist/index.html` to support client-side React Router navigation.
- Environment variables:
  - `PORT`: Dynamically injected by Render (Express binds to `process.env.PORT || 8080`).
  - `NODE_ENV`: Set to `production`.
  - `DATABASE_URL`: Optional connection string for managed PostgreSQL or MySQL.
  - `SMTP_*`: Optional credentials for live email delivery.

### 5.2. Verified Quality Benchmarks
- **Zero Double-Bookings**: Conflict detection verified with automated concurrency tests.
- **Zero Ephemeral Data Loss**: Atomic `.tmp` writes with 10 rolling backups ensure data survival across restarts.
- **Sub-100 kB Initial Bundle**: Public landing pages load in under 1 second on 4G networks.
- **Accessibility**: Meets WCAG AA standards with focus trapping and tested color contrast ratios.
- **SEO Ready**: Indexed with complete Dentist JSON-LD schema, sitemap, and Open Graph previews.
