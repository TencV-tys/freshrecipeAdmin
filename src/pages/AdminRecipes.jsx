import React, { useState, useEffect, useCallback } from 'react';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../api/adminApi';
import RecipeFormDialog from '../components/RecipeFormDialog';
import '../styles/AdminRecipes.css';

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [filterMealType, setFilterMealType] = useState('all');

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

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
        await deleteRecipe(recipeId);
        fetchRecipes();
      } catch (error) {
        console.error('Failed to delete recipe:', error);
        alert('Failed to delete recipe');
      }
    }
  };

  const handleSaveRecipe = async (recipeData, imageFile) => {
    try {
      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, recipeData, imageFile);
      } else {
        await createRecipe(recipeData, imageFile);
      }
      setRecipeDialogOpen(false);
      fetchRecipes();
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert('Failed to save recipe');
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(search.toLowerCase()) ||
                          recipe.description?.toLowerCase().includes(search.toLowerCase());
    const matchesMealType = filterMealType === 'all' || recipe.mealType === filterMealType;
    return matchesSearch && matchesMealType;
  });

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  if (loading) {
    return <div className="recipes-loading">Loading recipes...</div>;
  }

  return (
    <div className="admin-recipes">
      <header className="recipes-header">
        <h1>Recipes Management</h1>
        <p>Create, edit and manage all recipes</p>
      </header>

      <div className="recipes-controls">
        <div className="recipes-search">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="recipes-filters">
          <select value={filterMealType} onChange={(e) => setFilterMealType(e.target.value)}>
            <option value="all">All Meal Types</option>
            {mealTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button className="add-recipe-btn" onClick={handleAddRecipe}>
          + Add New Recipe
        </button>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="empty-state">
          <span>🍽️</span>
          <h3>No recipes found</h3>
          <p>Click "Add New Recipe" to create your first recipe</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-image">
                {recipe.image ? (
                  <img src={`http://localhost:5000${recipe.image}`} alt={recipe.title} />
                ) : (
                  <div className="image-placeholder">🍳</div>
                )}
              </div>
              <div className="recipe-content">
                <h3>{recipe.title}</h3>
                <div className="recipe-meta">
                  <span className="meal-type">{recipe.mealType}</span>
                  <span className="difficulty">{recipe.difficulty}</span>
                  <span className="views">👁️ {recipe.views} views</span>
                </div>
                <p className="recipe-description">{recipe.description?.substring(0, 100)}...</p>
                <div className="recipe-actions">
                  <button className="edit-btn" onClick={() => handleEditRecipe(recipe)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecipeFormDialog
        open={recipeDialogOpen}
        onClose={() => setRecipeDialogOpen(false)}
        onSave={handleSaveRecipe}
        recipe={editingRecipe}
      />
    </div>
  );
};

export default AdminRecipes;