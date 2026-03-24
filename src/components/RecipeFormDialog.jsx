import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../api/adminApi';
import './RecipeFormDialog.css';

const RecipeFormDialog = ({ open, onClose, onSave, recipe }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mealType: '',
    difficulty: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    category: '',
    ingredients: [],
    instructions: []
  });
  
  const [ingredientInput, setIngredientInput] = useState({ name: '', quantity: '', unit: '' });
  const [instructionInput, setInstructionInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const resetForm = useCallback(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        mealType: recipe.mealType || '',
        difficulty: recipe.difficulty || '',
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        servings: recipe.servings || '',
        category: recipe.category?.join(', ') || '',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || []
      });
      setImagePreview(recipe.image ? `${API_URL.replace('/api', '')}${recipe.image}` : '');
    } else {
      setFormData({
        title: '',
        description: '',
        mealType: '',
        difficulty: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        category: '',
        ingredients: [],
        instructions: []
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIngredientInput({ name: '', quantity: '', unit: '' });
    setInstructionInput('');
  }, [recipe]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    }; 
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    if (ingredientInput.name) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...ingredientInput }]
      }));
      setIngredientInput({ name: '', quantity: '', unit: '' });
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleAddInstruction = () => {
  if (instructionInput) {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { 
        step: prev.instructions.length + 1, 
        step_number: prev.instructions.length + 1,  // ✅ Add both
        text: instructionInput 
      }]
    }));
    setInstructionInput('');
  }
};

  const handleRemoveInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };


  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!formData.title.trim()) {
    alert('Please enter a recipe title');
    return;
  }
  
  if (!formData.mealType) {
    alert('Please select a meal type');
    return;
  }
  
  if (!formData.difficulty) {
    alert('Please select a difficulty level');
    return;
  }
  
  // Create FormData for multipart/form-data
  const formDataToSend = new FormData();
  
  // Add all text fields (make sure they're not empty)
  formDataToSend.append('title', formData.title);
  formDataToSend.append('description', formData.description || '');
  formDataToSend.append('mealType', formData.mealType);
  formDataToSend.append('difficulty', formData.difficulty);
  formDataToSend.append('prepTime', formData.prepTime || '0');
  formDataToSend.append('cookTime', formData.cookTime || '0');
  formDataToSend.append('servings', formData.servings || '4');
  formDataToSend.append('category', formData.category || '');
  formDataToSend.append('isFilipino', 'true');
  
  // Add ingredients as JSON string
  formDataToSend.append('ingredients', JSON.stringify(formData.ingredients));
  
  // Add instructions as JSON string
  formDataToSend.append('instructions', JSON.stringify(formData.instructions));
  
  // Add image if exists
  if (imageFile) {
    formDataToSend.append('recipeImage', imageFile);
  }
  
  console.log('Submitting recipe:', {
    title: formData.title,
    mealType: formData.mealType,
    difficulty: formData.difficulty
  });
  
  onSave(formDataToSend, imageFile);
};

  
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{recipe ? 'Edit Recipe' : 'Create New Recipe'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Scrollable content area */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Section */}
            <div className="form-section">
              <div className="section-title">
                <span>📝</span>
                <h3>Basic Information</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Recipe Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Chicken Adobo"
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe your recipe..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Meal Type *</label>
                   <select 
  name="mealType" 
  value={formData.mealType} 
  onChange={handleChange} 
  required
  className={!formData.mealType ? 'error-border' : ''}
>
  <option value="">Select meal type</option>
  <option value="Breakfast">Breakfast</option>
  <option value="Lunch">Lunch</option>
  <option value="Dinner">Dinner</option>
  <option value="Snack">Snack</option>
</select>
                </div>
                
                <div className="form-group">
                  <label>Difficulty *</label>
                   <select 
  name="difficulty" 
  value={formData.difficulty} 
  onChange={handleChange} 
  required
  className={!formData.difficulty ? 'error-border' : ''}
>
  <option value="">Select difficulty</option>
  <option value="Easy">Easy</option>
  <option value="Medium">Medium</option>
  <option value="Hard">Hard</option>
</select>
                </div>
                
                <div className="form-group">
                  <label>Prep Time (minutes)</label>
                  <input
                    type="number"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                  />
                </div>
                
                <div className="form-group">
                  <label>Cook Time (minutes)</label>
                  <input
                    type="number"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                  />
                </div>
                
                <div className="form-group">
                  <label>Servings</label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    placeholder="e.g., 4"
                  />
                </div>
                
                <div className="form-group">
                  <label>Categories (comma separated)</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Filipino, Main Dish, Chicken"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="form-section">
              <div className="section-title">
                <span>🖼️</span>
                <h3>Recipe Image</h3>
              </div>
              
              <div className="image-upload-area">
                <input
                  type="file"
                  id="recipe-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="recipe-image" className="upload-label">
                  <span>📸</span>
                  <p>Click to upload image</p>
                  <small>PNG, JPG up to 5MB</small>
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button type="button" onClick={() => setImagePreview('')} className="remove-image">×</button>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="form-section">
              <div className="section-title">
                <span>🥬</span>
                <h3>Ingredients</h3>
              </div>
              
              <div className="ingredient-input-group">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredientInput.name}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ingredientInput.quantity}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, quantity: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredientInput.unit}
                  onChange={(e) => setIngredientInput({ ...ingredientInput, unit: e.target.value })}
                />
                <button type="button" onClick={handleAddIngredient} className="add-btn">Add</button>
              </div>
              
              <div className="ingredients-list">
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} className="ingredient-item">
                    <span>{ing.quantity} {ing.unit} {ing.name}</span>
                    <button type="button" onClick={() => handleRemoveIngredient(idx)} className="remove-btn">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="form-section">
              <div className="section-title">
                <span>👨‍🍳</span>
                <h3>Instructions</h3>
              </div>
              
              <div className="instruction-input-group">
                <input
                  type="text"
                  placeholder="Instruction step"
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                />
                <button type="button" onClick={handleAddInstruction} className="add-btn">Add Step</button>
              </div>
              
              <div className="instructions-list">
                {formData.instructions.map((inst, idx) => (
                  <div key={idx} className="instruction-item">
                    <div className="step-number">{inst.step}</div>
                    <div className="step-text">{inst.text}</div>
                    <button type="button" onClick={() => handleRemoveInstruction(idx)} className="remove-btn">×</button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer outside the scrollable area */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            {recipe ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeFormDialog;