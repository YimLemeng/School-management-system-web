import React, { useState, useEffect } from 'react';
import { teacherApi } from '../api/teacherApi';
import { departmentApi } from '../api/departmentApi';
import { courseApi } from '../api/courseApi';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export const TeachersPage = () => {
  const { hasRole } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError('');
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
      setError(err.message || 'Failed to load teachers.');
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

  const handleOpenViewTeacher = async (t) => {
    setViewingTeacherId(t.id);
    setViewingTeacher(t);
    setViewCoursesLoading(true);
    setViewCourses([]);
    try {
      const [res] = await Promise.all([
        courseApi.getAllCourses({ teacherId: t.id, pageSize: 50 }),
        new Promise((r) => setTimeout(r, 350)),
      ]);
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
    setFormData({
      ...initialForm,
      departmentId: departments[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setIsEditing(true);
    setEditingId(t.id);
    const deptMatch = departments.find((d) => d.name === t.departmentName);
    setFormData({
      firstName: t.firstName || '',
      lastName: t.lastName || '',
      email: t.email || '',
      phoneNumber: t.phoneNumber || '',
      gender: t.gender || 'MALE',
      departmentId: deptMatch ? deptMatch.id : (departments[0]?.id || ''),
      qualification: t.qualification || '',
      yearsOfExperience: t.yearsOfExperience || 0,
      emergencyPhone: t.emergencyPhone || '',
      bio: t.bio || '',
    });
    setShowModal(true);
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
      };

      if (isEditing) {
        await Promise.all([
          teacherApi.updateTeacher(editingId, payload),
          new Promise((r) => setTimeout(r, 450)),
        ]);
        setSuccess('Teacher profile updated successfully!');
      } else {
        await Promise.all([
          teacherApi.createTeacher(payload),
          new Promise((r) => setTimeout(r, 450)),
        ]);
        setSuccess('Teacher registered successfully!');
      }

      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${isEditing ? 'update' : 'create'} teacher (Requires ROLE_ADMIN).`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${name}" (ID: ${id})?`)) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await Promise.all([
        teacherApi.deleteTeacher(id),
        new Promise((r) => setTimeout(r, 450)),
      ]);
      setSuccess(`Teacher "${name}" deleted successfully.`);
      fetchTeachers();
    } catch (err) {
      setError(err.message || 'Failed to delete teacher (Requires ROLE_ADMIN).');
    } finally {
      setDeletingId(null);
    }
  };

  const canManage = hasRole('ADMIN');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Instructors & Faculty</h1>
          <p className="page-subheading">
            Total {totalElements} academic teachers in the faculty directory.
          </p>
        </div>
        {canManage && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Teacher</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Teachers Grid / Table */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading faculty instructors...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} className="empty-icon" />
          <h3>No Teachers Found</h3>
          <p>Click "Add Teacher" to register your first faculty member.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Faculty Member</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Teaching Courses</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-gray-500">#{t.id}</td>
                    <td>
                      <div className="font-semibold text-gray-900">
                        {t.firstName} {t.lastName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {t.phoneNumber || 'No phone'}
                      </div>
                    </td>
                    <td className="text-gray-600">{t.email}</td>
                    <td>
                      <span className="badge-department">
                        <Building2 size={13} className="badge-department-icon" />
                        <span>{t.departmentName || 'General'}</span>
                      </span>
                    </td>
                    <td>
                      {teacherCoursesMap[t.id] && teacherCoursesMap[t.id].length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {teacherCoursesMap[t.id].map((c) => (
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
                      {t.qualification || 'N/A'}
                    </td>
                    <td className="text-gray-600 text-sm font-semibold">
                      {t.yearsOfExperience || 0} Years
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => handleOpenViewTeacher(t)}
                          className="btn-action-view"
                          disabled={viewingTeacherId === t.id}
                          title="View Teacher Profile"
                        >
                          {viewingTeacherId === t.id ? (
                            <>
                              <span
                                className="btn-spinner btn-spinner-primary"
                                style={{ width: 13, height: 13 }}
                              ></span>
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>View</span>
                            </>
                          )}
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="btn-action-edit"
                              title="Update Teacher Details (Admin)"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(t.id, `${t.firstName} ${t.lastName}`)
                              }
                              className="btn-action-delete"
                              disabled={deletingId === t.id}
                              title="Delete Teacher (Admin)"
                            >
                              {deletingId === t.id ? (
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
              Showing Page <b>{pageNo + 1}</b> of <b>{totalPages || 1}</b> (Total{' '}
              {totalElements} teachers)
            </p>
            <div className="pagination-controls">
              <button
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                disabled={pageNo === 0}
                className="btn-page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
                disabled={pageNo >= totalPages - 1}
                className="btn-page"
              >
                <span>Next</span>
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
                {isEditing ? 'Update Faculty Member' : 'Register New Faculty Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTeacher} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>First Name</label>
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
                  <label>Last Name</label>
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
                <label>Email Address</label>
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
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="+85512345678"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="select-input"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Department</label>
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
                  <label>Years of Experience</label>
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
                <label>Academic Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. Ph.D. in Computer Science"
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Biography / Summary</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : isEditing ? (
                    'Update Teacher'
                  ) : (
                    'Save Faculty Member'
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
                <h3 className="text-lg font-bold">Faculty Profile Details</h3>
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
                    <span>Email Address</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingTeacher.email || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Phone size={13} />
                    <span>Phone Number</span>
                  </div>
                  <span className="profile-info-val font-mono">
                    {viewingTeacher.phoneNumber || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Award size={13} />
                    <span>Qualification</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingTeacher.qualification || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Briefcase size={13} />
                    <span>Experience</span>
                  </div>
                  <span className="profile-info-val" style={{ color: '#d97706' }}>
                    {viewingTeacher.yearsOfExperience || 0} Years
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <BookOpen size={13} />
                    <span>Teaching Courses</span>
                  </div>
                  <span className="profile-info-val" style={{ color: '#d97706', fontWeight: 700 }}>
                    {viewCourses.length} Course(s)
                  </span>
                </div>
              </div>

              {/* Teaching Courses Section */}
              <div className="profile-modal-section">
                <div className="profile-modal-section-title">
                  <BookOpen size={16} style={{ color: '#d97706' }} />
                  <span>Assigned Teaching Courses</span>
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
                    <span>Loading teaching courses...</span>
                  </div>
                ) : viewCourses.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No courses are currently assigned to this faculty member.
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
                            Credits: <b>{c.credit}</b> | Capacity: <b>{c.capacity}</b> ({c.availableSeats} seats left) | Fee: <b>${Number(c.fee).toFixed(2)}</b>
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
                    <span>Biography & Background</span>
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
