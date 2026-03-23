import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkAdminAuth, adminLogout } from '../api/adminApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to set user after login
  const setUserData = (userData) => {
    console.log('Setting user data:', userData);
    setUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        const storedUser = localStorage.getItem('adminUser');
        console.log('Stored user:', storedUser);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verify with backend
          const verifiedUser = await checkAdminAuth();
          if (verifiedUser) {
            console.log('User verified:', verifiedUser);
            setUser(verifiedUser);
          } else {
            console.log('User not verified, clearing');
            localStorage.removeItem('adminUser');
            setUser(null);
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
    console.log('Logging out...');
    await adminLogout();
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const value = {
    user,
    setUser: setUserData,
    logout,
    loading,
    isAdmin: user?.role === 'admin'
  };

  console.log('AuthProvider state:', { user, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};