import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/studentApi';
import { courseApi } from '../api/courseApi';
import { teacherApi } from '../api/teacherApi';
import { departmentApi } from '../api/departmentApi';
import {
  Users,
  Briefcase,
  Building2,
  BookOpen,
  UserCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isTeacher = hasRole('TEACHER');

  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    coursesCount: 0,
    departmentsCount: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promises = [
          studentApi.getAllStudents({ pageNo: 0, pageSize: 1 }),
          teacherApi.getAllTeachers({ pageNo: 0, pageSize: 1 }),
          courseApi.getAllCourses({ pageNo: 0, pageSize: 1 }),
        ];
        if (isAdmin) {
          promises.push(departmentApi.getAllDepartments());
        }

        const results = await Promise.allSettled(promises);
        const [studentsRes, teachersRes, coursesRes] = results;
        const departmentsRes = isAdmin ? results[3] : null;

        const studentsCount =
          studentsRes.status === 'fulfilled' && studentsRes.value.data
            ? studentsRes.value.data.totalElements || 0
            : 0;

        const teachersCount =
          teachersRes.status === 'fulfilled' && teachersRes.value.data
            ? teachersRes.value.data.totalElements || 0
            : 0;

        const coursesCount =
          coursesRes.status === 'fulfilled' && coursesRes.value.data
            ? coursesRes.value.data.totalElements || 0
            : 0;

        const departmentsCount =
          departmentsRes &&
          departmentsRes.status === 'fulfilled' &&
          Array.isArray(departmentsRes.value.data)
            ? departmentsRes.value.data.length
            : 0;

        setStats({
          studentsCount,
          teachersCount,
          coursesCount,
          departmentsCount,
          loading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [isAdmin]);

  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'USER';

  return (
    <div className="page-content">
      {/* Welcome Banner */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>Welcome, {user?.fullName || user?.username}!</h1>
          <p>
            {isAdmin &&
              'School Administration Portal — Manage academic departments, faculty teachers, students, courses, and registrations.'}
            {isTeacher &&
              'Faculty Instructor Portal — View student rosters, explore course curriculum, and track class enrollments.'}
            {!isAdmin && !isTeacher &&
              'Student Learning Portal — Explore available courses, register for your classes, and manage your academic enrollments.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {(isAdmin || isTeacher) && (
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="stat-label">Total Students</p>
              <h3 className="stat-value">
                {stats.loading ? '...' : stats.studentsCount}
              </h3>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-amber-50 text-amber-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="stat-label">Total Teachers</p>
              <h3 className="stat-value">
                {stats.loading ? '...' : stats.teachersCount}
              </h3>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-50 text-purple-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="stat-label">Total Courses</p>
            <h3 className="stat-value">
              {stats.loading ? '...' : stats.coursesCount}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="stat-label">Security Role</p>
            <h3 className="stat-value text-emerald-600">{primaryRole}</h3>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="actions-grid">
        {(isAdmin || isTeacher) && (
          <Link to="/students" className="action-card">
            <div className="action-header">
              <div className="action-icon text-blue-600 bg-blue-50">
                <Users size={22} />
              </div>
              <ArrowRight size={18} className="arrow-icon" />
            </div>
            <h4>Manage Students</h4>
            <p>Search, filter, paginate, register new students, and edit profiles.</p>
          </Link>
        )}

        {isAdmin && (
          <Link to="/teachers" className="action-card">
            <div className="action-header">
              <div className="action-icon text-amber-600 bg-amber-50">
                <Briefcase size={22} />
              </div>
              <ArrowRight size={18} className="arrow-icon" />
            </div>
            <h4>Manage Teachers</h4>
            <p>Faculty instructors directory, departments, and qualification profiles.</p>
          </Link>
        )}

        <Link to="/courses" className="action-card">
          <div className="action-header">
            <div className="action-icon text-purple-600 bg-purple-50">
              <BookOpen size={22} />
            </div>
            <ArrowRight size={18} className="arrow-icon" />
          </div>
          <h4>Browse Courses</h4>
          <p>Explore courses, track remaining seat capacities, and check fees.</p>
        </Link>

        <Link to="/enrollments" className="action-card">
          <div className="action-header">
            <div className="action-icon text-emerald-600 bg-emerald-50">
              <UserCheck size={22} />
            </div>
            <ArrowRight size={18} className="arrow-icon" />
          </div>
          <h4>Course Enrollment</h4>
          <p>
            {!isAdmin && !isTeacher
              ? 'Enroll in available courses and manage your class registrations.'
              : 'Enroll student with early-bird discount calculation and seat deduction.'}
          </p>
        </Link>
      </div>
    </div>
  );
};
