'use client';
// Recipe detail page - shows full recipe information
// Users can view ingredients, steps, comments, and interact with the recipe

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { recipeAPI, commentAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch recipe details when component loads
  useEffect(() => {
    if (params.id) {
      fetchRecipe();
    }
  }, [params.id]);

  // Get the full recipe details from the API
  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipeAPI.getById(params.id);
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError('Recipe not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  // Handle liking a recipe
  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await recipeAPI.like(params.id);
      // Refresh recipe to get updated like count
      fetchRecipe();
    } catch (err) {
      console.error('Error liking recipe:', err);
    }
  };

  // Handle favoriting a recipe
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await recipeAPI.favorite(params.id);
      // Refresh recipe to get updated favorite count
      fetchRecipe();
    } catch (err) {
      console.error('Error favoriting recipe:', err);
    }
  };

  // Handle submitting a comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      await recipeAPI.addComment(params.id, {
        text: commentText,
        rating: commentRating,
      });
      setCommentText('');
      setCommentRating(5);
      // Refresh recipe to show new comment
      fetchRecipe();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle deleting a comment (only if user owns it)
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.delete(commentId);
      // Refresh recipe to remove deleted comment
      fetchRecipe();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading recipe...</p>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'Recipe not found'}</p>
            <Link
              href="/recipes"
              className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Back to Recipes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = user && recipe.User && user.id === recipe.User.id;
  const isLiked = recipe.isLiked || false;
  const isFavorited = recipe.isFavorited || false;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <Navbar />

      <div className="container mx-auto px-8 py-12 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/recipes"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          ← Back to Recipes
        </Link>

        {/* Recipe Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{recipe.title}</h1>
            <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>

            {/* Recipe Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2 text-gray-600">
                <span>👤</span>
                <span>By {recipe.User?.username || 'Anonymous'}</span>
              </div>
              {recipe.prepTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⏱️</span>
                  <span>Prep: {recipe.prepTime} min</span>
                </div>
              )}
              {recipe.cookTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🔥</span>
                  <span>Cook: {recipe.cookTime} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🍽️</span>
                  <span>Serves: {recipe.servings}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleLike}
                className={`px-6 py-2 rounded-lg transition ${
                  isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!isAuthenticated}
              >
                ❤️ Like ({recipe.likeCount || 0})
              </button>
              <button
                onClick={handleFavorite}
                className={`px-6 py-2 rounded-lg transition ${
                  isFavorited
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!isAuthenticated}
              >
                ⭐ Favorite ({recipe.favoriteCount || 0})
              </button>
              {isOwner && (
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Edit Recipe
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        {recipe.RecipeIngredients && recipe.RecipeIngredients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.RecipeIngredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps Section */}
        {recipe.RecipeSteps && recipe.RecipeSteps.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructions</h2>
            <ol className="space-y-6">
              {recipe.RecipeSteps.map((step, index) => (
                <li key={step.id || index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 flex-1">{step.instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tags Section */}
        {recipe.RecipeTags && recipe.RecipeTags.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.RecipeTags.map((tagRelation) => (
                <span
                  key={tagRelation.Tag?.id}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {tagRelation.Tag?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Comments ({recipe.Reviews?.length || 0})
          </h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8 pb-8 border-b">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Comment
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  rows="4"
                  placeholder="Share your thoughts about this recipe..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={commentRating}
                  onChange={(e) => setCommentRating(parseInt(e.target.value))}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 pb-8 border-b text-center">
              <p className="text-gray-600 mb-4">
                Please{' '}
                <Link href="/login" className="text-orange-600 hover:underline">
                  sign in
                </Link>{' '}
                to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          {recipe.Reviews && recipe.Reviews.length > 0 ? (
            <div className="space-y-6">
              {recipe.Reviews.map((review) => {
                const canDelete = user && review.User && user.id === review.User.id;
                return (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.User?.username || 'Anonymous'}
                        </p>
                        {review.rating && (
                          <p className="text-sm text-gray-600">
                            ⭐ {review.rating}/5
                          </p>
                        )}
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(review.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                    {review.createdAt && (
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </div>

      <footer className="text-center py-6 text-gray-500 text-sm border-t mt-auto">
        © 2025 TastyHub. All rights reserved.
      </footer>
    </main>
  );
}

