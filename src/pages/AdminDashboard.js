import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { getAdminStats, getAdminUsers, getAdminRecipes, deleteAdminRecipe, createAdminRecipe, updateAdminRecipe } from '../api/adminApi';
import AdminSidebar from '../components/AdminSidebar';
import RecipeFormDialog from '../components/RecipeFormDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalIngredients: 0,
    usersActiveToday: 0,
    mostViewedRecipes: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'recipes') {
      fetchRecipes();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const fetchRecipes = async () => {
    try {
      const data = await getAdminRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes');
    }
  };

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    setRecipeDialogOpen(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeDialogOpen(true);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteAdminRecipe(recipeId);
        setRecipes(recipes.filter(r => r.id !== recipeId));
      } catch (err) {
        console.error('Failed to delete recipe');
      }
    }
  };

  const handleSaveRecipe = async (recipeData, imageFile) => {
    try {
      if (editingRecipe) {
        const response = await updateAdminRecipe(editingRecipe.id, recipeData, imageFile);
        setRecipes(recipes.map(r => r.id === editingRecipe.id ? response : r));
      } else {
        const response = await createAdminRecipe(recipeData, imageFile);
        setRecipes([response, ...recipes]);
      }
      setRecipeDialogOpen(false);
    } catch (err) {
      console.error('Failed to save recipe');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Dashboard</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40 }} />
                    <Box><Typography variant="subtitle1">Total Users</Typography><Typography variant="h3" fontWeight="bold">{stats.totalUsers}</Typography></Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', cursor: 'pointer' }} onClick={() => setActiveTab('recipes')}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <RestaurantMenuIcon sx={{ fontSize: 40 }} />
                    <Box><Typography variant="subtitle1">Total Recipes</Typography><Typography variant="h3" fontWeight="bold">{stats.totalRecipes}</Typography></Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: 40 }} />
                    <Box><Typography variant="subtitle1">Active Today</Typography><Typography variant="h3" fontWeight="bold">{stats.usersActiveToday}</Typography></Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );
      case 'users':
        return (
          <>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Users</Typography>
            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell>Last Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell><TableCell>{user.email}</TableCell>
                        <TableCell><Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} size="small" /></TableCell>
                        <TableCell>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        );
      case 'recipes':
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography variant="h5" fontWeight="bold">Recipes</Typography><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRecipe}>Add Recipe</Button></Box>
            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow><TableCell>Title</TableCell><TableCell>Meal Type</TableCell><TableCell>Difficulty</TableCell><TableCell>Views</TableCell><TableCell>Actions</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {recipes.map(recipe => (
                      <TableRow key={recipe.id}>
                        <TableCell>{recipe.title}</TableCell><TableCell>{recipe.mealType}</TableCell><TableCell>{recipe.difficulty}</TableCell><TableCell>{recipe.views}</TableCell>
                        <TableCell><IconButton onClick={() => handleEditRecipe(recipe)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDeleteRecipe(recipe.id)}><DeleteIcon /></IconButton></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        );
      default: return null;
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} drawerOpen={drawerOpen} onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>{renderContent()}</Box>
      <RecipeFormDialog open={recipeDialogOpen} onClose={() => setRecipeDialogOpen(false)} onSave={handleSaveRecipe} recipe={editingRecipe} />
    </Box>
  );
};

export default AdminDashboard;