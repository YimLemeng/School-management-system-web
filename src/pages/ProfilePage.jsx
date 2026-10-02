import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change Password Form State
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
        setProfile(res.data);
      } catch (err) {
        // Fallback to context user
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmNewPassword) {
      setPassError('New password and Confirm new password do not match.');
      return;
    }

    setPassLoading(true);

    try {
      await Promise.all([
        authApi.changePassword(passData),
        new Promise((r) => setTimeout(r, 450)),
      ]);
      setPassSuccess('Password changed successfully! You can use your new password next time.');
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
          <h1 className="page-heading">User Account & Security</h1>
          <p className="page-subheading">
            Inspect your profile, active authorities, and update your security credentials.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left: User Profile Card */}
        <div className="card-box">
          <div className="card-box-header">
            <User className="text-indigo-600" size={22} />
            <h3>Profile Information</h3>
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
                <p className="detail-label">Email Address</p>
                <p className="detail-val">{profile?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="detail-item">
              <Shield size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="detail-label">Assigned Roles</p>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {profile?.roles?.map((r) => (
                    <span
                      key={r}
                      className={`badge-role role-${r.replace('ROLE_', '').toLowerCase()}`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="detail-label">Account Created</p>
                <p className="detail-val">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Change Password Card */}
        <div className="card-box">
          <div className="card-box-header">
            <KeyRound className="text-amber-600" size={22} />
            <h3>Change Password</h3>
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
              <label>Current Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={passData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Minimum 6 characters"
                  value={passData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Re-enter new password"
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
                  <span>Updating Password...</span>
                </>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
