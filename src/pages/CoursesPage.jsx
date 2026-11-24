import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api/courseApi';
import { teacherApi } from '../api/teacherApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ModalPortal } from '../components/ModalPortal';
import {
  BookOpen,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  X,
  ArrowRight,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const CoursesPage = () => {
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const isAdmin = hasRole('ADMIN');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Pagination states
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const [teachers, setTeachers] = useState([]);

  // Fetch teachers for instructor selection
  useEffect(() => {
    const fetchTeachersList = async () => {
      try {
        const res = await teacherApi.getAllTeachers({ pageNo: 0, pageSize: 100 });
        if (res.data) {
          setTeachers(res.data.content || []);
        }
      } catch (err) {
        console.error('Failed to load teachers for course creation', err);
      }
    };
    fetchTeachersList();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const initialCourseForm = {
    title: '',
    code: '',
    description: '',
    credit: '',
    fee: '',
    capacity: '',
    teacherId: '',
  };
  const [courseFormData, setCourseFormData] = useState(initialCourseForm);

  const fetchCourses = async (overridePage) => {
    setLoading(true);
    try {
      const currentPage = typeof overridePage === 'number' ? overridePage : pageNo;
      const params = {
        pageNo: currentPage,
        pageSize: 12,
        PageSize: 12, // Support both casing for backend compatibility
        sortBy: 'id',
        sortDir: 'desc', // Newest courses appear first
      };
      if (search.trim()) params.search = search.trim();
      if (maxFee) params.maxFee = maxFee;
      if (availableOnly) params.availableOnly = true;

      const res = await courseApi.getAllCourses(params);
      if (res.data) {
        setCourses(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Failed to load courses',
        message: err.message || 'Could not fetch courses list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [pageNo, availableOnly]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchCourses(0);
  };

  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}" (ID: #${id})?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await courseApi.deleteCourse(id);
      setToast({
        type: 'success',
        title: 'Course Deleted Successfully',
        message: `Course "${title}" has been removed.`,
      });
      fetchCourses();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete course.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmittingCourse(true);
    setModalError('');

    try {
      const payload = {
        title: courseFormData.title.trim(),
        code: courseFormData.code.trim().toUpperCase(),
        description: courseFormData.description?.trim() || undefined,
        credit: Number(courseFormData.credit),
        fee: Number(courseFormData.fee),
        capacity: Number(courseFormData.capacity),
        teacherId: courseFormData.teacherId ? Number(courseFormData.teacherId) : undefined,
      };

      await courseApi.createCourse(payload);
      setToast({
        type: 'success',
        title: 'Course Created Successfully',
        message: `Course "${payload.code} - ${payload.title}" has been registered.`,
      });
      setShowAddModal(false);
      setCourseFormData(initialCourseForm);
      setPageNo(0);
      fetchCourses(0);
    } catch (err) {
      setModalError(err.message || 'Failed to create course.');
    } finally {
      setSubmittingCourse(false);
    }
  };

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
          <h1 className="page-heading">{t('courses.title')}</h1>
          <p className="page-subheading">{t('courses.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchCourses()}
            className="btn-refresh"
            title="Refresh courses list"
          >
            <RotateCw size={17} />
            <span>{t('common.refresh')}</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setModalError('');
                setCourseFormData(initialCourseForm);
                setShowAddModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>{t('courses.addCourse')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-card">
        <form onSubmit={handleFilterSubmit} className="search-form">
          <div className="input-with-icon flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder={t('courses.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="input-with-icon w-48">
            <DollarSign size={18} className="input-icon" />
            <input
              type="number"
              placeholder={`${t('courses.fee')} Max`}
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <span>{t('courses.filterAvailableOnly')}</span>
          </label>

          <button
            type="submit"
            className="btn btn-secondary flex items-center gap-1.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner btn-spinner-primary"></span>
                <span>{t('common.loading')}</span>
              </>
            ) : (
              t('common.filter')
            )}
          </button>
        </form>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>{t('common.noData')}</h3>
          <p>{t('courses.subtitle')}</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((c) => {
            const seatsPercent =
              c.capacity > 0
                ? Math.round(((c.capacity - c.availableSeats) / c.capacity) * 100)
                : 0;
            const isFull = c.availableSeats <= 0;

            return (
              <div key={c.id} className="course-card">
                <div className="course-card-top">
                  <div className="course-badges-group">
                    <span className="course-code-badge">{c.code}</span>
                    <span
                      className={`seat-status-badge ${
                        isFull ? 'status-full' : 'status-open'
                      }`}
                    >
                      {isFull ? t('status.full') : `${c.availableSeats} ${t('dashboard.coursesOverview.seatsLeft')}`}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      disabled={deletingId === c.id}
                      className="btn-course-delete-pro"
                      title={t('common.delete')}
                      aria-label="Delete Course"
                    >
                      {deletingId === c.id ? (
                        <span className="btn-spinner-sm-danger"></span>
                      ) : (
                        <Trash2 size={12} />
                      )}
                      <span>{deletingId === c.id ? t('common.loading') : t('common.delete')}</span>
                    </button>
                  )}
                </div>

                <h3 className="course-title">{c.title}</h3>
                <p className="course-dept">
                  {t('teachers.department')}: <b>{c.departmentName || 'General'}</b>
                </p>
                <p className="course-instructor">
                  {t('teachers.teacherName')}: <b>{c.teacherName || 'Not Assigned'}</b>
                </p>

                {/* Capacity Progress Bar */}
                <div className="capacity-box">
                  <div className="capacity-label">
                    <span>{t('courses.capacity')}: {c.capacity - c.availableSeats}/{c.capacity}</span>
                    <span>{seatsPercent}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        isFull ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${seatsPercent}%` }}
                    />
                  </div>
                </div>

                <div className="course-card-footer">
                  <div>
                    <span className="fee-label">{t('courses.fee')}</span>
                    <p className="fee-amount">${Number(c.fee).toFixed(2)}</p>
                  </div>
                  <Link
                    to={`/enrollments?courseId=${c.id}`}
                    className={`btn btn-sm ${
                      isFull ? 'btn-disabled' : 'btn-primary'
                    }`}
                    onClick={(e) => {
                      if (isFull) e.preventDefault();
                    }}
                  >
                    <span>{isFull ? t('status.full') : t('dashboard.quickActions.enrollCourse')}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {courses.length > 0 && (
        <div className="pagination-bar" style={{ marginTop: '20px' }}>
          <p className="pagination-info">
            {t('common.showing')} {t('common.page')} <b>{pageNo + 1}</b> {t('common.of')} <b>{totalPages || 1}</b> ({t('common.total')}{' '}
            {totalElements} {t('common.entries')})
          </p>
          <div className="pagination-controls">
            <button
              onClick={() => setPageNo((p) => Math.max(0, p - 1))}
              disabled={pageNo === 0}
              className="btn-page"
            >
              <ChevronLeft size={16} />
              <span>{t('common.previous')}</span>
            </button>
            <button
              onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
              disabled={pageNo >= totalPages - 1}
              className="btn-page"
            >
              <span>{t('common.next')}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <ModalPortal>
          <div className="modal-backdrop">
            <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <BookOpen className="text-indigo-600" size={22} />
                <h3>{t('courses.addCourse')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="modal-form">
              {modalError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={18} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('courses.courseCode')}</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="e.g. CS101, WEB202"
                    value={courseFormData.code}
                    onChange={handleCourseInputChange}
                    required
                    maxLength={20}
                    className="font-mono uppercase"
                  />
                </div>
                <div className="form-group">
                  <label>{t('courses.courseTitle')}</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Introduction to Programming"
                    value={courseFormData.title}
                    onChange={handleCourseInputChange}
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>{t('courses.credits')}</label>
                  <input
                    type="number"
                    name="credit"
                    min={1}
                    max={10}
                    placeholder="e.g. 3"
                    value={courseFormData.credit}
                    onChange={handleCourseInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('courses.capacity')}</label>
                  <input
                    type="number"
                    name="capacity"
                    min={1}
                    placeholder="e.g. 30"
                    value={courseFormData.capacity}
                    onChange={handleCourseInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('courses.fee')}</label>
                  <input
                    type="number"
                    step="0.01"
                    name="fee"
                    placeholder="e.g. 150.00"
                    value={courseFormData.fee}
                    onChange={handleCourseInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('teachers.teacherName')}</label>
                <select
                  name="teacherId"
                  value={courseFormData.teacherId}
                  onChange={handleCourseInputChange}
                  className="select-input"
                >
                  <option value="">-- {t('courses.selectTeacher') || 'Select Instructor (Optional)'} --</option>
                  {teachers.map((teach) => (
                    <option key={teach.id} value={teach.id}>
                      {teach.firstName} {teach.lastName} {teach.departmentName ? `(${teach.departmentName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('departments.description')}</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Course syllabus, requirements, overview..."
                  value={courseFormData.description}
                  onChange={handleCourseInputChange}
                  className="modal-textarea"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={submittingCourse}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingCourse}
                >
                  {submittingCourse ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>{t('common.saving')}</span>
                    </>
                  ) : (
                    t('courses.addCourse')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};
