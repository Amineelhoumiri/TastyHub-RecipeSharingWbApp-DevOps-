'use client';
// Recipes listing page - shows all recipes with pagination
// Users can browse through all available recipes on the platform

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { recipeAPI } from '../lib/api';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12); // Show 12 recipes per page

  // Fetch recipes whenever the page changes
  useEffect(() => {
    fetchRecipes();
  }, [page]);

  // Get recipes from the API with pagination
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipeAPI.getAll(page, pageSize);
      setRecipes(data.recipes || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <Navbar />

      <div className="container mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          All Recipes
        </h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Loading recipes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={fetchRecipes}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Try Again
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">
              No recipes available yet.
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Be the first to share a recipe!
            </Link>
          </div>
        ) : (
          <>
            {/* Recipes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="bg-orange-50 rounded-2xl p-4 shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  <img
                    src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                    alt={recipe.title}
                    className="rounded-xl mb-4 w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-recipe.jpg';
                    }}
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description || 'A delicious recipe waiting for you!'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {recipe.User?.username || 'Anonymous'}</span>
                    <div className="flex gap-3">
                      <span>❤️ {recipe.likeCount || 0}</span>
                      <span>⭐ {recipe.favoriteCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t mt-auto">
        © 2025 TastyHub. All rights reserved.
      </footer>
    </main>
  );
}

