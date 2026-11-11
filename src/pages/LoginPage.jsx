import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState(
    location.state?.defaultUsername || ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.successMessage || '');

  // Rate-limiting / brute-force protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setError('');
    setSuccess('');

    const cleanUsername = usernameOrEmail.trim();
    if (!cleanUsername || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(cleanUsername, password);
      setFailedAttempts(0);
      navigate(from, { replace: true });
    } catch (err) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      // Clean password input to prevent memory retention
      setPassword('');

      if (nextFailures >= MAX_FAILED_ATTEMPTS) {
        setLockoutTimer(LOCKOUT_SECONDS);
        setError(`Too many failed attempts. For security reasons, please wait ${LOCKOUT_SECONDS} seconds before retrying.`);
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - nextFailures;
        const msg = err.message || 'Invalid username/email or password.';
        setError(remaining <= 2 ? `${msg} (${remaining} attempts remaining before temporary lockout)` : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <SchoolLogo size={64} />
          </div>
          <h2>{t('auth.signInTitle')}</h2>
          <p>{t('auth.signInSubtitle')}</p>
        </div>

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {lockoutTimer > 0 ? <ShieldAlert size={18} /> : <AlertCircle size={18} />}
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>{t('auth.usernameOrEmail')}</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                autoComplete="username"
                placeholder="e.g. admin or admin@school.edu.kh"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={loading || lockoutTimer > 0}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || lockoutTimer > 0}
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={loading || lockoutTimer > 0}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            data-no-loading="true"
            disabled={loading || lockoutTimer > 0}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                <span>{t('auth.authenticating')}</span>
              </>
            ) : lockoutTimer > 0 ? (
              `Locked (${lockoutTimer}s)`
            ) : (
              t('auth.signInBtn')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
