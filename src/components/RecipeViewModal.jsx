import React from 'react';
import './RecipeViewModal.css';

const RecipeViewModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="recipe-modal-overlay" onClick={onClose}>
      <div className="recipe-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="recipe-modal-header">
          <h2>{recipe.title}</h2>
          <button className="recipe-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="recipe-modal-body">
          {/* Recipe Image */}
          {recipe.image && (
            <div className="recipe-modal-image">
              <img src={`http://localhost:5000${recipe.image}`} alt={recipe.title} />
            </div>
          )}

          {/* Recipe Info */}
          <div className="recipe-modal-info">
            <div className="info-badge">
              <span className="badge meal-type">{recipe.mealType}</span>
              <span className="badge difficulty">{recipe.difficulty}</span>
              <span className="badge views">👁️ {recipe.views} views</span>
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
                <p>{recipe.description}</p>
              </div>
            )}

            {/* Ingredients */}
            <div className="recipe-modal-section">
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((ing, idx) => (
                  <li key={idx}>
                    <span className="ingredient-quantity">{ing.quantity}</span>
                    <span className="ingredient-unit">{ing.unit}</span>
                    <span className="ingredient-name">{ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="recipe-modal-section">
              <h3>Instructions</h3>
              <ol className="instructions-list">
                {recipe.instructions?.map((inst, idx) => (
                  <li key={idx}>
                    <span className="instruction-step">{inst.step || idx + 1}.</span>
                    <span className="instruction-text">{inst.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Meta Info */}
            <div className="recipe-modal-meta">
              <div className="meta-item">
                <span className="meta-label">Created by:</span>
                <span className="meta-value">{recipe.createdBy?.username || 'Admin'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created at:</span>
                <span className="meta-value">{new Date(recipe.createdAt).toLocaleDateString()}</span>
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