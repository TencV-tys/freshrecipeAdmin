import React from 'react';
import './RecipeViewModal.css';

const RecipeViewModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Helper to get image URL
  const getImageUrl = () => {
    if (!recipe.image) return null;
    if (recipe.image.startsWith('http')) return recipe.image;
    return `http://localhost:5000${recipe.image}`;
  };

  // Get creator name
  const getCreatorName = () => {
    if (recipe.createdBy?.username) return recipe.createdBy.username;
    if (recipe.creator?.username) return recipe.creator.username;
    return 'Admin';
  };

  // Get date (handle both created_at and createdAt)
  const getCreatedDate = () => {
    return recipe.created_at || recipe.createdAt;
  };

  return (
    <div className="recipe-modal-overlay" onClick={onClose}>
      <div className="recipe-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="recipe-modal-header">
          <h2>{recipe.title}</h2>
          <button className="recipe-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="recipe-modal-body">
          {/* Recipe Image */}
          {getImageUrl() && (
            <div className="recipe-modal-image">
              <img src={getImageUrl()} alt={recipe.title} />
            </div>
          )}

          {/* Recipe Info */}
          <div className="recipe-modal-info">
            <div className="info-badge">
              <span className="badge meal-type">{recipe.mealType || 'Meal'}</span>
              <span className="badge difficulty">{recipe.difficulty || 'Medium'}</span>
              <span className="badge views">👁️ {recipe.views || 0} views</span>
            </div>

            <div className="info-times">
              <div className="time-item">
                <span className="time-label">Prep Time</span>
                <span className="time-value">{recipe.prepTime || 0} min</span>
              </div>
              <div className="time-item">
                <span className="time-label">Cook Time</span>
                <span className="time-value">{recipe.cookTime || 0} min</span>
              </div>
              <div className="time-item">
                <span className="time-label">Total Time</span>
                <span className="time-value">{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
              </div>
              <div className="time-item">
                <span className="time-label">Servings</span>
                <span className="time-value">{recipe.servings || 4} people</span>
              </div>
            </div>

            {/* Description */}
            {recipe.description && (
              <div className="recipe-modal-section">
                <h3>Description</h3>
                <p className="recipe-description">{recipe.description}</p>
              </div>
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="recipe-modal-section">
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <span className="ingredient-quantity">{ing.quantity || ''}</span>
                      {ing.unit && <span className="ingredient-unit">{ing.unit}</span>}
                      <span className="ingredient-name">{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="recipe-modal-section">
                <h3>Instructions</h3>
                <ol className="instructions-list">
                  {recipe.instructions.map((inst, idx) => (
                    <li key={idx}>
                      <span className="instruction-text">{inst.text || inst.description}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Meta Info */}
            <div className="recipe-modal-meta">
              <div className="meta-item">
                <span className="meta-label">Created by:</span>
                <span className="meta-value">{getCreatorName()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created at:</span>
                <span className="meta-value">{formatDate(getCreatedDate())}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="recipe-modal-footer">
          <button className="modal-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeViewModal;