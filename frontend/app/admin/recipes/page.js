'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function RecipeManagementPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const data = await api.getAllRecipesAdmin();
            setRecipes(data.recipes || []);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError('Failed to load recipes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecipe = async (recipeId, title) => {
        if (!confirm(`Are you sure you want to delete recipe "${title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setActionLoading(recipeId);
            await api.deleteRecipeAdmin(recipeId);
            setRecipes(recipes.filter(r => r.id !== recipeId));
        } catch (err) {
            console.error('Error deleting recipe:', err);
            alert(err.message || 'Failed to delete recipe');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage recipes: View details or delete content.
                    </p>
                </div>
                <button
                    onClick={fetchRecipes}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <span>🔄</span> Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Recipe
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Author
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {recipes.map((recipe) => (
                                <tr key={recipe.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                {recipe.imageUrl || recipe.image_url ? (
                                                    <img className="h-full w-full object-cover" src={recipe.imageUrl || recipe.image_url} alt="" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xl">🍲</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                                    <Link href={`/recipes/${recipe.id}`} className="hover:underline hover:text-orange-600">
                                                        {recipe.title}
                                                    </Link>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                    {recipe.description || 'No description'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {recipe.User?.username || recipe.username || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                                            <span>⭐ {(parseFloat(recipe.averageRating || recipe.average_rating || 0) || 0).toFixed(1)}</span>
                                            <span>⏱️ {recipe.cookingTime || recipe.cooking_time || 0}m</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/recipes/${recipe.id}`}
                                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition flex items-center gap-1"
                                            >
                                                <span>👀</span> View
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                                                disabled={actionLoading === recipe.id}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <span>🗑️</span> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {recipes.length === 0 && !loading && (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 text-5xl mb-4">🍲</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No recipes found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">The platform is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
