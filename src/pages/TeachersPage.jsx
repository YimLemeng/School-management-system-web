import React, { useState, useEffect } from 'react';
import { teacherApi } from '../api/teacherApi';
import { departmentApi } from '../api/departmentApi';
import { courseApi } from '../api/courseApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  GraduationCap,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
  Phone,
  Mail,
  Award,
  Eye,
  BookOpen,
  Building2,
  RotateCw,
} from 'lucide-react';

export const TeachersPage = () => {
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
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

  // Course assignments state
  const [teacherCoursesMap, setTeacherCoursesMap] = useState({});
  const [viewCourses, setViewCourses] = useState([]);
  const [viewCoursesLoading, setViewCoursesLoading] = useState(false);

  // Pagination
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State (Add & Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [viewingTeacherId, setViewingTeacherId] = useState(null);

  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'MALE',
    departmentId: '',
    qualification: '',
    yearsOfExperience: 3,
    emergencyPhone: '',
    bio: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getAllTeachers({
        pageNo,
        pageSize,
        sortBy: 'id',
        sortDir: 'desc',
      });
      if (res.data) {
        setTeachers(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Failed to load teachers',
        message: err.message || 'Could not fetch faculty teachers list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [pageNo]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getAllDepartments();
        if (res.data) {
          setDepartments(res.data || []);
          if (res.data.length > 0 && !formData.departmentId) {
            setFormData((prev) => ({ ...prev, departmentId: res.data[0].id }));
          }
        }
      } catch {
        // Optional
      }
    };
    fetchDepartments();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      const res = await courseApi.getAllCourses({ pageNo: 0, pageSize: 100 });
      const list = res.data?.content || res.data || [];
      const map = {};
      list.forEach((c) => {
        if (c.teacherId) {
          if (!map[c.teacherId]) map[c.teacherId] = [];
          map[c.teacherId].push(c);
        }
      });
      setTeacherCoursesMap(map);
    } catch {
      // Optional
    }
  };

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const handleOpenViewTeacher = async (teacher) => {
    setViewingTeacherId(teacher.id);
    setViewingTeacher(teacher);
    setViewCoursesLoading(true);
    setViewCourses([]);
    try {
      const res = await courseApi.getAllCourses({ teacherId: teacher.id, pageSize: 50 });
      const list = res.data?.content || res.data || [];
      setViewCourses(list);
    } catch {
      setViewCourses([]);
    } finally {
      setViewCoursesLoading(false);
      setViewingTeacherId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setModalError('');
    setFormData({
      ...initialForm,
      departmentId: departments[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (teacher) => {
    setIsEditing(true);
    setEditingId(teacher.id);
    setModalError('');
    const deptMatch = departments.find((d) => d.name === teacher.departmentName);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phoneNumber: teacher.phoneNumber || '',
      gender: teacher.gender || 'MALE',
      departmentId: deptMatch ? deptMatch.id : (departments[0]?.id || ''),
      qualification: teacher.qualification || '',
      yearsOfExperience: teacher.yearsOfExperience || 0,
      emergencyPhone: teacher.emergencyPhone || '',
      bio: teacher.bio || '',
    });
    setShowModal(true);
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber && formData.phoneNumber.trim() !== '' ? formData.phoneNumber.trim() : null,
        emergencyPhone: formData.emergencyPhone && formData.emergencyPhone.trim() !== '' ? formData.emergencyPhone.trim() : null,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
      };

      if (isEditing) {
        await teacherApi.updateTeacher(editingId, payload);
        setToast({
          type: 'success',
          title: 'Teacher Profile Updated',
          message: `${payload.firstName} ${payload.lastName}'s profile has been updated.`,
        });
      } else {
        await teacherApi.createTeacher(payload);
        setToast({
          type: 'success',
          title: 'Teacher Registered Successfully',
          message: `${payload.firstName} ${payload.lastName} has been added to faculty.`,
        });
      }

      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      setModalError(
        err.message ||
          `Failed to ${isEditing ? 'update' : 'create'} teacher (Requires ROLE_ADMIN).`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${name}" (ID: #${id})?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await teacherApi.deleteTeacher(id);
      setToast({
        type: 'success',
        title: 'Teacher Deleted Successfully',
        message: `Faculty member "${name}" has been removed.`,
      });
      fetchTeachers();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete teacher (Requires ROLE_ADMIN).',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const canManage = hasRole('ADMIN');

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
          <h1 className="page-heading">{t('teachers.title')}</h1>
          <p className="page-subheading">
            {t('common.total')} {totalElements} {t('common.entries')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchTeachers()}
            className="btn-refresh"
            title="Refresh teachers list"
          >
            <RotateCw size={17} />
            <span>{t('common.refresh')}</span>
          </button>
          {canManage && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} />
              <span>{t('teachers.addTeacher')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Teachers Grid / Table */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} className="empty-icon" />
          <h3>{t('common.noData')}</h3>
          <p>{t('teachers.subtitle')}</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>{t('teachers.teacherName')}</th>
                  <th>{t('teachers.email')}</th>
                  <th>{t('teachers.department')}</th>
                  <th>{t('teachers.assignedCourses')}</th>
                  <th>{t('teachers.qualification')}</th>
                  <th>{t('teachers.hireDate')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="font-mono text-gray-500">#{teacher.id}</td>
                    <td>
                      <div className="font-semibold text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {teacher.phoneNumber || 'No phone'}
                      </div>
                    </td>
                    <td className="text-gray-600">{teacher.email}</td>
                    <td>
                      <span className="badge-department">
                        <Building2 size={13} className="badge-department-icon" />
                        <span>{teacher.departmentName || 'General'}</span>
                      </span>
                    </td>
                    <td>
                      {teacherCoursesMap[teacher.id] && teacherCoursesMap[teacher.id].length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {teacherCoursesMap[teacher.id].map((c) => (
                            <span
                              key={c.id}
                              className="badge-course-tag"
                              title={`${c.code}: ${c.title}`}
                            >
                              {c.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">None</span>
                      )}
                    </td>
                    <td className="text-gray-700 text-sm">
                      {teacher.qualification || 'N/A'}
                    </td>
                    <td className="text-gray-600 text-sm font-semibold">
                      {teacher.yearsOfExperience || 0} Years
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => handleOpenViewTeacher(teacher)}
                          className="btn-action-view"
                          disabled={viewingTeacherId === teacher.id}
                          title={t('teachers.viewDetails')}
                        >
                          {viewingTeacherId === teacher.id ? (
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
                          <>
                            <button
                              onClick={() => handleOpenEdit(teacher)}
                              className="btn-action-edit"
                              title={t('teachers.editTeacher')}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(teacher.id, `${teacher.firstName} ${teacher.lastName}`)
                              }
                              className="btn-action-delete"
                              disabled={deletingId === teacher.id}
                              title={t('common.delete')}
                            >
                              {deletingId === teacher.id ? (
                                <span
                                  className="btn-spinner btn-spinner-primary"
                                  style={{ width: 14, height: 14 }}
                                ></span>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
      )}

      {/* Add / Edit Teacher Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {isEditing ? t('teachers.editTeacher') : t('teachers.addTeacher')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTeacher} className="modal-form">
              {modalError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={18} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('teachers.firstName')}</label>
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
                  <label>{t('teachers.lastName')}</label>
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
                <label>{t('teachers.email')}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. sokha.chan@school.edu.kh"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('teachers.phoneNumber')}</label>
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

              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('teachers.department')}</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="select-input"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('teachers.hireDate')}</label>
                  <input
                    type="number"
                    min="0"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('teachers.qualification')}</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. Ph.D. in Computer Science"
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>{t('departments.description')}</label>
                <input
                  type="text"
                  name="bio"
                  placeholder="Specialist in Distributed Systems..."
                  value={formData.bio}
                  onChange={handleInputChange}
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
                    t('teachers.addTeacher')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Teacher Details Modal */}
      {viewingTeacher && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Briefcase className="text-amber-600" size={22} />
                <h3 className="text-lg font-bold">{t('teachers.viewDetails')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-modal-body">
              {/* Avatar & Name Header */}
              <div className="profile-modal-header-row">
                <div
                  className="profile-modal-avatar"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
                  }}
                >
                  {viewingTeacher.firstName?.charAt(0)}
                  {viewingTeacher.lastName?.charAt(0)}
                </div>
                <div className="profile-modal-header-info">
                  <h4>
                    {viewingTeacher.firstName} {viewingTeacher.lastName}
                  </h4>
                  <div className="profile-modal-meta-row">
                    <span className="font-mono text-xs text-gray-500">
                      ID: #{viewingTeacher.id}
                    </span>
                    <span className="badge-department">
                      <Building2 size={13} className="badge-department-icon" />
                      <span>{viewingTeacher.departmentName || 'Faculty Member'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Mail size={13} />
                    <span>{t('teachers.email')}</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingTeacher.email || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Phone size={13} />
                    <span>{t('teachers.phoneNumber')}</span>
                  </div>
                  <span className="profile-info-val font-mono">
                    {viewingTeacher.phoneNumber || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Award size={13} />
                    <span>{t('teachers.qualification')}</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingTeacher.qualification || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Briefcase size={13} />
                    <span>{t('teachers.hireDate')}</span>
                  </div>
                  <span className="profile-info-val" style={{ color: '#d97706' }}>
                    {viewingTeacher.yearsOfExperience || 0} Years
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <BookOpen size={13} />
                    <span>{t('teachers.assignedCourses')}</span>
                  </div>
                  <span className="profile-info-val" style={{ color: '#d97706', fontWeight: 700 }}>
                    {viewCourses.length} {t('nav.courses')}
                  </span>
                </div>
              </div>

              {/* Teaching Courses Section */}
              <div className="profile-modal-section">
                <div className="profile-modal-section-title">
                  <BookOpen size={16} style={{ color: '#d97706' }} />
                  <span>{t('teachers.assignedCourses')}</span>
                </div>

                {viewCoursesLoading ? (
                  <div className="py-4 text-center text-gray-400 text-sm">
                    <span
                      className="btn-spinner mr-2"
                      style={{
                        borderColor: 'rgba(217, 119, 6, 0.3)',
                        borderTopColor: '#d97706',
                      }}
                    ></span>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : viewCourses.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    {t('teachers.noCourses')}
                  </p>
                ) : (
                  <div className="profile-courses-list">
                    {viewCourses.map((c) => (
                      <div key={c.id} className="profile-course-card">
                        <div>
                          <div className="student-course-title">
                            <span
                              className="font-mono mr-1.5"
                              style={{ color: '#d97706', fontWeight: 700 }}
                            >
                              {c.code}
                            </span>
                            <span>{c.title}</span>
                          </div>
                          <div className="student-course-meta">
                            {t('courses.credits')}: <b>{c.credit}</b> | {t('courses.capacity')}: <b>{c.capacity}</b> ({c.availableSeats} {t('dashboard.coursesOverview.seatsLeft')}) | {t('courses.fee')}: <b>${Number(c.fee).toFixed(2)}</b>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Biography Section */}
              {viewingTeacher.bio && (
                <div className="profile-modal-section">
                  <div className="profile-modal-section-title">
                    <BookOpen size={16} style={{ color: '#d97706' }} />
                    <span>{t('departments.description')}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
                    {viewingTeacher.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
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
