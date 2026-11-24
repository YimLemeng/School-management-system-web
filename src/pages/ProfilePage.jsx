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
            <div className="card-box-title">
              <User className="card-header-icon" size={20} />
              <h3>{t('profile.infoTitle')}</h3>
            </div>
          </div>

          <div className="card-box-body">
            <div className="profile-user-header">
              <div className="profile-avatar-large">
                {profile?.username?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="profile-user-titles">
                <h2 className="profile-full-name">
                  {profile?.fullName || profile?.username}
                </h2>
                <span className="profile-username-tag">@{profile?.username}</span>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-row">
                <div className="profile-info-meta">
                  <Mail size={16} className="profile-meta-icon" />
                  <span className="profile-info-label">{t('profile.email')}</span>
                </div>
                <div className="profile-info-val">
                  {profile?.email || 'N/A'}
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-meta">
                  <Shield size={16} className="profile-meta-icon" />
                  <span className="profile-info-label">{t('profile.assignedRoles')}</span>
                </div>
                <div className="profile-info-val">
                  <div className="flex gap-1.5 flex-wrap">
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

              <div className="profile-info-row">
                <div className="profile-info-meta">
                  <Calendar size={16} className="profile-meta-icon" />
                  <span className="profile-info-label">{t('profile.createdAt')}</span>
                </div>
                <div className="profile-info-val">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : t('profile.activeStatus')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Change Password Card */}
        <div className="card-box">
          <div className="card-box-header">
            <div className="card-box-title">
              <KeyRound className="card-header-icon text-warning" size={20} />
              <h3>{t('profile.changePasswordTitle')}</h3>
            </div>
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
