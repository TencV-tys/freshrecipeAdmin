import React, { useState, useEffect, useCallback } from 'react';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../api/adminApi';
import RecipeFormDialog from '../components/RecipeFormDialog';
import RecipeViewModal from '../components/RecipeViewModal';
import '../styles/AdminRecipes.css';

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [filterMealType, setFilterMealType] = useState('all');

  const fetchRecipes = useCallback(async () => {
    console.log('📖 Fetching recipes...');
    setLoading(true);
    try {
      const data = await getRecipes();
      console.log('✅ Recipes fetched:', data.length);
      setRecipes(data);
    } catch (error) {
      console.error('❌ Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleAddRecipe = () => {
    console.log('➕ Adding new recipe');
    setEditingRecipe(null);
    setRecipeDialogOpen(true);
  };

  const handleEditRecipe = (recipe) => {
    console.log('✏️ Editing recipe:', recipe);
    setEditingRecipe(recipe);
    setRecipeDialogOpen(true);
  };

  const handleViewRecipe = (recipe) => {
    console.log('👁️ Viewing recipe:', recipe);
    setViewingRecipe(recipe);
  };

  const handleDeleteRecipe = async (recipe) => {
    console.log('🗑️ Delete button clicked for recipe:', recipe);
    const recipeId = recipe.id || recipe._id;
    
    if (!recipeId) {
      console.error('❌ No recipe ID found!', recipe);
      alert('Cannot delete: Recipe ID not found');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(recipeId);
        alert('Recipe deleted successfully');
        fetchRecipes();
      } catch (error) {
        console.error('❌ Failed to delete recipe:', error);
        alert('Failed to delete recipe');
      }
    }
  };

  const handleSaveRecipe = async (recipeData, imageFile) => {
    console.log('💾 Saving recipe, editingRecipe:', editingRecipe);
    
    try {
      if (editingRecipe) {
        const recipeId = editingRecipe.id || editingRecipe._id;
        if (!recipeId) {
          alert('Recipe ID not found');
          return;
        }
        await updateRecipe(recipeId, recipeData, imageFile);
        alert('Recipe updated successfully');
      } else {
        await createRecipe(recipeData, imageFile);
        alert('Recipe created successfully');
      }
      setRecipeDialogOpen(false);
      fetchRecipes();
    } catch (error) {
      console.error('❌ Failed to save recipe:', error);
      alert(error.response?.data?.message || 'Failed to save recipe');
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
          {filteredRecipes.map((recipe, index) => (
            <div 
              key={recipe.id || recipe._id || index} 
              className="recipe-card clickable"
              onClick={() => handleViewRecipe(recipe)}
            >
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
                <div className="recipe-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="edit-btn" onClick={() => handleEditRecipe(recipe)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteRecipe(recipe)}>Delete</button>
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

      <RecipeViewModal
        recipe={viewingRecipe}
        onClose={() => setViewingRecipe(null)}
      />
    </div>
  );
};

export default AdminRecipes;