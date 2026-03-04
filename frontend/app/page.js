'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api'; // Import API directly
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecipeCard from '@/components/RecipeCard';

export default function Home() {
  // Local state management instead of Zustand
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([
    'Italian',
    'Dessert',
    'Healthy',
    'Quick',
    'Breakfast',
    'Vegan',
    'Dinner',
    'Spicy',
    'Asian',
    'Mexican',
    'Vegetarian',
    'Seafood',
    'Baking',
    'Soup',
    'Salad',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch featured recipes and tags when the page loads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Use a static list of popular categories for instant rendering and reliability
      const STATIC_TAGS = [
        'Italian',
        'Dessert',
        'Healthy',
        'Quick',
        'Breakfast',
        'Vegan',
        'Dinner',
        'Spicy',
        'Asian',
        'Mexican',
        'Vegetarian',
        'Seafood',
        'Baking',
        'Soup',
        'Salad',
      ];
      setTags(STATIC_TAGS);

      try {
        // Fetch more recipes to allow for filtering (increased to 100 to find older real recipes)
        const allRecipes = await api.getRecipes('', '', 100);

        if (Array.isArray(allRecipes)) {
          // NO FILTERING - Show all recipes
          const featured = allRecipes.slice(0, 6);
          setRecipes(featured);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (typeof window !== 'undefined') {
      setIsAuthenticated(!!localStorage.getItem('token'));
    }
  }, []);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <main className="min-h-screen flex flex-col relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-32 px-6 overflow-hidden">
          {/* Floating Background Elements */}
          <div className="absolute top-20 left-10 w-24 h-24 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-4xl mx-auto"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-extrabold text-orange-600 dark:text-orange-400 mb-6 drop-shadow-sm"
            >
              Share & Discover{' '}
              <span className="text-orange-600 dark:text-orange-500">Amazing Recipes</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-gray-700 dark:text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium"
            >
              Welcome to TastyHub — the home for food lovers. Explore delicious recipes, share your
              creations, and connect with a community of passionate cooks.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex gap-4 flex-wrap justify-center">
              <Link href="/recipes">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-orange-500/30 transition-shadow"
                >
                  Browse Recipes
                </motion.button>
              </Link>
              {!isAuthenticated ? (
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255, 1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/80 border-2 border-orange-500 text-orange-600 text-lg font-semibold rounded-full shadow-lg transition-colors"
                  >
                    Join Now
                  </motion.button>
                </Link>
              ) : (
                <Link href="/recipes/new">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255, 1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/80 border-2 border-orange-500 text-orange-600 text-lg font-semibold rounded-full shadow-lg transition-colors"
                  >
                    Create Recipe
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* Popular Tags */}
        <section className="px-8 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-6xl mx-auto text-center"
          >
            <motion.h3
              variants={fadeInUp}
              className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6"
            >
              Popular Categories
            </motion.h3>
            <div className="flex flex-wrap justify-center gap-4">
              {tags.map((tag) => (
                <Link key={tag} href={`/recipes?search=${encodeURIComponent(tag)}`}>
                  <motion.div
                    variants={scaleIn}
                    whileHover={{
                      y: -5,
                      scale: 1.05,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    {tag}
                  </motion.div>
                </Link>
              ))}
              <Link href="/recipes?filter=other">
                <motion.div
                  variants={scaleIn}
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-orange-100/80 dark:bg-orange-900/40 backdrop-blur-sm text-orange-700 dark:text-orange-300 rounded-full shadow-sm border border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/60 font-medium transition-colors cursor-pointer"
                >
                  Other...
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Featured Recipes */}
        <section className="px-8 py-12">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h3
              variants={fadeInUp}
              className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8"
            >
              Featured Recipes
            </motion.h3>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading recipes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No recipes available yet. Be the first to share one!
                </p>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
              >
                {recipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    variants={fadeInUp}
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <RecipeCard recipe={recipe} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div variants={fadeInUp} className="text-center mt-12">
              <Link href="/recipes">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-orange-600 dark:text-orange-400 font-semibold rounded-full border-2 border-orange-100 dark:border-orange-900 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-colors"
                >
                  View All Recipes <span>→</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Call to Action */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center py-16 bg-orange-100/80 dark:bg-gray-900/80 backdrop-blur-sm mx-6 rounded-3xl mb-12 shadow-inner"
        >
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {isAuthenticated ? 'Share Your Culinary Masterpieces!' : 'Join the TastyHub Community!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isAuthenticated
              ? 'Inspire others by sharing your favorite recipes with the world.'
              : 'Create your account to start sharing and saving your favorite recipes today.'}
          </p>
          {!isAuthenticated ? (
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-3 bg-orange-500 text-white rounded-xl shadow-lg"
              >
                Sign Up Now
              </motion.button>
            </Link>
          ) : (
            <Link href="/recipes/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-3 bg-orange-500 text-white rounded-xl shadow-lg"
              >
                Share a Recipe
              </motion.button>
            </Link>
          )}
        </motion.section>
      </div>
      <Footer />
    </main>
  );
}
