# School Management System - Frontend (React + Vite)

A modern, high-performance, and secure frontend application built with **React 19**, **Vite**, **React Router 7**, and **Axios**, engineered to connect seamlessly with the **[Spring Boot 3 School Management System REST API](https://github.com/YimLemeng/School-management-system)**.

> 🌐 **Live Demo Application**: [https://school-management-system-web.yimlemeng.workers.dev](https://school-management-system-web.yimlemeng.workers.dev)  
> 🔗 **Backend API Repository**: [https://github.com/YimLemeng/School-management-system](https://github.com/YimLemeng/School-management-system)

---

## 🔑 Demo Accounts (Live Production)

Access to the system is strictly authenticated and managed by administrators (public self-registration is disabled for security and institutional data integrity).

| Role | Username / Email | Password | Allowed Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `admin@school.edu.kh` | `admin123` | Full access (Departments, Teachers, Students, Courses, Confirm/Cancel Enrollments) |
| **Teacher** | `teacher` / `teacher@school.edu.kh` | `teacher123` | Student directory, explore course curriculum, confirm enrollments |

---

## 🚀 Key Features & Architectural Highlights

### 🌐 Bilingual Support (English 🇬🇧 & Khmer 🇰🇭)
- **Instant Language Switching**: Toggle between **English** and **ភាសាខ្មែរ** on the fly via a segmented control pill in the top navigation bar or the floating glassmorphic pill on the login page.
- **Full Application Coverage**: Complete dictionary coverage across all modules, forms, modals, tables, toasts, buttons, and validation messages.
- **Persistent Selection**: Language preference is automatically saved in `localStorage` (`school_language`) and restored on page refresh.

### 🛡️ Enterprise-Grade Authentication & Security
- **Stateless Bearer JWT with Sanitization**: Secure token management stored in `localStorage` with fail-closed cryptographic validation, base64 padding defense, and sanitization (`cleanToken`, `isSafeTokenString`).
- **Cryptographic Ground-Truth RBAC**: Cross-references roles directly from the cryptographically signed JWT payload (`roles` / `authorities`) rather than trust mutable `localStorage` objects, preventing client-side privilege escalation.
- **Client-Side Token Expiration Watcher**: Automated logout timer scheduled down to the millisecond with a 5-second in-flight safety buffer (`getTimeUntilExpiry`).
- **Multi-Tab Session Synchronization**: Instant real-time logout synchronization across all open browser tabs via browser `storage` events.
- **Resilient Request & Response Interceptors**:
  - Automatically attaches `Authorization: Bearer <token>` to outbound API requests.
  - Intercepts `401 Unauthorized` responses to safely terminate sessions, fire internal `auth:logout` events, and route cleanly to `/login`.
  - Non-destructive `/auth/me` verification: Preserves authenticated sessions during temporary network hiccups or server restarts, only terminating when a true 401 response is returned.
- **Brute-Force & Rate-Limiting Guard**: Automatic temporary lockout (30 seconds) on 5 consecutive failed login attempts with live countdown timer and immediate password memory clearance.
- **Role-Based Route Guards**: Fine-grained route protection (`ProtectedRoute` & `PublicRoute`) guarding Admin, Teacher, and Student routes with instant preloader feedback.

### 🎨 Modern Clean Architecture & Silky Smooth UI
- **Professional Academic Design**: Modern clean light theme canvas with charcoal-slate dark sidebar and crisp card elevations.
- **Campus Login Background**: High-resolution university campus background with a dark slate/navy gradient overlay and glassmorphic language switcher.
- **React Portal Modals (`ModalPortal`)**:
  - Modals mount directly on `document.body` via React Portals.
  - Guarantees 100vw × 100vh full-screen backdrop overlay without any bottom cut-offs or viewport displacement.
  - Mathematically centered in the browser viewport across all screen sizes and zoom levels.
- **Centered Loading & Empty States**:
  - Centralized responsive loading spinner (`.table-loading`) with signature primary blue spinner.
  - Centered empty-state banners with contextual iconography.
- **Ultra-Smooth Transitions**:
  - Global `scroll-behavior: smooth` and font anti-aliasing.
  - Smooth page navigation transitions with cubic-bezier easing (`0.16, 1, 0.3, 1`).
  - Interactive hover elevation on cards (`.action-card`, `.course-card`) and table rows.

---

## 📑 Core Modules

- **Dashboard (`/`)**: Real-time counter metrics (Total Students, Total Teachers, Active Courses, Departments), quick action navigation cards with hover elevation, and an interactive Courses Overview table with visual seat availability progress bars.
- **Departments Management (`/departments`)**: Full CRUD operations for faculties & departments with department code, name, description, office location, contact email, and active status toggle (Admin only).
- **Faculty & Instructors (`/teachers`)**: Instructor directory with qualifications, years of experience, emergency phone tracking, department assignments, and assigned courses modal (Admin only).
- **Students Management (`/students`)**: Debounced real-time search, gender filtering, pagination, Add/Edit modal dialogs, interactive Active/Inactive status toggle with indicator dot, and enrolled courses inspector (Admin & Teacher).
- **Courses & Curriculum (`/courses`)**: Capacity tracking, credit hours, tuition fee formatting, teacher assignment dropdown in Add Course modal, department associations, aligned badges, and pagination.
- **Course Enrollment (`/enrollments`)**: Student course enrollment with early-bird discount calculation, seat deduction, status updates (`PENDING`, `CONFIRMED`, `CANCELLED`), one-click staff confirmation, and protected cancellation with seat restocking.
- **Profile & Security (`/profile`)**: User information inspector, active role display, and password modification form with validation and memory safety.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- **Node.js**: `v18+` or `v20+` (Node.js 22/24 recommended)
- **npm** or **pnpm** / **yarn**
- **Running Backend API**: Ensure the [Spring Boot Backend](https://github.com/YimLemeng/School-management-system) is running on `http://localhost:8080`.

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YimLemeng/School-management-system-web.git
   cd School-management-system-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**:
   ```bash
   cp .env.example .env
   # Ensure VITE_API_BASE_URL points to your backend (default: http://localhost:8080/api/v1)
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and visit: `http://localhost:5173`

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Lint & Code Quality**:
   ```bash
   npm run lint
   ```

---

## 📁 Project Structure

```
school-management-frontend/
├── package.json               # Dependencies & build scripts (Vite, React 19, Oxlint)
├── vite.config.js             # Vite configuration with React plugin
├── public/
│   ├── favicon.svg            # Academic graduation cap favicon
│   ├── login-bg.jpg           # High-resolution campus background image
│   └── school-brand-logo.svg  # Vector brand logo asset
├── src/
│   ├── api/
│   │   ├── axiosClient.js     # Axios instance with JWT interceptors & token validation
│   │   ├── authApi.js         # Authentication, login, me, password change
│   │   ├── courseApi.js       # Courses endpoints & capacity filters
│   │   ├── departmentApi.js   # Departments CRUD endpoints
│   │   ├── enrollmentApi.js   # Enrollments endpoints, confirm & cancel
│   │   ├── studentApi.js      # Students endpoints & pagination
│   │   └── teacherApi.js      # Faculty & instructors endpoints
│   ├── components/
│   │   ├── AppPreloader.jsx   # Institutional session preloader screen
│   │   ├── LanguageSwitcher.jsx # EN/KM segmented control pill
│   │   ├── ModalPortal.jsx    # React Portal wrapper for 100vw/100vh centered modals
│   │   ├── ProtectedRoute.jsx # Role & authentication route guard
│   │   ├── PublicRoute.jsx    # Guest-only guard (redirects if authenticated)
│   │   ├── RouteLoadingWatcher.jsx # Safari/WebKit bfcache & history traversal guard
│   │   └── SchoolLogo.jsx     # Custom SVG vector brand logo
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication state, JWT parsing & session sync
│   │   ├── LanguageContext.jsx# i18n language provider & translate hook (t)
│   │   └── LoadingContext.jsx # Global loading progress state
│   ├── i18n/
│   │   └── translations.js    # English & Khmer translation dictionary
│   ├── layouts/
│   │   └── DashboardLayout.jsx# Layout with top navigation & smooth collapsible sidebar
│   ├── pages/
│   │   ├── CoursesPage.jsx    # Course catalog, teacher selection modal & pagination
│   │   ├── DashboardPage.jsx  # Metrics overview & quick action triggers
│   │   ├── DepartmentsPage.jsx# Academic departments directory
│   │   ├── EnrollmentsPage.jsx# Student course registrations & confirmations
│   │   ├── LoginPage.jsx      # Campus background login with rate-limiting guard
│   │   ├── ProfilePage.jsx    # Account profile & password change
│   │   ├── StudentsPage.jsx   # Student directory with active/inactive status toggle
│   │   └── TeachersPage.jsx   # Faculty & instructor roster with emergency contacts
│   ├── utils/
│   │   └── tokenSecurity.js   # JWT decode, expiry check & token sanitization
│   ├── App.jsx                # Main routing configuration
│   ├── index.css              # Modern clean styles, animations & responsive system
│   └── main.jsx               # React root bootstrap
```

---

## 🤝 Contributing & License

Developed with ❤️ as part of the **School Management System** project.  
Licensed under the [MIT License](LICENSE).
