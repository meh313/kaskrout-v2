import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { path: '/', label: 'لوحة التحكم', icon: '📊' },
    { path: '/management', label: 'الإدارة', icon: '⚙️' },
    { path: '/prices', label: 'الأسعار', icon: '💰' },
    { path: '/reports', label: 'التقارير', icon: '📈' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-right">
          <button className="mobile-menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="header-title">كسكروت عم الحبيب</h1>
        </div>
        <div className="header-user">
          <span>مرحباً، {user?.name}</span>
          <button className="header-logout" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <button
                  className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-text">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;