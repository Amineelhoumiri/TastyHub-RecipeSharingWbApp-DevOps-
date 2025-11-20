'use client';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id;
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
    // Check authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [recipeId]);

  const fetchRecipe = async () => {
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
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/recipes/${recipeId}`);
      return;
    }

    try {
      setLikeLoading(true);
      const result = await api.likeRecipe(recipeId);
      // Update recipe state with new like status
      setRecipe(prev => ({
        ...prev,
        isLiked: result.isLiked,
        total_likes: result.totalLikes
      }));
    } catch (err) {
      console.error('Error liking recipe:', err);
      alert(err.message || 'Failed to like recipe');
    } finally {
      setLikeLoading(false);
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
      const result = await api.createComment(recipeId, commentText.trim(), commentRating);
      
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
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/recipes" className="text-orange-600 hover:underline mb-6 inline-block">
          ← Back to Recipes
        </Link>

        {/* Recipe Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {recipe.image_url && (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-96 object-cover"
            />
          )}
          
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{recipe.title}</h1>
            
            {recipe.description && (
              <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>
            )}

            <div className="flex flex-wrap gap-6 text-gray-700 mb-4">
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
                <span>{(() => {
                  const rating = recipe.average_rating;
                  if (!rating && rating !== 0) return 'No ratings';
                  const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
                  return isNaN(numRating) ? 'No ratings' : numRating.toFixed(1);
                })()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    recipe.isLiked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-2xl">{recipe.isLiked ? '❤️' : '🤍'}</span>
                  <span>{recipe.total_likes || 0} likes</span>
                </button>
              </div>
            </div>

            <div className="text-gray-600">
              By <span className="font-semibold text-gray-800">{recipe.username}</span>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ingredients</h2>
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
                    <span className="text-gray-700">
                      {showQuantity && `${quantity} ${unit} `}
                      <strong>{ingredientName}</strong>
                      {ingredient.notes && (
                        <span className="text-gray-500 italic"> ({ingredient.notes})</span>
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
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Instructions</h2>
            <ol className="space-y-4">
              {recipe.steps
                .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
                .map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 text-white font-bold rounded-full">
                    {step.stepNumber || index + 1}
                  </span>
                  <p className="text-gray-700 flex-1 pt-1">
                    {step.instruction || step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Comment Form */}
        {isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Write a Review</h2>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Rating</label>
                <select
                  value={commentRating}
                  onChange={(e) => setCommentRating(parseInt(e.target.value))}
                  className="px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                  <option value={4}>4 ⭐⭐⭐⭐</option>
                  <option value={3}>3 ⭐⭐⭐</option>
                  <option value={2}>2 ⭐⭐</option>
                  <option value={1}>1 ⭐</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Your Comment</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
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
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Reviews ({recipe.reviews?.length || 0})
          </h2>
          {recipe.reviews && recipe.reviews.length > 0 ? (
            <div className="space-y-6">
              {recipe.reviews.map((review, index) => {
                const reviewUser = review.User || review.user || {};
                const username = reviewUser.username || review.username || 'Anonymous';
                const rating = review.rating;
                const comment = review.comment;
                const createdAt = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '';
                
                return (
                  <div key={review.id || index} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{username}</div>
                          {createdAt && (
                            <div className="text-sm text-gray-500">{createdAt}</div>
                          )}
                        </div>
                      </div>
                      {rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-xl">⭐</span>
                          <span className="font-semibold text-gray-800">{rating}/5</span>
                        </div>
                      )}
                    </div>
                    {comment && (
                      <p className="text-gray-700 mt-2">{comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this recipe!</p>
          )}
        </div>
      </div>
    </main>
  );
}

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold text-orange-600">
        🍽️ TastyHub
      </Link>
      <ul className="flex gap-6 text-gray-700 font-medium">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/recipes">Recipes</Link></li>
        <li><Link href="/recipes/new">Create Recipe</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/login">Login</Link></li>
      </ul>
    </nav>
  );
}


