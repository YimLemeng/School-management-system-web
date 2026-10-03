import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading, ROUTE_LOADING_CONFIG } from '../context/LoadingContext';
import { studentApi } from '../api/studentApi';
import { courseApi } from '../api/courseApi';
import { teacherApi } from '../api/teacherApi';
import { departmentApi } from '../api/departmentApi';
import {
  Users,
  Briefcase,
  BookOpen,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const { triggerLoading } = useLoading();
  const navigate = useNavigate();
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

  const handleNavigate = (path) => {
    const config = ROUTE_LOADING_CONFIG[path];
    if (config) {
      triggerLoading(config.title, config.subtitle, 450);
    }
    navigate(path);
  };

  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'USER';

  return (
    <div className="page-content">
      {/* Welcome Banner */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>School Management Workspace</span>
          </div>
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
          <div
            className="stat-card stat-card-students clickable"
            onClick={() => handleNavigate('/students')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper stat-icon-students">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Students</p>
              <h3 className="stat-value">
                {stats.loading ? '...' : stats.studentsCount}
              </h3>
            </div>
            <div className="stat-trend-icon">
              <TrendingUp size={16} />
            </div>
          </div>
        )}

        {isAdmin && (
          <div
            className="stat-card stat-card-teachers clickable"
            onClick={() => handleNavigate('/teachers')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper stat-icon-teachers">
              <Briefcase size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Teachers</p>
              <h3 className="stat-value">
                {stats.loading ? '...' : stats.teachersCount}
              </h3>
            </div>
            <div className="stat-trend-icon">
              <TrendingUp size={16} />
            </div>
          </div>
        )}

        <div
          className="stat-card stat-card-courses clickable"
          onClick={() => handleNavigate('/courses')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon-wrapper stat-icon-courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Courses</p>
            <h3 className="stat-value">
              {stats.loading ? '...' : stats.coursesCount}
            </h3>
          </div>
          <div className="stat-trend-icon">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="stat-card stat-card-security">
          <div className="stat-icon-wrapper stat-icon-security">
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Security Role</p>
            <h3 className="stat-value stat-role-highlight">{primaryRole}</h3>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="actions-grid">
        {(isAdmin || isTeacher) && (
          <Link
            to="/students"
            className="action-card action-card-students"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('/students');
            }}
          >
            <div className="action-header">
              <div className="action-icon action-icon-students">
                <Users size={22} />
              </div>
              <div className="action-arrow-box">
                <ArrowRight size={18} className="arrow-icon" />
              </div>
            </div>
            <h4>Manage Students</h4>
            <p>Search, filter, paginate, register new students, and edit profiles.</p>
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/teachers"
            className="action-card action-card-teachers"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('/teachers');
            }}
          >
            <div className="action-header">
              <div className="action-icon action-icon-teachers">
                <Briefcase size={22} />
              </div>
              <div className="action-arrow-box">
                <ArrowRight size={18} className="arrow-icon" />
              </div>
            </div>
            <h4>Manage Teachers</h4>
            <p>Faculty instructors directory, departments, and qualification profiles.</p>
          </Link>
        )}

        <Link
          to="/courses"
          className="action-card action-card-courses"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/courses');
          }}
        >
          <div className="action-header">
            <div className="action-icon action-icon-courses">
              <BookOpen size={22} />
            </div>
            <div className="action-arrow-box">
              <ArrowRight size={18} className="arrow-icon" />
            </div>
          </div>
          <h4>Browse Courses</h4>
          <p>Explore courses, track remaining seat capacities, and check fees.</p>
        </Link>

        <Link
          to="/enrollments"
          className="action-card action-card-enrollments"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/enrollments');
          }}
        >
          <div className="action-header">
            <div className="action-icon action-icon-enrollments">
              <UserCheck size={22} />
            </div>
            <div className="action-arrow-box">
              <ArrowRight size={18} className="arrow-icon" />
            </div>
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
