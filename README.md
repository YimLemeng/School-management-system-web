# School Management System - Frontend (React + Vite)

A modern, responsive, and secure frontend application built with **React (Vite)**, **React Router**, and **Axios**, designed to connect directly with the **Spring Boot 3 School Management System REST API**.

---

## 🚀 Features

- **JWT Authentication & RBAC**:
  - Stateless Bearer Token stored in `localStorage`
  - Automatic `Authorization: Bearer <token>` attachment via Axios request interceptor
  - Auto-logout on token expiration (401 response handling)
  - Role-based route & action guards (`ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STUDENT`)
- **Pages & Modules**:
  - **Login**: Pre-seeded quick login shortcuts (`admin`, `teacher`, `student`).
  - **Register**: Registration with instant password confirmation check and role selection.
  - **Dashboard**: Live counter stats (Students, Courses, Backend Server Status).
  - **Students Management**: Search with debounce, gender filter, pagination, Add Student modal, and delete action.
  - **Courses & Curriculum**: Live available seats capacity progress bars, Max fee filtering, and instant enrollment links.
  - **Course Enrollment**: Interactive early-bird discount preview, seat deduction, and enrollment cancellation (restocking seats).
  - **Profile & Security**: Inspect profile attributes and Change Password with `confirmNewPassword` validation.

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
| **Admin** | `admin` / `admin@school.edu.kh` | `admin123` | Full access (Add, Delete Students/Courses) |
| **Teacher** | `teacher` / `teacher@school.edu.kh` | `teacher123` | Add students, view courses |
| **Student** | `student` / `student@school.edu.kh` | `student123` | Browse courses, self enroll, profile |

---

## 📁 Project Structure

```
school-management-frontend/
├── .env                     # API URL config (http://localhost:8080/api/v1)
├── package.json
├── src/
│   ├── api/
│   │   ├── axiosClient.js   # JWT Interceptor & error handling
│   │   ├── authApi.js       # Login, Register, Me, Change Password
│   │   ├── studentApi.js    # Students CRUD & Pagination
│   │   ├── courseApi.js     # Courses & Capacity filters
│   │   └── enrollmentApi.js # Enrollments & Seat cancellation
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state & RBAC helpers
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── layouts/
│   │   └── DashboardLayout.jsx # Responsive sidebar & navigation
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── EnrollmentsPage.jsx
│   │   └── ProfilePage.jsx
│   ├── App.jsx              # Application router
│   ├── index.css            # Modern UI design system
│   └── main.jsx
```
