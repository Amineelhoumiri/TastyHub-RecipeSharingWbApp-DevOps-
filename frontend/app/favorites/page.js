'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

export default function FavoritesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/favorites');
        return;
      }
      setIsAuthenticated(true);
      fetchFavorites();
    };
    
    checkAuth();
  }, [router]);
  
  // Refresh favorites when page becomes visible (user navigates back to this tab)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFavorites();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await api.getUserFavorites();
      setRecipes(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400">
            My Favorites ❤️
          </h1>
          <button
            onClick={fetchFavorites}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            title="Refresh favorites"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="text-orange-600 dark:text-orange-400 text-lg">Loading your favorites...</div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start exploring recipes and favorite the ones you love!
            </p>
            <Link
              href="/recipes"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition overflow-hidden block"
              >
                <img
                  src={recipe.imageUrl || recipe.image_url || '/placeholder-recipe.svg'}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {recipe.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
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

                  <div className="flex justify-between items-center">
                    {recipe.userId || recipe.author?.id ? (
                      <Link 
                        href={`/users/${recipe.userId || recipe.author?.id}`}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        By {recipe.author?.username || recipe.username || 'Unknown'}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        By {recipe.author?.username || recipe.username || 'Unknown'}
                      </span>
                    )}
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition inline-block text-sm">
                      View Recipe →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

