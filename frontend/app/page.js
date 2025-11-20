'use client';
// Home page - displays featured recipes from the API
// Shows the first few recipes to entice users to explore more

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from './lib/api';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured recipes when the page loads
  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  // Get the first 3 recipes to display as featured
  const fetchFeaturedRecipes = async () => {
    try {
      setLoading(true);
      const allRecipes = await api.getRecipes();
      // Get first 3 recipes
      setRecipes(Array.isArray(allRecipes) ? allRecipes.slice(0, 3) : []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-orange-600">🍽️ TastyHub</h1>
        <ul className="flex gap-6 text-gray-700 font-medium">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/recipes">Recipes</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/login">Login</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h2 className="text-5xl font-extrabold text-orange-600 mb-4">
          Share & Discover Amazing Recipes
        </h2>
        <p className="text-gray-700 text-lg max-w-2xl mb-8">
          Welcome to TastyHub — the home for food lovers. Explore delicious recipes, share your creations, and connect with a community of passionate cooks.
        </p>
        <div className="flex gap-4">
          <Link
            href="/recipes"
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
          >
            Browse Recipes
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-orange-500 text-orange-500 rounded-xl hover:bg-orange-50 transition"
          >
            Join Now
          </Link>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="px-8 py-12 bg-white">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Featured Recipes</h3>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading recipes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No recipes available yet. Be the first to share one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-orange-50 rounded-2xl p-4 shadow hover:shadow-lg transition"
              >
                <img
                  src={recipe.image_url || '/placeholder-recipe.jpg'}
                  alt={recipe.title}
                  className="rounded-xl mb-4 w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.target.src = '/placeholder-recipe.jpg';
                  }}
                />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{recipe.title}</h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {recipe.description || 'A delicious recipe waiting for you to try!'}
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="text-orange-600 font-medium hover:underline"
                  >
                    View Recipe →
                  </Link>
                  <div className="flex gap-3 text-sm text-gray-500">
                    <span>⭐ {recipe.average_rating || 0}</span>
                    <span>👤 {recipe.username || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-orange-100">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Join the TastyHub Community!</h3>
        <p className="text-gray-600 mb-6">
          Create your account to start sharing and saving your favorite recipes today.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          Sign Up Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t mt-auto">
        © 2025 TastyHub. All rights reserved.
      </footer>
    </main>
  );
}
