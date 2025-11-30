'use client';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { compressImage } from "@/lib/imageUtils";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Recipe data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'upload'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [ingredientsText, setIngredientsText] = useState('');
  const [steps, setSteps] = useState([{ instruction: '' }]);

  // Tags
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');



  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      // Compress image before upload
      const compressedFile = await compressImage(file);

      const result = await api.uploadRecipeImage(compressedFile);
      setImageUrl(result.imageUrl);

    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=/recipes/${recipeId}/edit`);
        return;
      }
      setIsAuthenticated(true);
      fetchRecipe();
    };

    if (recipeId) {
      checkAuth();
    }
  }, [recipeId, router]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const recipe = await api.getRecipe(recipeId);

      // Populate form fields
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setCookingTime(recipe.cooking_time?.toString() || '');
      setServings(recipe.servings?.toString() || '');
      setImageUrl(recipe.image_url || '');
      setIsPrivate(recipe.isPrivate || recipe.is_private || false);

      // Convert ingredients to text
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const ingredientsText = recipe.ingredients
          .map(ing => {
            const name = ing.ingredientName || ing.name || '';
            const qty = ing.quantity;
            const unit = ing.unit;
            if (qty === 1 && unit === 'piece') {
              return name;
            }
            return `${qty} ${unit} ${name}`;
          })
          .join('\n');
        setIngredientsText(ingredientsText);
      }

      // Set steps
      if (recipe.steps && recipe.steps.length > 0) {
        setSteps(recipe.steps
          .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
          .map(step => ({ instruction: step.instruction || step.text || '' })));
      }

      // Set tags
      if (recipe.tags && Array.isArray(recipe.tags)) {
        setTags(recipe.tags);
      }
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const parseIngredients = (text) => {
    if (!text || !text.trim()) return [];

    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines.map(line => ({
      name: line,
      quantity: 1,
      unit: 'piece',
      notes: null
    }));
  };

  const addStep = () => {
    setSteps([...steps, { instruction: '' }]);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index].instruction = value;
    setSteps(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to edit recipes');
      setSaving(false);
      router.push(`/login?redirect=/recipes/${recipeId}/edit`);
      return;
    }

    try {
      const parsedIngredients = parseIngredients(ingredientsText);

      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        cookingTime: cookingTime ? parseInt(cookingTime) : null,
        servings: servings ? parseInt(servings) : null,
        imageUrl: imageUrl.trim() || null,
        isPrivate: isPrivate,
        tags: tags
      };

      await api.updateRecipe(recipeId, recipeData);

      // Success - redirect to recipe detail page
      router.push(`/recipes/${recipeId}`);
    } catch (err) {
      console.error('Update recipe error:', err);
      setError(err.message || 'Failed to update recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 dark:text-orange-400 text-lg">
            {loading ? 'Loading recipe...' : 'Checking authentication...'}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <Link href={`/recipes/${recipeId}`} className="text-orange-600 dark:text-orange-400 hover:underline mb-6 inline-block">
          ← Back to Recipe
        </Link>

        <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-8 text-center">
          Edit Recipe
        </h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* Basic Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Recipe Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Chocolate Chip Cookies"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Describe your recipe..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Cooking Time (minutes)</label>
                  <input
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Servings</label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Recipe Image</label>

                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${imageMode === 'url'
                      ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${imageMode === 'upload'
                      ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    Upload Image
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-orange-400 dark:hover:border-orange-500 transition bg-gray-50 dark:bg-gray-700/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="recipe-image-upload"
                    />
                    <label htmlFor="recipe-image-upload" className="cursor-pointer block">
                      {uploadingImage ? (
                        <div className="text-orange-600 dark:text-orange-400 font-medium">Uploading...</div>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload image</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG, GIF up to 5MB</div>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {imageUrl && (
                  <div className="mt-4 relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="isPrivate" className="font-medium text-gray-700 dark:text-gray-300">
                  Make this recipe private (only visible to you)
                </label>
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Tags</h2>

            {/* Popular Tags Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Popular Tags</label>
              <div className="flex flex-wrap gap-2">
                {['Italian', 'Dessert', 'Healthy', 'Quick', 'Breakfast', 'Vegan', 'Dinner', 'Spicy'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(tag)) {
                        setTags([...tags, tag]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition ${tags.includes(tag)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-orange-500 hover:text-orange-500'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Add Custom Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Gluten-Free (Press Enter to add)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-500 hover:text-orange-900 dark:hover:text-orange-200 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Note about ingredients and steps */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Currently, you can only edit basic information. Full ingredient and step editing will be available soon.
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/recipes/${recipeId}`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}


