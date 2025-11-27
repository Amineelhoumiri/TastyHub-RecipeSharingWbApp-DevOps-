// app/recipes/page.js
'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async (searchTerm = '') => {
    try {
      const data = await api.getRecipes(searchTerm);
      setRecipes(data);
    } catch (error) {
      // Error fetching recipes - handle silently or show user-friendly message
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(search);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-orange-600 dark:text-orange-400 text-lg">Loading recipes...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Header */}
      <section className="text-center py-16 px-6">
        <h2 className="text-4xl font-extrabold text-orange-600 dark:text-orange-400 mb-3">
          Discover Delicious Recipes
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-6">
          Browse a variety of dishes shared by food lovers across the world.
        </p>
        <Link
          href="/recipes/new"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold"
        >
          + Create New Recipe
        </Link>
      </section>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-black dark:text-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Recipe Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 pb-20">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>

      {recipes.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-8">
          No recipes found. Try a different search term.
        </div>
      )}

      <Footer />
    </main>
  );
}

function RecipeCard({ recipe }) {
  return (
    <Link 
      href={`/recipes/${recipe.id}`}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition overflow-hidden block cursor-pointer"
    >
      <img
        src={recipe.image_url || '/placeholder-recipe.jpg'}
        alt={recipe.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>⭐ {
            (() => {
              const rating = recipe.average_rating;
              if (!rating && rating !== 0) return 'No ratings';
              const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
              return isNaN(numRating) ? 'No ratings' : numRating.toFixed(1);
            })()
          }</span>
          {recipe.servings && <span>👤 {recipe.servings} servings</span>}
          {recipe.cooking_time && <span>⏱️ {recipe.cooking_time}min</span>}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.tags?.filter(tag => tag).map((tag, index) => (
            <span
              key={index}
              className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          {recipe.userId ? (
            <Link 
              href={`/users/${recipe.userId}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              By {recipe.username}
            </Link>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">By {recipe.username}</span>
          )}
          <span className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition inline-block">
            View Recipe →
          </span>
        </div>
      </div>
    </Link>
  );
}