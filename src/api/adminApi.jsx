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
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    // Handle 403 Forbidden - account banned or suspended
    if (error.response?.status === 403) {
    
      const code = error.response?.data?.code;
      
      if (code === 'ACCOUNT_BANNED' || code === 'ACCOUNT_SUSPENDED') {
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// In adminApi.jsx - make sure adminLogin returns the user object properly
export const adminLogin = async (email, password) => {
  const response = await api.post('/auth/admin/login', { email, password });
  // Check if user is admin
  if (response.data.user.role !== 'admin') {
    throw new Error('Unauthorized - Admin access only');
  }
  const userData = response.data.user;
  localStorage.setItem('adminUser', JSON.stringify(userData));
  return userData;
}; 

export const adminLogout = async () => {
  try {
    await api.post('/auth/admin/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('adminUser');
  }
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

export const getDashboardData = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Users
export const getUsers = async (status = 'all') => {
  const response = await api.get(`/admin/users?status=${status}`);
  return response.data;
};

export const getUserDetails = async (userId) => {
  console.log('getUserDetails called with userId:', userId);
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

// ✅ NEW: Get user's scanned images
export const getUserScannedImages = async (userId) => {
  console.log('📸 getUserScannedImages called with userId:', userId);
  const response = await api.get(`/admin/users/${userId}/scans`);
  return response.data;
};

export const banUser = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}/ban`, data);
  return response.data;
}; 

export const suspendUser = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}/suspend`, data);
  return response.data;
};

export const warnUser = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}/warn`, data);
  return response.data;
};

export const restoreUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/restore`);
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
  console.log('createRecipe called with data type:', recipeData instanceof FormData ? 'FormData' : typeof recipeData);
  
  let formData;
  if (recipeData instanceof FormData) {
    formData = recipeData;
  } else {
    formData = new FormData();
    formData.append('title', recipeData.title);
    formData.append('description', recipeData.description || '');
    formData.append('mealType', recipeData.mealType);
    formData.append('difficulty', recipeData.difficulty);
    formData.append('prepTime', recipeData.prepTime);
    formData.append('cookTime', recipeData.cookTime);
    formData.append('servings', recipeData.servings);
    formData.append('category', recipeData.category);
    formData.append('ingredients', JSON.stringify(recipeData.ingredients));
    formData.append('instructions', JSON.stringify(recipeData.instructions));
    if (imageFile) {
      formData.append('recipeImage', imageFile);
    }
  }
   
  const response = await api.post('/admin/recipes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateRecipe = async (id, recipeData, imageFile) => {
  console.log('updateRecipe called with id:', id);
  
  if (!id) {
    console.error('No recipe ID provided for update');
    throw new Error('Recipe ID is required');
  }
  
  let formData;
  if (recipeData instanceof FormData) {
    formData = recipeData;
  } else {
    formData = new FormData();
    formData.append('title', recipeData.title);
    formData.append('description', recipeData.description || '');
    formData.append('mealType', recipeData.mealType);
    formData.append('difficulty', recipeData.difficulty);
    formData.append('prepTime', recipeData.prepTime || '0');
    formData.append('cookTime', recipeData.cookTime || '0');
    formData.append('servings', recipeData.servings || '4');
    formData.append('category', recipeData.category || '');
    formData.append('isFilipino', 'true');
    if (recipeData.ingredients) {
      formData.append('ingredients', JSON.stringify(recipeData.ingredients));
    }
    if (recipeData.instructions) {
      formData.append('instructions', JSON.stringify(recipeData.instructions));
    }
    if (imageFile) {
      formData.append('recipeImage', imageFile);
    }
  }
  
  const response = await api.put(`/admin/recipes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; 
};

export const deleteRecipe = async (id) => {
  console.log('🗑️ deleteRecipe called with id:', id);
  console.log('Type of id:', typeof id);
  
  if (!id) {
    console.error('❌ No recipe ID provided for delete');
    throw new Error('Recipe ID is required');
  }
  
  const recipeId = typeof id === 'object' ? (id.id || id._id) : id;
  console.log('Final recipeId to delete:', recipeId);
  
  const response = await api.delete(`/admin/recipes/${recipeId}`);
  console.log('✅ Delete response:', response.data);
  return response.data;
};

export default api;