import React, { useState, useEffect } from 'react';
import { departmentApi } from '../api/departmentApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  RotateCw,
} from 'lucide-react';

export const DepartmentsPage = () => {
  const { hasRole } = useAuth();
  const { t } = useLanguage();
  const isAdmin = hasRole('ADMIN');

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

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState('');
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
    try {
      const res = await departmentApi.getAllDepartments();
      if (res.data) {
        setDepartments(res.data || []);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Failed to load departments',
        message: err.message || 'Could not fetch departments list.',
      });
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
    setModalError('');
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditing(true);
    setEditingId(dept.id);
    setModalError('');
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
    setModalError('');

    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || undefined,
      };

      if (isEditing) {
        await departmentApi.updateDepartment(editingId, payload);
        setToast({
          type: 'success',
          title: 'Department Updated',
          message: `Department "${payload.name}" has been updated.`,
        });
      } else {
        await departmentApi.createDepartment(payload);
        setToast({
          type: 'success',
          title: 'Department Created',
          message: `Department "${payload.name}" has been registered.`,
        });
      }

      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      setModalError(err.message || `Failed to ${isEditing ? 'update' : 'create'} department.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await departmentApi.deleteDepartment(id);
      setToast({
        type: 'success',
        title: 'Department Deleted',
        message: `Department "${name}" has been removed.`,
      });
      fetchDepartments();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete department.',
      });
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
          <h1 className="page-heading">{t('departments.title')}</h1>
          <p className="page-subheading">{t('departments.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchDepartments()}
            className="btn-refresh"
            title="Refresh departments list"
          >
            <RotateCw size={17} />
            <span>{t('common.refresh')}</span>
          </button>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} />
              <span>{t('departments.addDepartment')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-card">
        <div className="search-form">
          <div className="input-with-icon flex-1">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              placeholder={t('common.search')}
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
          <p>{t('common.loading')}</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} className="empty-icon" />
          <h3>{t('common.noData')}</h3>
          <p>{t('departments.subtitle')}</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>{t('departments.deptCode')}</th>
                  <th>{t('departments.deptName')}</th>
                  <th>{t('teachers.title')}</th>
                  <th>{t('departments.description')}</th>
                  {isAdmin && <th>{t('common.actions')}</th>}
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
                        <span>{dept.totalTeacher ?? 0}</span>
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
                            title={t('departments.editDepartment')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="btn-action-delete"
                            disabled={deletingId === dept.id}
                            title={t('common.delete')}
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
                <h3>{isEditing ? t('departments.editDepartment') : t('departments.addDepartment')}</h3>
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
              {modalError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={18} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-group">
                <label>{t('departments.deptCode')}</label>
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
                <label>{t('departments.deptName')}</label>
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
                <label>{t('departments.description')}</label>
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
                    t('departments.addDepartment')
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
