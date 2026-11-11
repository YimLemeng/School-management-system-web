import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo';

export const DashboardLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
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

      {/* Sidebar with Desktop Collapse Toggle */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-content">
            <div className="brand-icon-wrapper" style={{ padding: 0, background: 'transparent' }}>
              <SchoolLogo size={40} />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">{t('brand.title')}</h1>
              <p className="brand-subtitle">{t('brand.subtitle')}</p>
            </div>
          </div>

          {/* Toggle Button for Open/Close Desktop Sidebar */}
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="sidebar-collapse-btn"
            title={isCollapsed ? 'Open / Expand Sidebar' : 'Close / Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {/* Navigation links (User Card was moved to Top Navbar as requested) */}
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
                  <Icon size={19} className="nav-icon" />
                </div>
                <span className="nav-text">{item.name}</span>
                <span className="nav-active-pill" />
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
                <LogOut size={18} />
                <span className="logout-text">{t('nav.signOut')}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`app-main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Desktop Top Navbar (User Profile & Language Switcher at Top Right) */}
        <header className="app-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span className="topbar-brand-chip">{t('brand.fullName')}</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Language Switcher (🇬🇧 EN | 🇰🇭 ខ្មែរ) */}
            <LanguageSwitcher />

            <div className="topbar-divider" />

            {/* User Profile Card in Top Right */}
            <div
              className="topbar-user-card"
              onClick={() => navigate('/profile')}
              title={user?.fullName || user?.username}
            >
              <div className="topbar-avatar">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="topbar-user-info">
                <p className="topbar-user-name">{user?.fullName || user?.username}</p>
                <span className={`badge-role role-${primaryRole.toLowerCase()}`}>
                  {t(`roles.${primaryRole.toLowerCase()}`, primaryRole)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-inner">
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
            <h3 className="signout-modal-title">{t('auth.signOutConfirmTitle')}</h3>
            <p className="signout-modal-message">
              {t('auth.signOutConfirmMsg')}
            </p>
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
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
