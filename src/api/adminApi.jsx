import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const adminLogin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.role !== 'admin') throw new Error('Unauthorized');
  localStorage.setItem('adminUser', JSON.stringify(response.data));
  return response.data;
};

export const adminLogout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('adminUser');
};

export const checkAdminAuth = async () => {
  try {
    const response = await api.get('/users/profile');
    if (response.data.role === 'admin') {
      localStorage.setItem('adminUser', JSON.stringify(response.data));
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
};

// Dashboard
export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Users
export const getUsers = async (status = 'all') => {
  const response = await api.get(`/admin/users?status=${status}`);
  return response.data;
};

export const banUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/ban`);
  return response.data;
};

export const unbanUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/unban`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Recipes
export const getRecipes = async () => {
  const response = await api.get('/admin/recipes');
  return response.data;
};

export const createRecipe = async (recipeData, imageFile) => {
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
  if (imageFile) formData.append('recipeImage', imageFile);
  const response = await api.post('/admin/recipes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateRecipe = async (id, recipeData, imageFile) => {
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
  if (imageFile) formData.append('recipeImage', imageFile);
  const response = await api.put(`/admin/recipes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await api.delete(`/admin/recipes/${id}`);
  return response.data;
};

export default api;