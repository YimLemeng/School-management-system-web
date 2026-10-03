import React, { useState, useEffect } from 'react';
import { departmentApi } from '../api/departmentApi';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Users,
} from 'lucide-react';

export const DepartmentsPage = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const initialForm = {
    name: '',
    code: '',
    description: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await departmentApi.getAllDepartments();
      if (res.data) {
        setDepartments(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  const handleOpenEdit = (dept) => {
    setIsEditing(true);
    setEditingId(dept.id);
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || undefined,
      };

      if (isEditing) {
        await Promise.all([
          departmentApi.updateDepartment(editingId, payload),
          new Promise((r) => setTimeout(r, 450)),
        ]);
        setSuccess('Department updated successfully!');
      } else {
        await Promise.all([
          departmentApi.createDepartment(payload),
          new Promise((r) => setTimeout(r, 450)),
        ]);
        setSuccess('Department created successfully!');
      }

      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} department.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');
    try {
      await Promise.all([
        departmentApi.deleteDepartment(id),
        new Promise((r) => setTimeout(r, 450)),
      ]);
      setSuccess(`Department "${name}" deleted successfully.`);
      fetchDepartments();
    } catch (err) {
      setError(err.message || 'Failed to delete department.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDepartments = departments.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Academic Departments</h1>
          <p className="page-subheading">
            Manage academic divisions, department codes, and faculty assignments.
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Department</span>
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

      {/* Filter / Search Bar */}
      <div className="filter-card">
        <div className="search-form">
          <div className="input-with-icon flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search by department name or code (e.g. Computer Science, CS)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Departments Table */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading departments...</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} className="empty-icon" />
          <h3>No Departments Found</h3>
          <p>
            {search
              ? 'No department matched your search query.'
              : 'Click "Add Department" to register your first department.'}
          </p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Department Name</th>
                  <th>Total Teachers</th>
                  <th>Description</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="font-mono text-gray-500">#{dept.id}</td>
                    <td>
                      <span className="badge-role role-admin font-mono font-bold">
                        {dept.code}
                      </span>
                    </td>
                    <td className="font-bold text-gray-900">{dept.name}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <Users size={15} className="text-gray-400" />
                        <span>{dept.totalTeacher ?? 0} Faculty</span>
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm max-w-xs truncate">
                      {dept.description || <span className="italic text-gray-400">None</span>}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="actions-cell">
                          <button
                            onClick={() => handleOpenEdit(dept)}
                            className="btn-action-edit"
                            title="Edit Department"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="btn-action-delete"
                            disabled={deletingId === dept.id}
                            title="Delete Department"
                          >
                            {deletingId === dept.id ? (
                              <span
                                className="btn-spinner btn-spinner-primary"
                                style={{ width: 14, height: 14 }}
                              ></span>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Building2 className="text-indigo-600" size={22} />
                <h3>{isEditing ? 'Edit Department' : 'Add New Department'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. CS, MATH, PHYS, ENG"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  className="font-mono uppercase"
                />
              </div>

              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Computer Science"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Department of Computer Science & Software Engineering"
                  value={formData.description}
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
                      <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : isEditing ? (
                    'Update Department'
                  ) : (
                    'Create Department'
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
