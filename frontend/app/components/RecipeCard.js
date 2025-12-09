'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RecipeCard({ recipe }) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(!!recipe.isFavorited);

  useEffect(() => {
    setIsFavorited(!!recipe.isFavorited);
  }, [recipe.isFavorited]);

  const handleFavoriteToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/recipes');
      return;
    }

    // Optimistic UI update: Toggle immediately
    const previousState = isFavorited;
    setIsFavorited(!previousState);

    try {
      // Perform API call in background
      await api.favoriteRecipe(recipe.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert state on error
      setIsFavorited(previousState);
      alert(error.message || 'Failed to update favorite');
    }
  };

  const [imgSrc, setImgSrc] = useState(
    recipe.image_url || recipe.imageUrl || '/placeholder-recipe.png'
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgSrc(recipe.image_url || recipe.imageUrl || '/placeholder-recipe.png');
    setImgError(false);
  }, [recipe.image_url, recipe.imageUrl]);

  // ... handleFavoriteToggle

  return (
    <div
      onClick={() => router.push(`/recipes/${recipe.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/recipes/${recipe.id}`);
        }
      }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition overflow-hidden block cursor-pointer group h-full flex flex-col"
    >
      <div className="relative overflow-hidden h-48 w-full bg-gray-100 dark:bg-gray-700">
        {!imgError ? (
          <Image
            src={imgSrc}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={imgSrc}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-recipe.png';
            }}
          />
        )}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 ${isFavorited
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-orange-500'
            }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            className="w-5 h-5"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">
          {recipe.description || 'A delicious recipe waiting for you to try!'}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            {(() => {
              const rating = recipe.average_rating || recipe.averageRating;
              if (!rating && rating !== 0) return '0.0';
              const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
              return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
            })()}
          </span>
          {(recipe.cooking_time || recipe.cookingTime) && (
            <span className="flex items-center gap-1">
              <span>⏱️</span> {recipe.cooking_time || recipe.cookingTime}m
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
          {recipe.tags
            ?.filter((tag) => tag)
            .slice(0, 3)
            .map((tag, index) => (
              <Link
                key={index}
                href={`/recipes?search=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors z-10 relative"
              >
                {tag}
              </Link>
            ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">By</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
              {recipe.username || 'Chef'}
            </span>
          </div>
          <span className="text-sm font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
            View Recipe →
          </span>
        </div>
      </div>
    </div>
  );
}
