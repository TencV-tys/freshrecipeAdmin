import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './AdminSidebar.css';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: '👥', path: '/admin/users' },
    { id: 'recipes', label: 'Recipes', icon: '🍽️', path: '/admin/recipes' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🍳</span>
          {!collapsed && <h2 className="logo-text">FreshRecipe</h2>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Theme Toggle at the bottom */}
      <div className="sidebar-footer">
        <div className="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
          <span className="logout-icon">🚪</span>
          {!collapsed && <span className="logout-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;