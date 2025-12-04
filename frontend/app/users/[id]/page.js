'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await api.getUserProfileById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        // Get all recipes and filter by userId
        const allRecipes = await api.getRecipes();
        // Filter recipes by userId if available, otherwise fallback to username
        const userRecipes = allRecipes.filter(recipe => {
          if (user?.id && recipe.userId) {
            return recipe.userId === user.id;
          }
          // Fallback to username matching
          const recipeUsername = recipe.author?.username || recipe.username || '';
          const profileUsername = user?.username || '';
          return recipeUsername.toLowerCase() === profileUsername.toLowerCase();
        });
        setRecipes(userRecipes);
      } catch (err) {
        console.error('Error fetching user recipes:', err);
      }
    };

    if (user) {
      fetchUserRecipes();
    }
  }, [user]);


  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 dark:text-orange-400 text-lg">Loading profile...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error || 'User not found'}
          </div>
          <Link href="/recipes" className="text-orange-600 dark:text-orange-400 hover:underline">
            ← Back to Recipes
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <Link href="/recipes" className="text-orange-600 dark:text-orange-400 hover:underline mb-6 inline-block">
          ← Back to Recipes
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-4xl font-bold text-orange-600 dark:text-orange-400 overflow-hidden border-4 border-orange-300 dark:border-orange-700 shadow-lg">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    const initial = parent.querySelector('.profile-initial');
                    if (initial) initial.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={`profile-initial ${user?.profilePicture ? 'hidden' : 'flex'}`}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {user.username || 'User'}
              </h1>
              {user.createdAt && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* User's Recipes */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Recipes by {user.username}
          </h2>

          {recipes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                This user hasn&apos;t shared any recipes yet.
              </p>
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
                    src={recipe.image_url || recipe.imageUrl || '/placeholder-recipe.svg'}
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
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>⭐ {
                        (() => {
                          const rating = recipe.average_rating || recipe.averageRating;
                          if (!rating && rating !== 0) return 'No ratings';
                          const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
                          return isNaN(numRating) ? 'No ratings' : numRating.toFixed(1);
                        })()
                      }</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

