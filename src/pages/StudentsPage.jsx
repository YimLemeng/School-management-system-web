import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/studentApi';
import { enrollmentApi } from '../api/enrollmentApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Eye,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  RotateCw,
} from 'lucide-react';

export const StudentsPage = () => {
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const isAdmin = hasRole('ADMIN');
  const isTeacher = hasRole('TEACHER');
  const canManage = isAdmin || isTeacher;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Pagination & Filter state
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Add / Edit Student Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState('');

  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // View Student Modal State
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [viewEnrollments, setViewEnrollments] = useState([]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        pageNo,
        pageSize,
        sortBy: 'id',
        sortDir: 'desc',
      };
      if (search.trim()) params.search = search.trim();
      if (gender) params.gender = gender;

      const res = await studentApi.getAllStudents(params);
      if (res.data) {
        setStudents(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Failed to load students',
        message: err.message || 'Could not fetch students list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pageNo, gender]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNo(0);
    fetchStudents();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setModalError('');
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setIsEditing(true);
    setEditingId(st.id);
    setModalError('');
    setFormData({
      firstName: st.firstName || '',
      lastName: st.lastName || '',
      email: st.email || '',
      phoneNumber: st.phoneNumber || '',
      dateOfBirth: st.dateOfBirth || '',
      gender: st.gender || 'MALE',
    });
    setShowModal(true);
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber && formData.phoneNumber.trim() !== '' ? formData.phoneNumber.trim() : null,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
        gender: formData.gender,
      };

      if (isEditing) {
        await studentApi.updateStudent(editingId, payload);
        setToast({
          type: 'success',
          title: 'Student Updated Successfully',
          message: `${payload.firstName} ${payload.lastName}'s information has been updated.`,
        });
      } else {
        await studentApi.createStudent(payload);
        setToast({
          type: 'success',
          title: 'Student Created Successfully',
          message: `${payload.firstName} ${payload.lastName} has been registered.`,
        });
      }
      setShowModal(false);
      setFormData(initialForm);
      fetchStudents();
    } catch (err) {
      setModalError(err.message || `Failed to ${isEditing ? 'update' : 'create'} student.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}" (ID: #${id})?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await studentApi.deleteStudent(id);
      setToast({
        type: 'success',
        title: 'Student Deleted Successfully',
        message: `Student "${name}" has been removed.`,
      });
      fetchStudents();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete student (Requires ROLE_ADMIN).',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenView = async (st) => {
    setViewingId(st.id);
    setViewingStudent(st);
    setViewLoading(true);
    setViewEnrollments([]);
    try {
      const res = await enrollmentApi.getEnrollmentsByStudent(st.id);
      setViewEnrollments(res.data || []);
    } catch {
      setViewEnrollments([]);
    } finally {
      setViewLoading(false);
      setViewingId(null);
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
          <h1 className="page-heading">{t('students.title')}</h1>
          <p className="page-subheading">
            {t('common.total')} {totalElements} {t('common.entries')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchStudents()}
            className="btn-refresh"
            title="Refresh students list"
          >
            <RotateCw size={17} />
            <span>{t('common.refresh')}</span>
          </button>
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>{t('students.addStudent')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="input-with-icon flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder={t('students.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group select-wrapper-with-icon">
            <Filter size={16} className="select-lead-icon" />
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setPageNo(0);
              }}
              className="select-input select-with-lead-icon"
            >
              <option value="">{t('students.allGenders')}</option>
              <option value="MALE">{t('students.male')}</option>
              <option value="FEMALE">{t('students.female')}</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-secondary flex items-center gap-1.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner btn-spinner-primary"></span>
                <span>{t('common.searching')}</span>
              </>
            ) : (
              t('common.search')
            )}
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <UserPlus size={48} className="empty-icon" />
            <h3>{t('common.noData')}</h3>
            <p>{t('students.subtitle')}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>{t('students.fullName')}</th>
                  <th>{t('students.email')}</th>
                  <th>{t('students.phoneNumber')}</th>
                  <th>{t('students.gender')}</th>
                  <th>{t('students.dateOfBirth')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td className="font-mono text-gray-500">#{st.id}</td>
                    <td className="font-semibold text-gray-900">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="text-gray-600">{st.email}</td>
                    <td className="text-gray-600 font-mono text-sm">
                      {st.phoneNumber || 'N/A'}
                    </td>
                    <td>
                      <span className={`badge-gender ${st.gender?.toLowerCase()}`}>
                        {st.gender === 'MALE' ? t('students.male') : st.gender === 'FEMALE' ? t('students.female') : st.gender}
                      </span>
                    </td>
                    <td className="text-gray-600 text-sm">{st.dateOfBirth}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleOpenView(st)}
                        className="btn-action-view"
                        disabled={viewingId === st.id}
                        title={t('students.viewDetails')}
                      >
                        {viewingId === st.id ? (
                          <>
                            <span
                              className="btn-spinner btn-spinner-primary"
                              style={{ width: 13, height: 13 }}
                            ></span>
                            <span>{t('common.loading')}</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            <span>{t('common.view')}</span>
                          </>
                        )}
                      </button>

                      {canManage && (
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="btn-action-edit"
                          title={t('students.editStudent')}
                        >
                          <Pencil size={15} />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() =>
                            handleDelete(st.id, `${st.firstName} ${st.lastName}`)
                          }
                          className="btn-action-delete"
                          disabled={deletingId === st.id}
                          title={t('common.delete')}
                        >
                          {deletingId === st.id ? (
                            <span
                              className="btn-spinner btn-spinner-primary"
                              style={{ width: 14, height: 14 }}
                            ></span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="pagination-bar">
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
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? t('students.editStudent') : t('students.addStudent')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="modal-form">
              {modalError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={18} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('students.firstName')}</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="e.g. Sokha"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('students.lastName')}</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="e.g. Chan"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('students.email')}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. sokha.chan@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('students.phoneNumber')}</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="+85512345678"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>{t('students.gender')}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="select-input"
                  >
                    <option value="MALE">{t('students.male')}</option>
                    <option value="FEMALE">{t('students.female')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('students.dateOfBirth')}</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>{t('common.saving')}</span>
                    </>
                  ) : isEditing ? (
                    t('common.save')
                  ) : (
                    t('students.addStudent')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Details Modal */}
      {viewingStudent && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-indigo-600" size={22} />
                <h3 className="text-lg font-bold">{t('students.viewDetails')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-modal-body">
              {/* Avatar & Name Header */}
              <div className="profile-modal-header-row">
                <div className="profile-modal-avatar">
                  {viewingStudent.firstName?.charAt(0)}
                  {viewingStudent.lastName?.charAt(0)}
                </div>
                <div className="profile-modal-header-info">
                  <h4>
                    {viewingStudent.firstName} {viewingStudent.lastName}
                  </h4>
                  <div className="profile-modal-meta-row">
                    <span className="font-mono text-xs text-gray-500">
                      ID: #{viewingStudent.id}
                    </span>
                    <span className={`badge-gender ${viewingStudent.gender?.toLowerCase()}`}>
                      {viewingStudent.gender === 'MALE' ? t('students.male') : viewingStudent.gender === 'FEMALE' ? t('students.female') : viewingStudent.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Mail size={13} />
                    <span>{t('students.email')}</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingStudent.email || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Phone size={13} />
                    <span>{t('students.phoneNumber')}</span>
                  </div>
                  <span className="profile-info-val font-mono">
                    {viewingStudent.phoneNumber || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Calendar size={13} />
                    <span>{t('students.dateOfBirth')}</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingStudent.dateOfBirth || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <BookOpen size={13} />
                    <span>{t('students.enrolledCourses')}</span>
                  </div>
                  <span className="profile-info-val" style={{ color: 'var(--color-primary)' }}>
                    {viewEnrollments.length} {t('nav.courses')}
                  </span>
                </div>
              </div>

              {/* Enrolled Courses Section */}
              <div className="profile-modal-section">
                <div className="profile-modal-section-title">
                  <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>{t('students.enrolledCourses')}</span>
                </div>

                {viewLoading ? (
                  <div className="py-4 text-center text-gray-400 text-sm">
                    <span className="btn-spinner btn-spinner-primary mr-2"></span>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : viewEnrollments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    {t('students.noEnrollments')}
                  </p>
                ) : (
                  <div className="profile-courses-list">
                    {viewEnrollments.map((en) => (
                      <div key={en.id} className="profile-course-card">
                        <div>
                          <div className="student-course-title">
                            <span className="font-mono mr-1" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                              {en.courseCode}
                            </span>
                            <span>{en.courseTitle}</span>
                          </div>
                          <div className="student-course-meta">
                            {t('common.status')}: <b className="text-emerald-600">{en.status}</b> | {t('courses.fee')}: ${Number(en.finalFee).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="btn btn-secondary"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
