import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API_URL:', API_URL);

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
adminApi.interceptors.request.use(
  (config) => {
    console.log('=== REQUEST ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Data:', config.data);
    console.log('Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
adminApi.interceptors.response.use(
  (response) => {
    console.log('=== RESPONSE ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);
    console.log('Data:', response.data);
    return response;
  },
  (error) => {
    console.error('=== RESPONSE ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('URL:', error.response?.config?.url);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return Promise.reject(error);
  }
);

// Admin Auth
export const adminLogin = async (email, password) => {
  console.log('adminLogin called with:', { email, password: '***' });
  try {
    const response = await adminApi.post('/auth/login', { email, password });
    console.log('Login response received:', response.data);
    
    if (response.data.role !== 'admin') {
      console.log('User is not admin, role:', response.data.role);
      throw new Error('You do not have admin access');
    }
    
    console.log('Saving user to localStorage');
    localStorage.setItem('adminUser', JSON.stringify(response.data));
    console.log('Login successful, returning data');
    return response.data;
  } catch (error) {
    console.error('adminLogin error:', error);
    throw error;
  }
};

export const adminLogout = async () => {
  console.log('adminLogout called');
  await adminApi.post('/auth/logout');
  localStorage.removeItem('adminUser');
};

export const checkAdminAuth = async () => {
  console.log('checkAdminAuth called');
  try {
    const response = await adminApi.get('/users/profile');
    console.log('Auth check response:', response.data);
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

// Admin Stats
export const getAdminStats = async () => {
  console.log('getAdminStats called');
  const response = await adminApi.get('/admin/stats');
  return response.data;
};

// Admin Users
export const getAdminUsers = async (status = 'all') => {
  console.log('getAdminUsers called with status:', status);
  const response = await adminApi.get(`/admin/users?status=${status}`);
  return response.data;
};

export const getAdminUserById = async (userId) => {
  console.log('getAdminUserById called with userId:', userId);
  const response = await adminApi.get(`/admin/users/${userId}`);
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  console.log('deleteAdminUser called with userId:', userId);
  const response = await adminApi.delete(`/admin/users/${userId}`);
  return response.data;
};

// Admin Recipes
export const getAdminRecipes = async () => {
  console.log('getAdminRecipes called');
  const response = await adminApi.get('/admin/recipes');
  return response.data;
};

export const createAdminRecipe = async (recipeData, imageFile) => {
  console.log('createAdminRecipe called');
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
  console.log('updateAdminRecipe called for recipeId:', recipeId);
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
  console.log('deleteAdminRecipe called for recipeId:', recipeId);
  const response = await adminApi.delete(`/admin/recipes/${recipeId}`);
  return response.data;
};

export default adminApi;