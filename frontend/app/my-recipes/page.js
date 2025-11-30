'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

export default function MyRecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/my-recipes');
        return;
      }
      setIsAuthenticated(true);
      fetchRecipes();
    };

    checkAuth();
  }, [router]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await api.getUserRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteRecipe(recipeId);
      // Remove recipe from list
      setRecipes(recipes.filter(r => r.id !== recipeId));
      setError('');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError(err.message || 'Failed to delete recipe');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 dark:text-orange-400 text-lg">Checking authentication...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-6">
            My Recipes
          </h1>
          <Link
            href="/recipes/new"
            className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold shadow-lg hover:shadow-orange-500/30 flex items-center gap-2"
          >
            <span>+</span> Create New Recipe
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="text-orange-600 dark:text-orange-400 text-lg">Loading your recipes...</div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No recipes yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start sharing your favorite recipes with the community!
            </p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold"
            >
              Create Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <img
                    src={recipe.imageUrl || recipe.image_url || '/placeholder-recipe.svg'}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-5">
                  <Link href={`/recipes/${recipe.id}`}>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 hover:text-orange-600 dark:hover:text-orange-400 transition">
                      {recipe.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {recipe.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>⭐ {
                      (() => {
                        const rating = recipe.averageRating || recipe.average_rating;
                        if (!rating && rating !== 0) return 'No ratings';
                        const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
                        return isNaN(numRating) ? 'No ratings' : numRating.toFixed(1);
                      })()
                    }</span>
                    {recipe.servings && <span>👤 {recipe.servings}</span>}
                    {recipe.cookingTime && <span>⏱️ {recipe.cookingTime}min</span>}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="flex-1 text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      View
                    </Link>
                    <Link
                      href={`/recipes/${recipe.id}/edit`}
                      className="flex-1 text-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

