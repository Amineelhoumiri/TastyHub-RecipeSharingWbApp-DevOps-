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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Default is false (light mode)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    setIsAuthenticated(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
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

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/')
                ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
            >
              Home
            </Link>
            <Link
              href="/recipes"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/recipes')
                ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
            >
              Recipes
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/about')
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/my-recipes')
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                >
                  My Recipes
                </Link>
                <Link
                  href="/favorites"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/favorites')
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                >
                  Favorites
                </Link>
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/profile')
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/settings')
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
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden border-2 border-orange-300 dark:border-orange-700 relative">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-sm font-bold text-orange-600 dark:text-orange-400 absolute inset-0 flex items-center justify-center ${user?.profilePicture ? 'hidden' : 'flex'}`}>
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
                {/* Dark Mode Toggle */}
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
          <div className="md:hidden flex items-center gap-4">
            {/* Dark Mode Toggle (Mobile) */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 absolute top-16 left-0 right-0 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-3 px-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden border-2 border-orange-300 dark:border-orange-700 relative flex-shrink-0">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-sm font-bold text-orange-600 dark:text-orange-400 absolute inset-0 flex items-center justify-center ${user?.profilePicture ? 'hidden' : 'flex'}`}>
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user?.username || 'User'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Logged in
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              </>
            )}

            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/')
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>🏠</span> Home
            </Link>
            <Link
              href="/recipes"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/recipes')
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>📖</span> Recipes
            </Link>
            <Link
              href="/about"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/about')
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>ℹ️</span> About
            </Link>

            {isAuthenticated ? (
              <>
                <div className="space-y-1 mt-2">
                  <Link
                    href="/my-recipes"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/my-recipes')
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>👨‍🍳</span> My Recipes
                  </Link>
                  <Link
                    href="/favorites"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/favorites')
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>❤️</span> Favorites
                  </Link>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/profile')
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>👤</span> Profile
                  </Link>
                  <Link
                    href="/settings"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition ${isActive('/settings')
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>⚙️</span> Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 rounded-lg text-base font-medium text-center text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-3 rounded-lg text-base font-medium text-center text-white bg-orange-500 hover:bg-orange-600 shadow-md transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}


// End of Navbar component
