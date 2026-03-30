import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkAdminAuth, adminLogout, adminLogin } from '../api/adminApi';

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
          // Verify token is still valid with backend
          const verifiedUser = await checkAdminAuth();
          if (verifiedUser) {
            setUser(verifiedUser);
          } else {
            // Token invalid or expired
            localStorage.removeItem('adminUser');
            await adminLogout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

 const login = async (email, password) => {
  try {
    const response = await adminLogin(email, password);
    setUser(response);
    return response; // just return user
  } catch (error) {
    console.error('AuthContext login error:', error);
    throw error; // 🚨 throw error so AdminLogin catch block works
  }
};

  const logout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
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