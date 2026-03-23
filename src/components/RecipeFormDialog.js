import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

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

  useEffect(() => {
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
      setImagePreview(recipe.image ? `http://localhost:5000${recipe.image}` : '');
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
  }, [recipe, open]);

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
        instructions: [...prev.instructions, { step: prev.instructions.length + 1, text: instructionInput }]
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
    const recipeData = {
      ...formData,
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 4,
      category: formData.category.split(',').map(c => c.trim()).filter(c => c),
      isFilipino: true,
      ingredients: formData.ingredients,
      instructions: formData.instructions
    };
    onSave(recipeData, imageFile);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {recipe ? 'Edit Recipe' : 'Add New Recipe'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Recipe Title" name="title" value={formData.title} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select name="mealType" value={formData.mealType} onChange={handleChange} label="Meal Type" required>
                  <MenuItem value="Breakfast">Breakfast</MenuItem>
                  <MenuItem value="Lunch">Lunch</MenuItem>
                  <MenuItem value="Dinner">Dinner</MenuItem>
                  <MenuItem value="Snack">Snack</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select name="difficulty" value={formData.difficulty} onChange={handleChange} label="Difficulty" required>
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Prep Time (minutes)" name="prepTime" type="number" value={formData.prepTime} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Cook Time (minutes)" name="cookTime" type="number" value={formData.cookTime} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Servings" name="servings" type="number" value={formData.servings} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Recipe Image</Typography>
                <input accept="image/*" style={{ display: 'none' }} id="recipe-image-upload" type="file" onChange={handleImageChange} />
                <label htmlFor="recipe-image-upload">
                  <Button variant="outlined" component="span" startIcon={<AddPhotoAlternateIcon />}>Upload Image</Button>
                </label>
                {imagePreview && <Box sx={{ mt: 2 }}><img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} /></Box>}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Categories (comma separated)" name="category" value={formData.category} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Ingredients</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField size="small" placeholder="Ingredient name" value={ingredientInput.name} onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })} sx={{ flex: 2 }} />
                <TextField size="small" placeholder="Quantity" value={ingredientInput.quantity} onChange={(e) => setIngredientInput({ ...ingredientInput, quantity: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" placeholder="Unit" value={ingredientInput.unit} onChange={(e) => setIngredientInput({ ...ingredientInput, unit: e.target.value })} sx={{ flex: 1 }} />
                <Button variant="contained" onClick={handleAddIngredient}>Add</Button>
              </Box>
              {formData.ingredients.map((ing, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">{ing.quantity} {ing.unit} {ing.name}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveIngredient(idx)}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Instructions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField fullWidth size="small" placeholder="Instruction step" value={instructionInput} onChange={(e) => setInstructionInput(e.target.value)} />
                <Button variant="contained" onClick={handleAddInstruction}>Add</Button>
              </Box>
              {formData.instructions.map((inst, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2"><strong>Step {inst.step}:</strong> {inst.text}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveInstruction(idx)}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">{recipe ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecipeFormDialog;