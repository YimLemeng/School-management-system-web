import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Sparkles,
  RotateCw,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, hasRole } = useAuth();
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

  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

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

  const fetchTopCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await courseApi.getAllCourses({ pageNo: 0, pageSize: 6 });
      if (res?.data?.content) {
        setCoursesList(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load courses on dashboard', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTopCourses();
  }, [isAdmin]);

  const handleNavigate = (path) => {
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
          <div className="stat-card stat-card-students">
            <div className="stat-icon-wrapper stat-icon-students">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Students</p>
              <h3 className="stat-value">
                {stats.loading ? '...' : stats.studentsCount}
              </h3>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="stat-card stat-card-teachers">
            <div className="stat-icon-wrapper stat-icon-teachers">
              <Briefcase size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Teachers</p>
              <h3 className="stat-value">
                {stats.loading ? '...' : stats.teachersCount}
              </h3>
            </div>
          </div>
        )}

        <div className="stat-card stat-card-courses">
          <div className="stat-icon-wrapper stat-icon-courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Courses</p>
            <h3 className="stat-value">
              {stats.loading ? '...' : stats.coursesCount}
            </h3>
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

      {/* Courses Overview Section (តារាង Courses សម្រាប់មើលនៅលើ Dashboard) */}
      <div className="card-box" style={{ marginTop: '36px' }}>
        <div
          className="card-box-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: '#ede9fe',
                color: '#7c3aed',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                Courses Overview
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Current active courses, credit hours, seat capacities, and tuition fees
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                fetchStats();
                fetchTopCourses();
              }}
              className="btn-refresh"
              title="Refresh courses data"
            >
              <RotateCw size={14} className={loadingCourses ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link
              to="/courses"
              className="btn btn-sm btn-primary flex items-center gap-1"
              style={{ textDecoration: 'none', padding: '7px 16px', fontSize: '0.84rem' }}
            >
              <span>View Full Courses</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Courses Table Content */}
        {loadingCourses ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <span className="btn-spinner btn-spinner-primary" style={{ width: 22, height: 22, marginRight: 8 }}></span>
            <span>Loading courses catalog...</span>
          </div>
        ) : coursesList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <p>No courses available at this time.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#ID</th>
                  <th>Course Code & Title</th>
                  <th>Credits</th>
                  <th>Tuition Fee</th>
                  <th>Seat Availability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coursesList.map((course) => {
                  const isFull = Number(course.availableSeats) <= 0;
                  const isLimited = Number(course.availableSeats) <= 5 && !isFull;
                  return (
                    <tr key={course.id}>
                      <td className="font-mono text-gray-500 font-semibold">#{course.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            {course.code}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                            {course.title}
                          </span>
                          {course.description && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {course.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                        {course.credit || 3} Credits
                      </td>
                      <td style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                        ${Number(course.fee || 0).toFixed(2)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isFull ? '#dc2626' : '#1e293b' }}>
                            {course.availableSeats} / {course.capacity} seats left
                          </span>
                          <div style={{ width: '120px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, ((course.capacity - course.availableSeats) / (course.capacity || 1)) * 100))}%`,
                                height: '100%',
                                background: isFull ? '#ef4444' : isLimited ? '#f59e0b' : '#10b981',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge-status ${
                            isFull ? 'cancelled' : isLimited ? 'pending' : 'confirmed'
                          }`}
                        >
                          {isFull ? 'Class Full' : isLimited ? 'Few Seats' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
