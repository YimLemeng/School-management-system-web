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
  RotateCcw,
  BookOpen,
  X,
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

  // Form State
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState(preselectedCourseId);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Results State
  const [successResult, setSuccessResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Selected Student Enrollments State (Auto-synced)
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Find the student profile matching the currently logged-in user
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

  const fetchStudentEnrollments = async (stId) => {
    if (!stId) return;
    setLoadingEnrollments(true);
    try {
      const res = await enrollmentApi.getEnrollmentsByStudent(stId);
      setStudentEnrollments(res.data || []);
    } catch {
      setStudentEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
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
          } else if (combined.length > 0 && !studentId) {
            setStudentId(combined[0].id.toString());
          }
        }

        if (coRes.status === 'fulfilled' && coRes.value.data) {
          const cList = coRes.value.data.content || [];
          setCourses(cList);
          if (cList.length > 0 && !preselectedCourseId) {
            setCourseId(cList[0].id.toString());
          }
        }
      } finally {
        setLoadingInitial(false);
      }
    };

    loadOptions();
  }, [user, isStudent]);

  // For students, lock studentId to their loggedInStudent profile
  useEffect(() => {
    if (isStudent && loggedInStudent) {
      setStudentId(loggedInStudent.id.toString());
    }
  }, [isStudent, loggedInStudent]);

  // Automatically fetch enrolled courses whenever the selected student changes
  useEffect(() => {
    if (studentId) {
      fetchStudentEnrollments(studentId);
    }
  }, [studentId]);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSuccessResult(null);

    if (isStudent && !loggedInStudent) {
      setError('Student profile is still synchronizing. Please refresh or try again in a moment.');
      return;
    }

    setSubmitting(true);

    try {
      const effectiveStudentId = isStudent && loggedInStudent ? loggedInStudent.id : Number(studentId);
      const payload = {
        studentId: effectiveStudentId,
        courseId: Number(courseId),
        discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        notes: notes || undefined,
      };

      const [res] = await Promise.all([
        enrollmentApi.enrollStudent(payload),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      setSuccessResult(res.data);
      setDiscountPercentage('');
      setNotes('');
      // Live refresh enrolled courses and available seats
      fetchStudentEnrollments(effectiveStudentId);
      refreshCourses();
    } catch (err) {
      setError(err.message || 'Enrollment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm(`Are you sure you want to drop this course enrollment? This will restock 1 seat back to available capacity.`)) {
      return;
    }

    setCancellingId(enrollmentId);
    setError('');
    setSuccessMsg('');
    try {
      await Promise.all([
        enrollmentApi.cancelEnrollment(enrollmentId),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      setSuccessMsg('Course dropped successfully! 1 seat has been returned to available capacity.');
      fetchStudentEnrollments(studentId);
      refreshCourses();
    } catch (err) {
      setError(err.message || 'Failed to cancel enrollment.');
    } finally {
      setCancellingId(null);
    }
  };

  const selectedCourse = courses.find((c) => c.id.toString() === courseId);
  const selectedStudent = isStudent
    ? loggedInStudent
    : students.find((s) => s.id.toString() === studentId);

  const originalFee = selectedCourse ? Number(selectedCourse.fee) : 0;
  const discountVal = (originalFee * (Number(discountPercentage) || 0)) / 100;
  const calculatedFinalFee = Math.max(0, originalFee - discountVal);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Course Enrollment & Stock Manager</h1>
          <p className="page-subheading">
            Handles seat capacity deduction, discount calculations, and enrollment transactions.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="enrollment-grid">
        {/* Left: Enrollment Form */}
        <div className="card-box">
          <div className="card-box-header">
            <UserCheck className="text-indigo-600" size={22} />
            <h3>New Enrollment Form</h3>
          </div>

          <form onSubmit={handleEnrollSubmit} className="modal-form">
            {isStudent ? (
              <div className="form-group">
                <label>Enrolling Student (Self-Enrollment Only)</label>
                <div className="input-with-icon">
                  <UserCheck size={18} className="input-icon text-indigo-600" />
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
                <p className="text-xs text-gray-500 mt-1">
                  Logged in as Student: You can only enroll courses for your own account.
                </p>
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
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      #{st.id} - {st.firstName} {st.lastName} ({st.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Select Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="select-input"
                required
              >
                {courses.map((co) => (
                  <option key={co.id} value={co.id}>
                    {co.code} - {co.title} (${co.fee} | {co.availableSeats} seats left)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Discount Percentage (%)</label>
              <div className="input-with-icon">
                <Percent size={18} className="input-icon" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0 (e.g. 10)"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Administrative Notes</label>
              <input
                type="text"
                placeholder="Optional enrollment notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Live Fee Calculation Preview */}
            <div className="calc-preview-card">
              <div className="calc-row">
                <span>Original Course Fee:</span>
                <b>${originalFee.toFixed(2)}</b>
              </div>
              <div className="calc-row text-emerald-600">
                <span>Discount Applied ({discountPercentage || 0}%):</span>
                <b>-${discountVal.toFixed(2)}</b>
              </div>
              <div className="calc-divider"></div>
              <div className="calc-row text-lg">
                <span className="font-bold">Final Payable Fee:</span>
                <span className="font-extrabold text-indigo-600">
                  ${calculatedFinalFee.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block flex items-center justify-center gap-2"
              disabled={submitting || !courseId || (isStudent ? !loggedInStudent : !studentId)}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Processing Transaction...</span>
                </>
              ) : (
                'Confirm Enrollment'
              )}
            </button>
          </form>
        </div>

        {/* Right: Modern Receipt & Enrolled Courses */}
        <div className="flex flex-col gap-6">
          {/* Digital Receipt Card (when enrollment succeeds) */}
          {successResult && (
            <div className="receipt-card">
              <div className="receipt-header">
                <div className="receipt-title">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span>Enrollment Confirmed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessResult(null)}
                  className="btn-dismiss"
                  title="Close receipt"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="receipt-grid">
                <div className="receipt-row">
                  <span>Transaction ID:</span>
                  <span className="font-mono font-bold text-gray-800">
                    #{successResult.id}
                  </span>
                </div>
                <div className="receipt-row">
                  <span>Student:</span>
                  <b>{successResult.studentName}</b>
                </div>
                <div className="receipt-row">
                  <span>Course:</span>
                  <span>
                    <b className="text-indigo-600">{successResult.courseCode}</b> - {successResult.courseTitle}
                  </span>
                </div>
                <div className="receipt-row">
                  <span>Status:</span>
                  <span className="badge-status confirmed">{successResult.status}</span>
                </div>
                <div className="receipt-row text-xs text-gray-500">
                  <span>Course Fee / Discount:</span>
                  <span>
                    ${Number(successResult.originalFee).toFixed(2)} (-${Number(successResult.discountAmount).toFixed(2)})
                  </span>
                </div>

                <div className="receipt-total-bar">
                  <span className="font-bold text-gray-700">Total Payable:</span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    ${Number(successResult.finalFee).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Student's Active Enrolled Courses */}
          <div className="card-box">
            <div className="card-box-header">
              <div className="card-box-title">
                <BookOpen className="text-indigo-600" size={20} />
                <div>
                  <h3 className="text-base font-bold text-gray-800">Enrolled Courses</h3>
                  {selectedStudent && (
                    <p className="text-xs text-gray-500 font-normal">
                      Courses for {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {loadingEnrollments ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                <span className="btn-spinner btn-spinner-primary mr-2"></span>
                <span>Loading courses...</span>
              </div>
            ) : studentEnrollments.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm italic">
                {selectedStudent
                  ? `${selectedStudent.firstName} has not enrolled in any courses yet.`
                  : 'Select a student to view their enrolled courses.'}
              </div>
            ) : (
              <div className="enrolled-list">
                {studentEnrollments.map((en) => (
                  <div key={en.id} className="enrolled-item">
                    <div className="enrolled-info">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {en.courseCode}
                        </span>
                        <span
                          className={`badge-status ${
                            en.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'
                          }`}
                        >
                          {en.status}
                        </span>
                      </div>
                      <p className="enrolled-title">{en.courseTitle}</p>
                      <p className="enrolled-meta">
                        Fee: <b>${Number(en.finalFee).toFixed(2)}</b>
                      </p>
                    </div>

                    {isAdmin && en.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelEnrollment(en.id)}
                        disabled={cancellingId === en.id}
                        className="btn btn-sm btn-danger flex items-center gap-1"
                        title="Drop this course and return 1 seat back to available capacity"
                      >
                        {cancellingId === en.id ? (
                          <>
                            <span className="btn-spinner"></span>
                            <span>Dropping...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={13} />
                            <span>Drop Course</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
