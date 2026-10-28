import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentApi } from '../api/enrollmentApi';
import { studentApi } from '../api/studentApi';
import { courseApi } from '../api/courseApi';
import {
  UserCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Clock,
  Layers,
  GraduationCap,
  RotateCw,
} from 'lucide-react';

export const EnrollmentsPage = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isStudent = hasRole('STUDENT') && !hasRole('ADMIN');
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId') || '';

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState(preselectedCourseId);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modern Toast Notification
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // All enrollments table state
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loadingAllEnrollments, setLoadingAllEnrollments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loggedInStudent = students.find((s) => {
    if (user?.email && s.email && s.email.trim().toLowerCase() === user.email.trim().toLowerCase()) return true;
    if (user?.fullName && `${s.firstName} ${s.lastName}`.trim().toLowerCase() === user.fullName.trim().toLowerCase()) return true;
    if (user?.username && (
      (s.email && s.email.toLowerCase().includes(user.username.toLowerCase())) ||
      `${s.firstName}${s.lastName}`.toLowerCase().includes(user.username.toLowerCase())
    )) return true;
    return false;
  }) || null;

  const refreshCourses = async () => {
    try {
      const coRes = await courseApi.getAllCourses({ pageNo: 0, pageSize: 50 });
      if (coRes?.data?.content) {
        setCourses(coRes.data.content);
      }
    } catch {
      // Optional
    }
  };

  const fetchAllEnrollments = async () => {
    setLoadingAllEnrollments(true);
    try {
      const res = await enrollmentApi.getAllEnrollments();
      setAllEnrollments(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch all enrollments:', err);
      setAllEnrollments([]);
    } finally {
      setLoadingAllEnrollments(false);
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        let initialStudents = [];
        if (isStudent && (user?.email || user?.username)) {
          try {
            const myRes = await studentApi.getAllStudents({ search: user.email || user.username, pageSize: 10 });
            if (myRes?.data?.content?.length > 0) {
              initialStudents = myRes.data.content;
            }
          } catch (err) {
            console.error('Failed to search current student profile:', err);
          }
        }

        const [stRes, coRes] = await Promise.allSettled([
          studentApi.getAllStudents({ pageNo: 0, pageSize: 50 }),
          courseApi.getAllCourses({ pageNo: 0, pageSize: 50 }),
        ]);

        if (stRes.status === 'fulfilled' && stRes.value.data) {
          const list = stRes.value.data.content || [];
          const combined = [...initialStudents];
          list.forEach((item) => {
            if (!combined.some((s) => s.id === item.id)) {
              combined.push(item);
            }
          });
          setStudents(combined);

          if (isStudent) {
            const found = combined.find((s) => 
              (user?.email && s.email && s.email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
              (user?.fullName && `${s.firstName} ${s.lastName}`.trim().toLowerCase() === user.fullName.trim().toLowerCase()) ||
              (user?.username && (
                (s.email && s.email.toLowerCase().includes(user.username.toLowerCase())) ||
                `${s.firstName}${s.lastName}`.toLowerCase().includes(user.username.toLowerCase())
              ))
            );
            if (found) {
              setStudentId(found.id.toString());
            }
          }
        }

        if (coRes.status === 'fulfilled' && coRes.value.data) {
          const cList = coRes.value.data.content || [];
          setCourses(cList);
          if (cList.length > 0 && !preselectedCourseId) {
            setCourseId(cList[0].id.toString());
          }
        }

        fetchAllEnrollments();
      } finally {
        setLoadingInitial(false);
      }
    };

    loadOptions();
  }, [user, isStudent, preselectedCourseId]);

  useEffect(() => {
    if (isStudent && loggedInStudent) {
      setStudentId(loggedInStudent.id.toString());
    }
  }, [isStudent, loggedInStudent]);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    if (isStudent && !loggedInStudent) {
      setToast({ type: 'error', title: 'Student profile syncing. Please try again in a moment.' });
      return;
    }

    if (!isStudent && !studentId) {
      setToast({ type: 'error', title: 'Please select a student.' });
      return;
    }

    if (!courseId) {
      setToast({ type: 'error', title: 'Please select a course.' });
      return;
    }

    setSubmitting(true);

    try {
      const effectiveStudentId = isStudent && loggedInStudent ? loggedInStudent.id : Number(studentId);
      const payload = {
        studentId: effectiveStudentId,
        courseId: Number(courseId),
        discountPercentage: isStudent ? 0 : (discountPercentage ? Number(discountPercentage) : 0),
        status: enrollmentStatus,
        notes: notes || undefined,
      };

      await enrollmentApi.enrollStudent(payload);
      setToast({
        type: 'success',
        title: 'Enrollment Created Successfully',
      });
      // Clear form inputs back to default
      if (!isStudent) {
        setStudentId('');
      }
      setCourseId('');
      setDiscountPercentage('');
      setEnrollmentStatus('CONFIRMED');
      setNotes('');

      fetchAllEnrollments();
      refreshCourses();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Enrollment Failed',
        message: err.message || 'Could not complete enrollment.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmEnrollment = async (enrollmentId) => {
    setConfirmingId(enrollmentId);
    try {
      await enrollmentApi.confirmEnrollment(enrollmentId);
      setToast({
        type: 'success',
        title: 'Enrollment Confirmed Successfully',
      });
      fetchAllEnrollments();
      refreshCourses();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Confirm Failed',
        message: err.message || 'Failed to confirm enrollment.',
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm(`Are you sure you want to cancel enrollment #${enrollmentId}?`)) {
      return;
    }
    setCancellingId(enrollmentId);
    try {
      await enrollmentApi.cancelEnrollment(enrollmentId);
      setToast({
        type: 'success',
        title: 'Enrollment Cancelled Successfully',
      });
      fetchAllEnrollments();
      refreshCourses();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Cancel Failed',
        message: err.message || 'Failed to cancel enrollment.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleResetForm = async () => {
    if (!isStudent) {
      setStudentId('');
    }
    setCourseId('');
    setDiscountPercentage('');
    setEnrollmentStatus('CONFIRMED');
    setNotes('');

    setRefreshing(true);
    try {
      await Promise.allSettled([refreshCourses(), fetchAllEnrollments()]);
      setToast({ type: 'success', title: 'Form reset and data refreshed' });
    } finally {
      setTimeout(() => setRefreshing(false), 350);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const selectedCourse = courses.find((c) => c.id.toString() === courseId);

  const originalFee = selectedCourse ? Number(selectedCourse.fee) : 0;
  const discountVal = isStudent ? 0 : (originalFee * (Number(discountPercentage) || 0)) / 100;
  const calculatedFinalFee = Math.max(0, originalFee - discountVal);

  const pendingCount = allEnrollments.filter((e) => e.status === 'PENDING').length;
  const confirmedCount = allEnrollments.filter((e) => e.status === 'CONFIRMED').length;
  const cancelledCount = allEnrollments.filter((e) => e.status === 'CANCELLED').length;

  const filteredEnrollments = allEnrollments.filter((en) => {
    const matchesStatus =
      statusFilter === 'ALL' || en.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const stName = (en.studentName || '').toLowerCase();
    const stEmail = (en.studentEmail || '').toLowerCase();
    const coCode = (en.courseCode || '').toLowerCase();
    const coTitle = (en.courseTitle || '').toLowerCase();
    return (
      stName.includes(term) ||
      stEmail.includes(term) ||
      coCode.includes(term) ||
      coTitle.includes(term)
    );
  });

  return (
    <div className="page-content">
      {/* Floating Modern Toast Notification */}
      {toast && (
        <div className="app-toast-container">
          <div className={`app-toast app-toast-${toast.type}`}>
            <div className="app-toast-icon-wrap">
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <div className="app-toast-content">
              <h4 className="app-toast-title">{toast.title}</h4>
              {toast.message && <p className="app-toast-message">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="app-toast-close"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-heading">Course Enrollment Manager</h1>
          <p className="page-subheading">
            Register students into courses, manage Pending & Confirm statuses, and track enrollments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetForm}
          disabled={refreshing}
          className="btn-refresh"
          title="Reload enrollments and courses data"
        >
          <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Unified Modern Enrollment Form Card */}
      <div className="enrollment-form-card">
        <div className="enrollment-form-header">
          <div>
            <div className="enrollment-form-title">
              <UserCheck className="text-indigo-600" size={22} />
              <h3>New Enrollment Form</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 32px' }}>
              Choose a student, select course, and configure enrollment details
            </p>
          </div>
        </div>

        <form onSubmit={handleEnrollSubmit}>
          <div className="enrollment-form-grid">
            {/* Student Field */}
            {isStudent ? (
              <div className="form-group">
                <label>Student Account</label>
                <div className="input-with-icon">
                  <UserCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    value={
                      loggedInStudent
                        ? `#${loggedInStudent.id} - ${loggedInStudent.firstName} ${loggedInStudent.lastName} (${loggedInStudent.email})`
                        : user?.fullName || user?.username || 'Current Student'
                    }
                    disabled
                    className="select-input font-bold"
                    style={{ background: '#f8fafc', color: '#1e293b', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Select Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="select-input"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      #{st.id} - {st.firstName} {st.lastName} ({st.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Course Field */}
            <div className="form-group">
              <label>Select Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="select-input"
                required
              >
                <option value="">Select Course</option>
                {courses.map((co) => (
                  <option key={co.id} value={co.id}>
                    {co.code} - {co.title} (${co.fee} | {co.availableSeats} seats left)
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div className="form-group">
              <label>Enrollment Status</label>
              <select
                value={enrollmentStatus}
                onChange={(e) => setEnrollmentStatus(e.target.value)}
                className="select-input"
              >
                <option value="CONFIRMED">Confirmed (Immediate Activation)</option>
                <option value="PENDING">Pending (Requires Approval)</option>
              </select>
            </div>

            {/* Discount Field - Only for Admin / Staff (Hidden for Students) */}
            {!isStudent && (
              <div className="form-group">
                <label>Discount Percentage (%)</label>
                <div className="input-with-icon">
                  <Percent size={18} className="input-icon" />
                  <input
                    type="number"
                    placeholder="0 (e.g. 10)"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div className={`form-group ${isStudent ? '' : 'col-span-2'}`}>
              <label>Note</label>
              <input
                type="text"
                placeholder="Optional note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Checkout Bar: Breakdown + Action Button */}
          <div className="enrollment-checkout-bar">
            <div className="enrollment-price-breakdown">
              <div className="price-item">
                <span className="price-item-label">Original Fee</span>
                <span className="price-item-value">${originalFee.toFixed(2)}</span>
              </div>
              {!isStudent && (
                <div className="price-item">
                  <span className="price-item-label">Discount Applied</span>
                  <span className="price-item-value discount">
                    -${discountVal.toFixed(2)} ({discountPercentage || 0}%)
                  </span>
                </div>
              )}
              <div className="price-item price-item-total">
                <span className="price-item-label">Final Payable Fee</span>
                <span className="price-final-bold">${calculatedFinalFee.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingInitial}
              className="btn btn-primary enrollment-submit-btn"
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Processing...</span>
                </>
              ) : enrollmentStatus === 'PENDING' ? (
                <>
                  <Clock size={16} />
                  <span>Submit Pending Enrollment</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm Enrollment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom: All Enrolled Students Table */}
      <div className="card-box">
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
                background: '#e0e7ff',
                color: '#4f46e5',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
                All Enrolled Students
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Manage student registrations, review pending requests, and confirm enrollments
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Filter Tabs / Pills */}
            <div className="filter-tabs-container">
              <button
                type="button"
                className={`filter-tab-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({allEnrollments.length})
              </button>
              <button
                type="button"
                className={`filter-tab-pill pill-pending ${statusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                <Clock size={13} />
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`filter-tab-pill pill-confirmed ${statusFilter === 'CONFIRMED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                <CheckCircle2 size={13} />
                Confirmed ({confirmedCount})
              </button>
              <button
                type="button"
                className={`filter-tab-pill pill-cancelled ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CANCELLED')}
              >
                <X size={13} />
                Cancelled ({cancelledCount})
              </button>
            </div>

            {/* Clean Search Box with internal icon */}
            <div className="input-with-icon" style={{ minWidth: '220px', maxWidth: '280px' }}>
              <Search size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Search student or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '36px', fontSize: '0.84rem' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loadingAllEnrollments ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <span className="btn-spinner btn-spinner-primary" style={{ width: 24, height: 24, marginRight: 10 }}></span>
            <span style={{ fontSize: '0.9rem' }}>Loading enrollments data...</span>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <Layers size={42} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', margin: 0 }}>No Enrollments Found</h4>
            <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter.'
                : 'No students have enrolled in any courses yet.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#ID</th>
                  <th>Student</th>
                  <th>Course Code & Title</th>
                  <th>Enrollment Date</th>
                  <th>Original Fee</th>
                  <th>Discount</th>
                  <th>Final Fee</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'center', width: '160px' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((en) => (
                  <tr key={en.id}>
                    <td className="font-mono text-gray-500 font-semibold">#{en.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="student-avatar-badge">
                          {getInitials(en.studentName)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {en.studentName || `Student #${en.studentId}`}
                          </span>
                          {en.studentEmail && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {en.studentEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#4f46e5', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {en.courseCode}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                          {en.courseTitle}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {en.enrollmentDate ? new Date(en.enrollmentDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      ${Number(en.originalFee || 0).toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: Number(en.discountAmount) > 0 ? '#16a34a' : '#64748b', fontWeight: Number(en.discountAmount) > 0 ? 600 : 400 }}>
                      {Number(en.discountAmount) > 0
                        ? `-$${Number(en.discountAmount).toFixed(2)}`
                        : '$0.00'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        ${Number(en.finalFee || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${en.status ? en.status.toLowerCase() : 'confirmed'}`}>
                        {en.status === 'PENDING' && <Clock size={12} />}
                        {en.status === 'CONFIRMED' && <CheckCircle2 size={12} />}
                        {en.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {en.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleConfirmEnrollment(en.id)}
                                disabled={confirmingId === en.id || cancellingId === en.id}
                                className="btn btn-sm btn-success flex items-center gap-1"
                                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                title="Confirm this enrollment"
                              >
                                {confirmingId === en.id ? (
                                  <>
                                    <span className="btn-spinner" style={{ width: 12, height: 12 }}></span>
                                    <span>Confirming...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={13} />
                                    <span>Confirm</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelEnrollment(en.id)}
                                disabled={confirmingId === en.id || cancellingId === en.id}
                                className="btn btn-sm btn-outline-danger flex items-center gap-1"
                                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                title="Cancel this pending enrollment"
                              >
                                {cancellingId === en.id ? (
                                  <>
                                    <span className="btn-spinner" style={{ width: 12, height: 12 }}></span>
                                    <span>Cancelling...</span>
                                  </>
                                ) : (
                                  <>
                                    <X size={13} />
                                    <span>Cancel</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          {en.status === 'CONFIRMED' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                              <CheckCircle2 size={14} /> Confirmed
                            </span>
                          )}

                          {en.status === 'CANCELLED' && (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>—</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
