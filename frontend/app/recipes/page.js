'use client';
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";

function RecipesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [recipes, setRecipes] = useState([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const fetchRecipes = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const isUntaggedFilter = searchParams.get('filter') === 'untagged';
      const isOtherFilter = searchParams.get('filter') === 'other';

      let data;
      if (isOtherFilter) {
        const allRecipes = await api.getRecipes('', '', 100);
        const allTags = allRecipes.flatMap(r => r.tags || []);
        const uniqueTags = [...new Set(allTags)].slice(0, 8);
        const defaultTags = ['Italian', 'Dessert', 'Healthy', 'Quick', 'Breakfast', 'Vegan', 'Dinner', 'Spicy'];
        const popularTags = [...new Set([...uniqueTags, ...defaultTags])].slice(0, 8);

        data = allRecipes.filter(recipe => {
          const recipeTags = recipe.tags || [];
          if (recipeTags.length === 0) return true;
          return recipeTags.some(tag => !popularTags.includes(tag));
        });
        setCurrentSearchTerm('Other Recipes');
      } else if (isUntaggedFilter) {
        const allRecipes = await api.getRecipes('', '', 100);
        data = allRecipes.filter(recipe => !recipe.tags || recipe.tags.length === 0);
        setCurrentSearchTerm('Untagged Recipes');
      } else {
        data = await api.getRecipes(searchTerm, '', 100);
      }

      // NO FILTERING - Show all recipes
      setRecipes(data);

      if (data.length === 0 && (searchTerm || isUntaggedFilter || isOtherFilter)) {
        const allData = await api.getRecipes('');
        // NO FILTERING - Show all suggestions
        setSuggestedRecipes(allData.slice(0, 6));
      } else {
        setSuggestedRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearch(query);
    setCurrentSearchTerm(query);
    fetchRecipes(query);
  }, [searchParams, fetchRecipes]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/recipes?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/recipes');
    }
  };

  const clearSearch = () => {
    setSearch('');
    router.push('/recipes');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-orange-600 dark:text-orange-400 text-lg animate-pulse">Loading recipes...</div>
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
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-semibold shadow-lg hover:shadow-orange-500/30"
        >
          + Create New Recipe
        </Link>
      </section>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10 px-4">
        <div className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Search recipes or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 text-black dark:text-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition shadow-md"
          >
            Search
          </button>
        </div>
      </form>

      {/* No Results Message */}
      {recipes.length === 0 && currentSearchTerm && (
        <div className="max-w-4xl mx-auto px-6 mb-8 text-center">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {currentSearchTerm === 'Other Recipes'
                ? 'No other recipes found (all recipes belong to popular categories).'
                : currentSearchTerm === 'Untagged Recipes'
                  ? 'No untagged recipes found.'
                  : <span>Sorry, no recipes found with this tag: <span className="text-orange-600 dark:text-orange-400">"{currentSearchTerm}"</span></span>
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              But don't worry! Here are some other delicious recipes you might like:
            </p>
            <button
              onClick={clearSearch}
              className="text-orange-500 hover:underline font-medium"
            >
              View all recipes
            </button>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 pb-20">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          /* Show suggested recipes if main list is empty */
          suggestedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
      </section>

      {recipes.length === 0 && suggestedRecipes.length === 0 && !currentSearchTerm && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-12">
          <p className="text-xl">No recipes available yet. Be the first to create one!</p>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-orange-600 text-lg">Loading...</div>
        </div>
        <Footer />
      </main>
    }>
      <RecipesContent />
    </Suspense>
  );
}