import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AdminSidebar.module.css';

const AdminSidebar = ({ active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: '👥', path: '/admin/users' },
    { id: 'recipes', label: 'Recipes', icon: '🍽️', path: '/admin/recipes' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (itemId) => {
    if (active) return active === itemId;
    return location.pathname.includes(itemId);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>🍳</span>
        <h2>FreshRecipe</h2>
      </div>
      <nav className={styles.nav}>
        {menu.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${isActive(item.id) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button className={styles.logout} onClick={handleLogout}>
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;