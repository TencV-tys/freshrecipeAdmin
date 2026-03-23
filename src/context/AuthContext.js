import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkAdminAuth, adminLogout } from '../api/adminApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
          const userData = await checkAdminAuth();
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('adminUser');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const logout = async () => {
    await adminLogout();
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const value = {
    user,
    logout,
    loading,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};