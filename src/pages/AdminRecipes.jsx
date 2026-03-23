import React, { useState, useEffect, useCallback } from 'react';
import { getAdminRecipes, deleteAdminRecipe, createAdminRecipe, updateAdminRecipe } from '../api/adminApi';
import Sidebar from '../components/Sidebar';
import RecipeFormDialog from '../components/RecipeFormDialog';
import styles from '../styles/AdminRecipes.module.css';

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
      const data = await getAdminRecipes();
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
        await deleteAdminRecipe(recipeId);
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
        await updateAdminRecipe(editingRecipe.id, recipeData, imageFile);
      } else {
        await createAdminRecipe(recipeData, imageFile);
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

  return (
    <div className={styles.recipesPage}>
      <Sidebar active="recipes" />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Recipes Management</h1>
          <p>Create, edit and manage all recipes</p>
        </header>

        <div className={styles.controls}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <select value={filterMealType} onChange={(e) => setFilterMealType(e.target.value)}>
              <option value="all">All Meal Types</option>
              {mealTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <button className={styles.addButton} onClick={handleAddRecipe}>
            + Add New Recipe
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading recipes...</div>
        ) : filteredRecipes.length === 0 ? (
          <div className={styles.emptyState}>
            <span>🍽️</span>
            <h3>No recipes found</h3>
            <p>Click "Add New Recipe" to create your first recipe</p>
          </div>
        ) : (
          <div className={styles.recipesGrid}>
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className={styles.recipeCard}>
                <div className={styles.recipeImage}>
                  {recipe.image ? (
                    <img src={`http://localhost:5000${recipe.image}`} alt={recipe.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>🍳</div>
                  )}
                </div>
                <div className={styles.recipeContent}>
                  <h3>{recipe.title}</h3>
                  <div className={styles.recipeMeta}>
                    <span className={styles.mealType}>{recipe.mealType}</span>
                    <span className={styles.difficulty}>{recipe.difficulty}</span>
                    <span className={styles.views}>👁️ {recipe.views} views</span>
                  </div>
                  <p className={styles.description}>{recipe.description?.substring(0, 100)}...</p>
                  <div className={styles.recipeActions}>
                    <button className={styles.editBtn} onClick={() => handleEditRecipe(recipe)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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