import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/studentApi';
import { enrollmentApi } from '../api/enrollmentApi';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export const StudentsPage = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isTeacher = hasRole('TEACHER');
  const canManage = isAdmin || isTeacher;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError('');
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
      setError(err.message || 'Failed to fetch students.');
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
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setIsEditing(true);
    setEditingId(st.id);
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
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await Promise.all([
          studentApi.updateStudent(editingId, formData),
          new Promise((r) => setTimeout(r, 450)),
        ]);
        setSuccess('Student information updated successfully!');
      } else {
        await Promise.all([
          studentApi.createStudent(formData),
          new Promise((r) => setTimeout(r, 450)),
        ]);
        setSuccess('Student created successfully!');
      }
      setShowModal(false);
      setFormData(initialForm);
      fetchStudents();
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} student.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}" (ID: ${id})?`)) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await Promise.all([
        studentApi.deleteStudent(id),
        new Promise((r) => setTimeout(r, 450)),
      ]);
      setSuccess(`Student "${name}" deleted successfully.`);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to delete student (Requires ROLE_ADMIN).');
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
      const [res] = await Promise.all([
        enrollmentApi.getEnrollmentsByStudent(st.id),
        new Promise((r) => setTimeout(r, 350)),
      ]);
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
      <div className="page-header">
        <div>
          <h1 className="page-heading">Students Management</h1>
          <p className="page-subheading">
            Total {totalElements} registered students in the system.
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Student</span>
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

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="input-with-icon flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search by first name, last name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter size={18} className="text-gray-400" />
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setPageNo(0);
              }}
              className="select-input"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
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
                <span>Searching...</span>
              </>
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading students data...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <UserPlus size={48} className="empty-icon" />
            <h3>No Students Found</h3>
            <p>Try adjusting your search criteria or register a new student.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Actions</th>
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
                        {st.gender}
                      </span>
                    </td>
                    <td className="text-gray-600 text-sm">{st.dateOfBirth}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleOpenView(st)}
                        className="btn-action-view"
                        disabled={viewingId === st.id}
                        title="View Student Profile"
                      >
                        {viewingId === st.id ? (
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
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="btn-action-edit"
                          title="Update Student Information"
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
                          title="Delete Student (Admin Only)"
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
            Showing Page <b>{pageNo + 1}</b> of <b>{totalPages || 1}</b> (Total{' '}
            {totalElements} items)
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

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Update Student Information' : 'Add New Student'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="modal-form">
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
                  placeholder="e.g. sokha.chan@gmail.com"
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

              <div className="form-group">
                <label>Date of Birth</label>
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
                      <span>{isEditing ? 'Updating Student...' : 'Saving Student...'}</span>
                    </>
                  ) : isEditing ? (
                    'Update Student'
                  ) : (
                    'Save Student'
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
                <h3 className="text-lg font-bold">Student Profile Details</h3>
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
                      {viewingStudent.gender}
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
                    {viewingStudent.email || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Phone size={13} />
                    <span>Phone Number</span>
                  </div>
                  <span className="profile-info-val font-mono">
                    {viewingStudent.phoneNumber || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <Calendar size={13} />
                    <span>Date of Birth</span>
                  </div>
                  <span className="profile-info-val">
                    {viewingStudent.dateOfBirth || 'N/A'}
                  </span>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <BookOpen size={13} />
                    <span>Enrolled Courses</span>
                  </div>
                  <span className="profile-info-val" style={{ color: 'var(--color-primary)' }}>
                    {viewEnrollments.length} Course(s)
                  </span>
                </div>
              </div>

              {/* Enrolled Courses Section */}
              <div className="profile-modal-section">
                <div className="profile-modal-section-title">
                  <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Enrolled Courses</span>
                </div>

                {viewLoading ? (
                  <div className="py-4 text-center text-gray-400 text-sm">
                    <span className="btn-spinner btn-spinner-primary mr-2"></span>
                    <span>Loading courses...</span>
                  </div>
                ) : viewEnrollments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No active course enrollments found for this student.
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
                            Status: <b className="text-emerald-600">{en.status}</b> | Fee: ${Number(en.finalFee).toFixed(2)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
