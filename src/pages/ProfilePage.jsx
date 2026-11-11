import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authApi } from '../api/authApi';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
  Lock,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(user);

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getMe();
        if (res.data) {
          setProfile(res.data);
        }
      } catch {
        // Fallback to context user
        setProfile(user);
      }
    };

    fetchProfile();
  }, [user]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmNewPassword) {
      setPassError(t('profile.passwordMismatch'));
      return;
    }

    setPassLoading(true);

    try {
      await authApi.changePassword(passData);
      setPassSuccess(t('profile.passwordSuccess'));
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-heading">{t('profile.title')}</h1>
          <p className="page-subheading">{t('profile.subtitle')}</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left: User Profile Card */}
        <div className="card-box">
          <div className="card-box-header">
            <User className="text-indigo-600" size={22} />
            <h3>{t('profile.infoTitle')}</h3>
          </div>

          <div className="profile-avatar-row">
            <div className="profile-avatar-large">
              {profile?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.fullName || profile?.username}
              </h2>
              <p className="text-gray-500 font-mono text-sm">@{profile?.username}</p>
            </div>
          </div>

          <div className="profile-details-list">
            <div className="detail-item">
              <Mail size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="detail-label">{t('profile.email')}</p>
                <p className="detail-val">{profile?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="detail-item">
              <Shield size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="detail-label">{t('profile.assignedRoles')}</p>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {profile?.roles?.map((r) => {
                    const cleanRole = r.replace('ROLE_', '').toLowerCase();
                    return (
                      <span
                        key={r}
                        className={`badge-role role-${cleanRole}`}
                      >
                        {t(`roles.${cleanRole}`, r)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="detail-label">{t('profile.createdAt')}</p>
                <p className="detail-val">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : t('profile.activeStatus')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Change Password Card */}
        <div className="card-box">
          <div className="card-box-header">
            <KeyRound className="text-amber-600" size={22} />
            <h3>{t('profile.changePasswordTitle')}</h3>
          </div>

          {passError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="modal-form">
            <div className="form-group">
              <label>{t('profile.currentPassword')}</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                  value={passData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('profile.newPassword')}</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  value={passData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('profile.confirmNewPassword')}</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="••••••••"
                  value={passData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block flex items-center justify-center gap-2"
              disabled={passLoading}
            >
              {passLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>{t('profile.updatingPassword')}</span>
                </>
              ) : (
                t('profile.updatePasswordBtn')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
