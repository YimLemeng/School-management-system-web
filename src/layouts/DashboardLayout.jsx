import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, visible: true, theme: 'dashboard' },
    { name: 'Departments', path: '/departments', icon: Building2, visible: isAdmin, theme: 'departments' },
    { name: 'Students', path: '/students', icon: Users, visible: isAdmin || isTeacher, theme: 'students' },
    { name: 'Teachers', path: '/teachers', icon: Briefcase, visible: isAdmin, theme: 'teachers' },
    { name: 'Courses', path: '/courses', icon: BookOpen, visible: true, theme: 'courses' },
    { name: 'Enrollments', path: '/enrollments', icon: UserCheck, visible: true, theme: 'enrollments' },
    { name: 'My Profile', path: '/profile', icon: User, visible: true, theme: 'profile' },
  ];

  const navItems = allNavItems.filter((item) => item.visible);

  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'USER';

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SchoolLogo size={28} shadow={false} />
          <span>SchoolMS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-icon"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar with Desktop Collapse Toggle */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-content">
            <div className="brand-icon-wrapper" style={{ padding: 0, background: 'transparent' }}>
              <SchoolLogo size={isCollapsed ? 34 : 44} />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <h1 className="brand-title">School MS</h1>
                <p className="brand-subtitle">Management System</p>
              </div>
            )}
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

        {/* User Card */}
        <div className="sidebar-user-card" title={isCollapsed ? `${user?.fullName || user?.username} (${primaryRole})` : undefined}>
          <div className="user-avatar">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <p className="user-name">{user?.fullName || user?.username}</p>
              <span className={`badge-role role-${primaryRole.toLowerCase()}`}>
                {primaryRole}
              </span>
            </div>
          )}
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
                  <Icon size={19} className="nav-icon" />
                </div>
                {!isCollapsed && <span className="nav-text">{item.name}</span>}
                {!isCollapsed && <span className="nav-active-pill" />}
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
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            {loggingOut ? (
              <>
                <span className="btn-spinner" style={{ width: 14, height: 14 }}></span>
                {!isCollapsed && <span>Signing Out...</span>}
              </>
            ) : (
              <>
                <LogOut size={18} />
                {!isCollapsed && <span>Sign Out</span>}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`app-main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
            <h3 className="signout-modal-title">Sign Out</h3>
            <p className="signout-modal-message">
              Are you sure you want to log out of your account?
            </p>
            <div className="signout-modal-actions">
              <button
                type="button"
                className="btn-signout-cancel"
                data-no-loading="true"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-signout-confirm"
                onClick={confirmLogout}
                disabled={loggingOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
