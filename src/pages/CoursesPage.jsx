import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api/courseApi';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export const CoursesPage = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Add Course Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const initialCourseForm = {
    title: '',
    code: '',
    description: '',
    credit: '',
    fee: '',
    capacity: '',
  };
  const [courseFormData, setCourseFormData] = useState(initialCourseForm);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        pageNo: 0,
        pageSize: 50,
      };
      if (search.trim()) params.search = search.trim();
      if (maxFee) params.maxFee = maxFee;
      if (availableOnly) params.availableOnly = true;

      const res = await courseApi.getAllCourses(params);
      if (res.data) {
        setCourses(res.data.content || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [availableOnly]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}" (ID: ${id})?`)) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await Promise.all([
        courseApi.deleteCourse(id),
        new Promise((r) => setTimeout(r, 450)),
      ]);
      setSuccess(`Course "${title}" deleted successfully.`);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to delete course.');
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
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: courseFormData.title.trim(),
        code: courseFormData.code.trim().toUpperCase(),
        description: courseFormData.description?.trim() || undefined,
        credit: Number(courseFormData.credit),
        fee: Number(courseFormData.fee),
        capacity: Number(courseFormData.capacity),
      };

      await Promise.all([
        courseApi.createCourse(payload),
        new Promise((r) => setTimeout(r, 450)),
      ]);
      setSuccess('Course created successfully!');
      setShowAddModal(false);
      setCourseFormData(initialCourseForm);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to create course.');
    } finally {
      setSubmittingCourse(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Courses & Curriculum</h1>
          <p className="page-subheading">
            Browse active courses, track real-time available seats, and fees.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setCourseFormData(initialCourseForm);
              setShowAddModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Course</span>
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

      {/* Filter Bar */}
      <div className="filter-card">
        <form onSubmit={handleFilterSubmit} className="search-form">
          <div className="input-with-icon flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search by course title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="input-with-icon w-48">
            <DollarSign size={18} className="input-icon" />
            <input
              type="number"
              placeholder="Max Fee ($)"
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
            <span>Available Seats Only</span>
          </label>

          <button
            type="submit"
            className="btn btn-secondary flex items-center gap-1.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner btn-spinner-primary"></span>
                <span>Applying...</span>
              </>
            ) : (
              'Apply Filter'
            )}
          </button>
        </form>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading courses curriculum...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>No Courses Found</h3>
          <p>Try clearing your search query or adjusting max fee filters.</p>
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
                      {isFull ? 'FULL' : `${c.availableSeats} Seats Left`}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      disabled={deletingId === c.id}
                      className="btn-course-delete-pro"
                      title={`Delete Course "${c.title}" (Admin Only)`}
                      aria-label="Delete Course"
                    >
                      {deletingId === c.id ? (
                        <span className="btn-spinner-sm-danger"></span>
                      ) : (
                        <Trash2 size={12} />
                      )}
                      <span>{deletingId === c.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  )}
                </div>

                <h3 className="course-title">{c.title}</h3>
                <p className="course-dept">
                  Department: <b>{c.departmentName || 'General'}</b>
                </p>
                <p className="course-instructor">
                  Instructor: <b>{c.teacherName || 'Not Assigned'}</b>
                </p>

                {/* Capacity Progress Bar */}
                <div className="capacity-box">
                  <div className="capacity-label">
                    <span>Enrolled: {c.capacity - c.availableSeats}/{c.capacity}</span>
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
                    <span className="fee-label">Course Fee</span>
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
                    <span>{isFull ? 'Sold Out' : 'Enroll Now'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <BookOpen className="text-indigo-600" size={22} />
                <h3>Add New Course</h3>
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
              <div className="form-row-2">
                <div className="form-group">
                  <label>Course Code</label>
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
                  <label>Course Title</label>
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
                  <label>Credits</label>
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
                  <label>Capacity</label>
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
                  <label>Course Fee ($)</label>
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
                <label>Description (Optional)</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingCourse}
                >
                  {submittingCourse ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>Creating Course...</span>
                    </>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
