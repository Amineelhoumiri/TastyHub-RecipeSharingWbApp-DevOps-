'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Default is false (light mode)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setIsAuthenticated(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Load user profile if authenticated
    if (token) {
      loadUserProfile();
    }

    // Check dark mode preference - only from localStorage (user's explicit choice)
    // Default is FALSE (light mode) - only activate if user explicitly enabled it
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    // Only apply dark mode if user explicitly enabled it, otherwise ensure light mode
    if (savedDarkMode) {
      applyDarkMode(true);
    } else {
      applyDarkMode(false); // Explicitly set light mode
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await api.getUserProfile();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const applyDarkMode = (enabled) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyDarkMode(newDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              🍳 TastyHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/')
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Home
            </Link>
            <Link
              href="/recipes"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/recipes')
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Recipes
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/about')
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              About
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/my-recipes"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/my-recipes')
                      ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                      : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  My Recipes
                </Link>
                <Link
                  href="/favorites"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/favorites')
                      ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                      : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  Favorites
                </Link>
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/profile')
                      ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                      : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/settings')
                      ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                      : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  Settings
                </Link>
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>

                {/* Profile Picture / User Menu */}
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden border-2 border-orange-300 dark:border-orange-700">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-sm font-bold text-orange-600 dark:text-orange-400 ${user?.profilePicture ? 'hidden' : 'flex'}`}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.username || 'User'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Toggle - available even when not logged in */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              onClick={() => {
                // Simple mobile menu toggle - can be enhanced
                alert('Mobile menu - navigate using links above');
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

