'use client';
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id;

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editCommentRating, setEditCommentRating] = useState(5);

  const fetchRecipe = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getRecipe(recipeId);
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError(err.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.isAdmin || false);
        setCurrentUserId(user.id || null);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, [recipeId, fetchRecipe]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    try {
      setLikeLoading(true);
      const result = await api.likeRecipe(recipeId);
      // Update recipe state with new like status
      setRecipe((prev) => ({
        ...prev,
        isLiked: result.isLiked,
        total_likes: result.totalLikes,
      }));
    } catch (err) {
      console.error('Error liking recipe:', err);
      alert(err.message || 'Failed to like recipe');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    try {
      setFavoriteLoading(true);
      const result = await api.favoriteRecipe(recipeId);
      setRecipe((prev) => ({
        ...prev,
        isFavorited: result.isFavorited,
      }));
    } catch (err) {
      console.error('Error favoriting recipe:', err);
      alert(err.message || 'Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      await api.createComment(recipeId, commentText.trim(), commentRating);

      // Refresh recipe to get updated reviews and rating
      await fetchRecipe();

      // Clear form
      setCommentText('');
      setCommentRating(5);
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAdminDeleteRecipe = async () => {
    if (
      !confirm('ADMIN ACTION: Are you sure you want to delete this recipe? This cannot be undone.')
    )
      return;
    try {
      await api.deleteRecipeAdmin(recipeId);
      alert('Recipe deleted successfully.');
      router.push('/admin/recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert(err.message || 'Failed to delete recipe');
    }
  };

  const handleAdminDeleteComment = async (commentId) => {
    if (!confirm('ADMIN ACTION: Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteCommentAdmin(commentId);
      // Refresh recipe to remove the comment
      await fetchRecipe();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err.message || 'Failed to delete comment');
    }
  };

  const handleEditComment = (review) => {
    setEditingCommentId(review.id);
    setEditCommentText(review.comment || '');
    setEditCommentRating(review.rating || 5);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
    setEditCommentRating(5);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      await api.updateComment(recipeId, commentId, editCommentText.trim(), editCommentRating);
      // Refresh recipe to show updated comment
      await fetchRecipe();
      // Clear edit state
      setEditingCommentId(null);
      setEditCommentText('');
      setEditCommentRating(5);
    } catch (err) {
      console.error('Error updating comment:', err);
      alert(err.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(recipeId, commentId);
      // Refresh recipe to remove the comment
      await fetchRecipe();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err.message || 'Failed to delete comment');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) return;
    try {
      await api.deleteRecipe(recipeId);
      alert('Recipe deleted successfully.');
      router.push('/my-recipes');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert(err.message || 'Failed to delete recipe');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 text-lg">Loading recipe...</div>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Recipe not found'}
          </div>
          <Link href="/recipes" className="text-orange-600 hover:underline">
            ← Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/recipes" className="text-orange-600 hover:underline inline-block">
            ← Back to Recipes
          </Link>
          {isAdmin && (
            <Link href="/admin/recipes" className="text-blue-600 hover:underline inline-block">
              ← Back to Admin Dashboard
            </Link>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-red-800 dark:text-red-300 font-bold flex items-center gap-2">
                <span>🛡️</span> Admin Controls
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                You are viewing this page as an administrator.
              </p>
            </div>
            <button
              onClick={handleAdminDeleteRecipe}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm font-medium"
            >
              Delete Recipe
            </button>
          </div>
        )}

        {/* Owner Controls - Show if user owns this recipe */}
        {!isAdmin && currentUserId && recipe.userId === currentUserId && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-orange-800 dark:text-orange-300 font-bold flex items-center gap-2">
                <span>✏️</span> Your Recipe
              </h3>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                You can edit or delete this recipe.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/recipes/${recipeId}/edit`}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition shadow-sm font-medium"
              >
                Edit Recipe
              </Link>
              <button
                onClick={handleDeleteRecipe}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm font-medium"
              >
                Delete Recipe
              </button>
            </div>
          </div>
        )}

        {/* Recipe Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          {recipe.image_url && (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-96 object-cover" />
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">{recipe.description}</p>
            )}

            <div className="flex flex-wrap gap-6 text-gray-700 dark:text-gray-300 mb-4">
              {recipe.cooking_time && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <span>{recipe.cooking_time} minutes</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <span>{recipe.servings} servings</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span>
                  {(() => {
                    const rating = recipe.average_rating;
                    if (!rating && rating !== 0) return 'No ratings';
                    const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
                    return isNaN(numRating) ? 'No ratings' : numRating.toFixed(1);
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${recipe.isLiked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-2xl">{recipe.isLiked ? '❤️' : '🤍'}</span>
                  <span>{recipe.total_likes || 0} likes</span>
                </button>
                <button
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${recipe.isFavorited
                      ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-2xl">{recipe.isFavorited ? '💖' : '🤍'}</span>
                  <span>{recipe.isFavorited ? 'In favorites' : 'Add to favorites'}</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/recipes?search=${encodeURIComponent(tag)}`}
                    className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/60 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="text-gray-600 dark:text-gray-400">
              By{' '}
              {recipe.userId ? (
                <Link
                  href={`/users/${recipe.userId}`}
                  className="font-semibold text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
                >
                  {recipe.username}
                </Link>
              ) : (
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {recipe.username}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => {
                const ingredientName = ingredient.ingredientName || ingredient.name || '';
                const quantity = ingredient.quantity;
                const unit = ingredient.unit;
                // If quantity is 1 and unit is 'piece', just show the name
                const showQuantity = !(quantity === 1 && unit === 'piece');

                return (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {showQuantity && `${quantity} ${unit} `}
                      <strong>{ingredientName}</strong>
                      {ingredient.notes && (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          {' '}
                          ({ingredient.notes})
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Instructions Section */}
        {recipe.steps && recipe.steps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.steps
                .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
                .map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 text-white font-bold rounded-full">
                      {step.stepNumber || index + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 flex-1 pt-1">
                      {step.instruction || step.text}
                    </p>
                  </li>
                ))}
            </ol>
          </div>
        )}

        {/* Comment Form */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Write a Review
            </h2>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Rating
                </label>
                <select
                  value={commentRating}
                  onChange={(e) => setCommentRating(parseInt(e.target.value))}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                  <option value={4}>4 ⭐⭐⭐⭐</option>
                  <option value={3}>3 ⭐⭐⭐</option>
                  <option value={2}>2 ⭐⭐</option>
                  <option value={1}>1 ⭐</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Your Comment
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Share your thoughts about this recipe..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
              >
                {submittingComment ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Reviews ({recipe.reviews?.length || 0})
          </h2>
          {recipe.reviews && recipe.reviews.length > 0 ? (
            <div className="space-y-6">
              {recipe.reviews.map((review, index) => {
                const reviewUser = review.User || review.user || {};
                const username = reviewUser.username || review.username || 'Anonymous';
                const userId = reviewUser.id || review.userId || review.user?.id || null;
                const rating = review.rating;
                const comment = review.comment;
                const createdAt = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString()
                  : '';
                const isOwnComment = currentUserId && userId === currentUserId;
                const isEditing = editingCommentId === review.id;

                return (
                  <div
                    key={review.id || index}
                    className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 relative group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {userId ? (
                          <Link
                            href={`/users/${userId}`}
                            className="flex items-center gap-3 hover:opacity-80 transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold overflow-hidden">
                              {reviewUser.profilePicture ? (
                                <img
                                  src={reviewUser.profilePicture}
                                  alt={username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                username.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400">
                                {username}
                              </div>
                              {createdAt && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {createdAt}
                                </div>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                              {username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">
                                {username}
                              </div>
                              {createdAt && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {createdAt}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {!isEditing && rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500 text-xl">⭐</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {rating}/5
                            </span>
                          </div>
                        )}
                        {isOwnComment && !isEditing && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditComment(review)}
                              className="text-blue-500 hover:text-blue-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Edit Comment"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(review.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Comment"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                        {isAdmin && !isOwnComment && (
                          <button
                            onClick={() => handleAdminDeleteComment(review.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Admin: Delete Comment"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <div className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Rating
                          </label>
                          <select
                            value={editCommentRating}
                            onChange={(e) => setEditCommentRating(parseInt(e.target.value))}
                            className="px-3 py-2 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                          >
                            <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                            <option value={4}>4 ⭐⭐⭐⭐</option>
                            <option value={3}>3 ⭐⭐⭐</option>
                            <option value={2}>2 ⭐⭐</option>
                            <option value={1}>1 ⭐</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Comment
                          </label>
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Update your comment..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateComment(review.id)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      comment && <p className="text-gray-700 dark:text-gray-300 mt-2">{comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No reviews yet. Be the first to review this recipe!
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
