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
- **Instant Language Switching**: Toggle between **English** and **ភាសាខ្មែរ** on the fly via a segmented control pill in the top navigation bar.
- **Full Application Coverage**: Complete dictionary coverage (199 keys) across all modules, forms, modals, tables, toasts, buttons, and validation messages.
- **Persistent Selection**: Language preference is automatically saved in `localStorage` (`school_language`) and restored on page refresh.

### 🛡️ Enterprise-Grade Authentication & Security
- **Stateless Bearer JWT**: Secure token management stored in `localStorage` with fail-closed cryptographic validation.
- **Client-Side Token Expiration Watcher**: Automated logout trigger upon token expiration, preventing invalid API calls.
- **Multi-Tab Session Synchronization**: Instant real-time logout synchronization across all open browser tabs via browser `storage` events.
- **Request & Response Interceptors**:
  - Automatically attaches `Authorization: Bearer <token>` to outbound API requests.
  - Intercepts `401 Unauthorized` responses to safely terminate sessions and route to `/login`.
- **Brute-Force & Rate-Limiting Guard**: Automatic temporary lockout on excessive failed login attempts with countdown timer.
- **Role-Based Access Control (RBAC)**: Fine-grained route protection (`ProtectedRoute`) guarding Admin, Teacher, and Student views.

### 🎨 Modern Slate & Navy Dark Theme & Fluid Layout
- **Sleek Aesthetic**: High-contrast, accessibility-tested Dark Mode utilizing CSS custom properties, backdrop blurs, and vibrant accent colors.
- **Ultra-Smooth Collapsible Sidebar (60fps)**:
  - Synchronized transition curves (`0.3s cubic-bezier(0.4, 0, 0.2, 1)`) matching sidebar width and content margin.
  - Smooth text fade/slide transitions without line wrapping or layout jitter.
  - Floating circular toggle button gliding seamlessly across the sidebar border.
- **Desktop Top Navigation Bar**: Sticky top bar housing the full institutional brand chip, language switcher, and interactive user profile pill with role badge.
- **Zero Horizontal Overflow / Responsive Grid**:
  - Engineered with `width: calc(100% - 260px)` and responsive auto-fit grids (`minmax(210px, 1fr)`).
  - Perfectly adapts to any browser window resize, zoom level, laptop screen, tablet, or mobile viewport.

---

## 📑 Core Modules

- **Dashboard (`/`)**: Real-time counter metrics (Total Students, Total Teachers, Active Courses), quick action navigation cards with hover elevation, and an interactive Courses Overview table with visual seat availability progress bars.
- **Departments Management (`/departments`)**: Full CRUD operations for faculties & departments with department code, name, description, office location, contact email, and active status toggle (Admin only).
- **Faculty & Instructors (`/teachers`)**: Instructor directory with qualifications, years of experience, department assignments, contact info, and assigned courses modal (Admin only).
- **Students Management (`/students`)**: Debounced real-time search, gender filtering, pagination, Add/Edit modal dialogs, and enrolled courses inspector (Admin & Teacher).
- **Courses & Curriculum (`/courses`)**: Capacity tracking, credit hours, tuition fee formatting, teacher/department associations, and direct enrollment links.
- **Course Enrollment (`/enrollments`)**: Student course enrollment with early-bird discount calculation, seat deduction, status updates (`PENDING`, `CONFIRMED`, `CANCELLED`), one-click staff confirmation, and protected cancellation with seat restocking.
- **Profile & Security (`/profile`)**: User information inspector, active role display, and password modification form with validation.

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
│   │   ├── LanguageSwitcher.jsx # EN/KM segmented control pill
│   │   ├── ProtectedRoute.jsx   # Role & authentication guard
│   │   ├── PublicRoute.jsx      # Guest-only guard (redirects if authenticated)
│   │   ├── RouteLoadingWatcher.jsx # Route progress indicator
│   │   └── SchoolLogo.jsx       # Custom SVG vector brand logo
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state, JWT parsing & session sync
│   │   ├── LanguageContext.jsx  # i18n language provider & translate hook (t)
│   │   └── LoadingContext.jsx   # Global top-bar loading progress state
│   ├── i18n/
│   │   └── translations.js      # English & Khmer translation dictionary (199 keys)
│   ├── layouts/
│   │   └── DashboardLayout.jsx  # Layout with top navigation & smooth collapsible sidebar
│   ├── pages/
│   │   ├── CoursesPage.jsx      # Course catalog & curriculum management
│   │   ├── DashboardPage.jsx    # Metrics overview & quick action triggers
│   │   ├── DepartmentsPage.jsx  # Academic departments directory
│   │   ├── EnrollmentsPage.jsx  # Student course registrations & confirmations
│   │   ├── LoginPage.jsx        # Secure login form with rate-limiting
│   │   ├── ProfilePage.jsx      # Account profile & password change
│   │   ├── StudentsPage.jsx     # Student directory with search & filters
│   │   └── TeachersPage.jsx     # Faculty & instructor roster
│   ├── utils/
│   │   └── tokenSecurity.js     # JWT decode, expiry check & token sanitization
│   ├── App.jsx                  # Main routing configuration
│   ├── index.css                # Slate & Navy theme, animations & responsive styles
│   └── main.jsx                 # React root bootstrap
```

---

## 🤝 Contributing & License

Developed with ❤️ as part of the **School Management System** project.  
Licensed under the [MIT License](LICENSE).
