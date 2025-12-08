'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, API_BASE_URL } from "@/lib/api";

export default function CreateRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Start with loading true to check auth
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Recipe basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Ingredients - simple text input
  const [ingredientsText, setIngredientsText] = useState('');

  // Steps - simple textarea
  const [stepsText, setStepsText] = useState('');

  // Tags
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login with return URL
        router.push('/login?redirect=/recipes/new');
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Don't render form if not authenticated or still checking
  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 text-lg">Checking authentication...</div>
        </div>
      </main>
    );
  }

  // Parse ingredients text into array format for backend
  const parseIngredients = (text) => {
    if (!text || !text.trim()) return [];

    // Split by newlines and filter empty lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Convert each line to an ingredient object
    // Each line becomes an ingredient with default quantity=1 and unit='piece'
    return lines.map(line => ({
      name: line,
      quantity: 1,
      unit: 'piece',
      notes: null
    }));
  };

  // Parse steps text into array format for backend
  const parseSteps = (text) => {
    if (!text || !text.trim()) return [];

    // Split by newlines and filter empty lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Convert each line to a step object
    return lines.map((line, index) => ({
      stepNumber: index + 1,
      instruction: line
    }));
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
    setLoading(true);

    // Double-check authentication before submitting
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to create a recipe');
      setLoading(false);
      router.push('/login?redirect=/recipes/new');
      return;
    }

    try {
      // Parse ingredients and steps from text
      const parsedIngredients = parseIngredients(ingredientsText);
      const parsedSteps = parseSteps(stepsText);

      // Prepare recipe data according to backend expectations
      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        cookingTime: cookingTime ? parseInt(cookingTime) : null,
        servings: servings ? parseInt(servings) : null,
        imageUrl: imageUrl.trim() || null,
        ingredients: parsedIngredients,
        steps: parsedSteps,
        tags: tags
      };

      const result = await api.createRecipe(recipeData);

      // Redirect to the new recipe detail page
      // Backend returns { message: '...', recipe: {...} }
      if (result && result.recipe && result.recipe.id) {
        // Successfully created - redirect to recipe detail page
        router.push(`/recipes/${result.recipe.id}`);
      } else {
        console.error('Recipe ID not found in response:', result);
        setError('Recipe created successfully! Redirecting to recipes list...');
        // Fallback: redirect to recipes list after a short delay
        setTimeout(() => {
          router.push('/recipes');
        }, 2000);
      }
    } catch (err) {
      console.error('Create recipe error:', err);
      setError(err.message || 'Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-orange-600 mb-8 text-center">Create New Recipe</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {/* Basic Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Recipe Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Chocolate Chip Cookies"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Describe your recipe..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Cooking Time (minutes)</label>
                  <input
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Servings</label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Recipe Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />

                {imageUrl && (
                  <div className="mt-4 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tags</h2>

            {/* Popular Tags Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">Popular Tags</label>
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
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-500'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Add Custom Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
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
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-500 hover:text-orange-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Ingredients */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
            <div className="mb-2">
              <label className="block mb-1 font-medium text-gray-700">
                List ingredients (one per line)
              </label>
              <textarea
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Enter ingredients, one per line:&#10;2 cups flour&#10;1 cup sugar&#10;3 eggs&#10;1 tsp vanilla extract"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter each ingredient on a new line. You can include quantities and units if desired.
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
            <div className="mb-2">
              <label className="block mb-1 font-medium text-gray-700">
                List instructions (one step per line)
              </label>
              <textarea
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Enter cooking instructions, one step per line:&#10;Preheat oven to 350°F&#10;Mix dry ingredients in a bowl&#10;Add wet ingredients and stir until combined&#10;Pour into greased pan&#10;Bake for 25-30 minutes"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter each step on a new line. They will be automatically numbered.
              </p>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/recipes"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold text-orange-600">
        🍽️ TastyHub
      </Link>
      <ul className="flex gap-6 text-gray-700 font-medium">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/recipes">Recipes</Link></li>
        <li><Link href="/recipes/new">Create Recipe</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

