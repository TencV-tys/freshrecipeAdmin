import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin Auth
export const adminLogin = async (email, password) => {
  const response = await adminApi.post('/auth/login', { email, password });
  
  if (response.data.role !== 'admin') {
    throw new Error('You do not have admin access');
  }
  
  localStorage.setItem('adminUser', JSON.stringify(response.data));
  return response.data;
};

export const adminLogout = async () => {
  await adminApi.post('/auth/logout');
  localStorage.removeItem('adminUser');
};

export const checkAdminAuth = async () => {
  try {
    const response = await adminApi.get('/users/profile');
    if (response.data.role === 'admin') {
      localStorage.setItem('adminUser', JSON.stringify(response.data));
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Admin Stats
export const getAdminStats = async () => {
  const response = await adminApi.get('/admin/stats');
  return response.data;
};

// Admin Users
export const getAdminUsers = async (status = 'all') => {
  const response = await adminApi.get(`/admin/users?status=${status}`);
  return response.data;
};

export const getAdminUserById = async (userId) => {
  const response = await adminApi.get(`/admin/users/${userId}`);
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await adminApi.delete(`/admin/users/${userId}`);
  return response.data;
};

// Admin Recipes
export const getAdminRecipes = async () => {
  const response = await adminApi.get('/admin/recipes');
  return response.data;
};

export const createAdminRecipe = async (recipeData, imageFile) => {
  const formData = new FormData();
  
  Object.keys(recipeData).forEach(key => {
    if (recipeData[key] !== undefined && recipeData[key] !== null) {
      if (Array.isArray(recipeData[key])) {
        formData.append(key, JSON.stringify(recipeData[key]));
      } else {
        formData.append(key, recipeData[key]);
      }
    }
  });
  
  if (imageFile) {
    formData.append('recipeImage', imageFile);
  }
  
  const response = await adminApi.post('/admin/recipes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateAdminRecipe = async (recipeId, recipeData, imageFile) => {
  const formData = new FormData();
  
  Object.keys(recipeData).forEach(key => {
    if (recipeData[key] !== undefined && recipeData[key] !== null) {
      if (Array.isArray(recipeData[key])) {
        formData.append(key, JSON.stringify(recipeData[key]));
      } else {
        formData.append(key, recipeData[key]);
      }
    }
  });
  
  if (imageFile) {
    formData.append('recipeImage', imageFile);
  }
  
  const response = await adminApi.put(`/admin/recipes/${recipeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteAdminRecipe = async (recipeId) => {
  const response = await adminApi.delete(`/admin/recipes/${recipeId}`);
  return response.data;
};

export default adminApi;