import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  UserCheck,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo';
import { ModalPortal } from '../components/ModalPortal';

export const DashboardLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('school_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('school_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setLoggingOut(true);
    logout();
    navigate('/login', { replace: true });
    setLoggingOut(false);
  };

  // Prevent Safari / Browser Back button from dropping out of the authenticated Dashboard back into Login
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const isAdmin = hasRole('ADMIN');
  const isTeacher = hasRole('TEACHER');

  const allNavItems = [
    { name: t('nav.dashboard'), path: '/', icon: LayoutDashboard, visible: true },
    { name: t('nav.departments'), path: '/departments', icon: Building2, visible: isAdmin },
    { name: t('nav.students'), path: '/students', icon: Users, visible: isAdmin || isTeacher },
    { name: t('nav.teachers'), path: '/teachers', icon: Briefcase, visible: isAdmin },
    { name: t('nav.courses'), path: '/courses', icon: BookOpen, visible: true },
    { name: t('nav.enrollments'), path: '/enrollments', icon: UserCheck, visible: true },
    { name: t('nav.profile'), path: '/profile', icon: User, visible: true },
  ];

  const navItems = allNavItems.filter((item) => item.visible);
  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'USER';

  const activeNavItem = allNavItems.find((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  ) || { name: t('nav.dashboard') };

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SchoolLogo size={28} shadow={false} />
          <span>{t('brand.title')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSwitcher />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-icon"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* AdminLTE Dark Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Section */}
        <div className="sidebar-brand">
          <div
            className="brand-logo-content"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <SchoolLogo size={32} />
            <div className="brand-text">
              <span className="brand-name-adminlte">
                School<span className="brand-bold">MS</span>
              </span>
              <span className="brand-subtitle">{t('brand.subtitle')}</span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="sidebar-header-label">
          <span>{t('nav.mainNav')}</span>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                title={item.name}
                onClick={() => {
                  setSidebarOpen(false);
                }}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <div className="nav-icon-box">
                  <Icon size={18} className="nav-icon" />
                </div>
                <span className="nav-text">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="btn-logout btn-logout-trigger"
            data-no-loading="true"
            disabled={loggingOut}
            title={isCollapsed ? t('nav.signOut') : undefined}
          >
            {loggingOut ? (
              <>
                <span className="btn-spinner" style={{ width: 14, height: 14 }}></span>
                <span className="logout-text">{t('nav.signingOut')}</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span className="logout-text">{t('nav.signOut')}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`app-main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* AdminLTE Top Navbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  setSidebarOpen((prev) => !prev);
                } else {
                  toggleSidebarCollapse();
                }
              }}
              className="topbar-nav-toggle"
              title="Toggle Sidebar"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="topbar-breadcrumb">
              <span
                className="breadcrumb-item breadcrumb-home"
                onClick={() => navigate('/')}
              >
                {t('nav.dashboard')}
              </span>
              {location.pathname !== '/' && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item active">{activeNavItem.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="topbar-right">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <div className="topbar-divider" />

            {/* User Profile Card */}
            <div
              className="topbar-user-card"
              onClick={() => navigate('/profile')}
              title={user?.fullName || user?.username}
            >
              <div className="topbar-avatar">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{user?.fullName || user?.username}</span>
                <span className={`topbar-role-badge role-${primaryRole.toLowerCase()}`}>
                  {t(`roles.${primaryRole.toLowerCase()}`, primaryRole)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-inner" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sign Out Confirmation Modal */}
      {showLogoutModal && (
        <ModalPortal>
          <div
            className="signout-modal-backdrop"
            onClick={() => !loggingOut && setShowLogoutModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="signout-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="signout-modal-header">
                <div className="signout-modal-icon-badge">
                  <LogOut size={22} />
                </div>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => !loggingOut && setShowLogoutModal(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="signout-modal-body">
                <h3 className="signout-modal-title">{t('auth.signOutConfirmTitle')}</h3>
                <p className="signout-modal-message">
                  {t('auth.signOutConfirmMsg')}
                </p>
              </div>
              <div className="signout-modal-actions">
                <button
                  type="button"
                  className="btn-signout-cancel"
                  data-no-loading="true"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  className="btn-signout-confirm"
                  onClick={confirmLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={15} />
                  <span>{t('nav.signOut')}</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
