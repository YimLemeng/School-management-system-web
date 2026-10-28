# School Management System - Frontend (React + Vite)

A modern, responsive, and secure frontend application built with **React (Vite)**, **React Router**, and **Axios**, designed to connect directly with the **Spring Boot 3 School Management System REST API**.

---

## 🚀 Features

- **JWT Authentication & RBAC**:
  - Stateless Bearer Token stored securely in `localStorage`
  - Automatic `Authorization: Bearer <token>` attachment via Axios request interceptor
  - Auto-logout on token expiration (401 response handling)
  - Role-based route & action guards (`ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STUDENT`)
  - Password visibility toggle (`Eye` / `EyeOff`) on Login & Register forms
  - Pre-seeded one-click demo credentials for rapid testing
- **Pages & Modules**:
  - **Dashboard**: Live counter metric cards (Students, Courses, Backend Server Status), quick action shortcuts with animated hover lift, and an interactive Course catalog table with real-time seat availability progress bars.
  - **Departments Management (`/departments`)**: Full CRUD operations for faculties & departments with code, name, description, office location, contact email, and active status toggle.
  - **Faculty & Instructors (`/teachers`)**: Manage teachers, hire dates, academic qualifications/degrees, department affiliations, and contact info.
  - **Students Management (`/students`)**: Search with debounce, gender filter, pagination, Add/Edit Student modal with clean payload validation, and delete action.
  - **Courses & Curriculum (`/courses`)**: Live available seats capacity progress bars, Max fee filtering, Department/Teacher assignments, and instant enrollment links.
  - **Course Enrollment (`/enrollments`)**: Interactive early-bird discount preview, seat deduction, status tracking (`PENDING`, `CONFIRMED`, `CANCELLED`), one-click confirmation for staff, and safe cancellation with automatic seat restocking (confirmed enrollments are protected).
  - **Profile & Security (`/profile`)**: Inspect profile attributes and Change Password with `confirmNewPassword` validation.
- **UI & UX Highlights**:
  - **Floating Toast Notifications**: Dynamic, non-intrusive floating toasts (`app-toast`) with auto-dismiss (3.5s) and manual dismiss across all CRUD actions.
  - **Collapsible Sidebar**: Desktop sidebar toggle between 260px expanded mode and 74px icon mode with tooltip cues and mobile drawer support.
  - **Clean Modal Forms**: Streamlined modal dialogs with inline validation error alerts and automatic empty-string sanitization.
  - **Global Top-Bar Loading Progress**: Route transitions tracked seamlessly via `LoadingContext` and `RouteLoadingWatcher`.

---

## 🛠️ How to Run

1. **Ensure Backend is running**:
   - Backend should be running on `http://localhost:8080`.

2. **Start the Frontend**:
   ```bash
   cd school-management-frontend
   npm install
   npm run dev
   ```

3. **Open Browser**:
   - Navigate to `http://localhost:5173`

---

## 🔑 Demo Accounts (Pre-seeded in Backend)

| Role | Username / Email | Password | Allowed Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `admin@school.edu.kh` | `admin123` | Full access (Departments, Teachers, Students, Courses, Confirm/Cancel Enrollments) |
| **Teacher** | `teacher` / `teacher@school.edu.kh` | `teacher123` | Add/edit students, view courses, confirm enrollments |
| **Student** | `student` / `student@school.edu.kh` | `student123` | Browse courses, self-enroll in courses, view profile |

---

## 📁 Project Structure

```
school-management-frontend/
├── .env.example             # Base API URL config
├── package.json
├── vite.config.js
├── src/
│   ├── api/
│   │   ├── axiosClient.js   # JWT interceptor & error handling
│   │   ├── authApi.js       # Login, Register, Me, Change Password
│   │   ├── departmentApi.js # Departments CRUD & pagination
│   │   ├── teacherApi.js    # Teachers & Faculty management
│   │   ├── studentApi.js    # Students CRUD & Pagination
│   │   ├── courseApi.js     # Courses & Capacity filters
│   │   └── enrollmentApi.js # Enrollments, confirm & cancel
│   ├── components/
│   │   ├── ProtectedRoute.jsx      # Role & auth guard
│   │   ├── PublicRoute.jsx         # Guest-only guard
│   │   ├── SchoolLogo.jsx          # SVG branding logo
│   │   └── RouteLoadingWatcher.jsx # Route progress watcher
│   ├── context/
│   │   ├── AuthContext.jsx         # Authentication & RBAC helpers
│   │   └── LoadingContext.jsx      # Top-bar loading state
│   ├── layouts/
│   │   └── DashboardLayout.jsx     # Responsive & collapsible sidebar
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── DepartmentsPage.jsx
│   │   ├── TeachersPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── EnrollmentsPage.jsx
│   │   └── ProfilePage.jsx
│   ├── assets/
│   ├── App.jsx                     # Application routing & routes
│   ├── index.css                   # Design system, toasts & animations
│   └── main.jsx
```
