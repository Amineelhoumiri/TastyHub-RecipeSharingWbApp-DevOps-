'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);

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

    if (token) {
      loadUserProfile();
    }

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const loadUserProfile = async () => {
    try {
      const userData = await api.getUserProfile();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* Increased height to h-20 */}
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🍳</span> {/* Increased icon size */}
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent dark:from-orange-400 dark:to-orange-300">
              TastyHub
            </span> {/* Increased text size */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink href="/" active={isActive('/')}>Home</NavLink>
            <NavLink href="/recipes" active={isActive('/recipes')}>Recipes</NavLink>
            {isAuthenticated && (
              <NavLink href="/favorites" active={isActive('/favorites')}>Favorites</NavLink>
            )}
            <NavLink href="/about" active={isActive('/about')}>About</NavLink>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center overflow-hidden border border-orange-200 dark:border-orange-700">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="text-base font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                    {user?.username || 'User'}
                  </span>
                  <span className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Signed in as</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
                    </div>

                    {user?.isAdmin && (
                      <DropdownLink href="/admin" icon="🛡️">Admin Dashboard</DropdownLink>
                    )}
                    <DropdownLink href="/my-recipes" icon="👨‍🍳">My Recipes</DropdownLink>
                    {/* Favorites removed from dropdown as it's now in main nav */}
                    <DropdownLink href="/profile" icon="👤">Profile</DropdownLink>
                    <DropdownLink href="/settings" icon="⚙️">Settings</DropdownLink>

                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2.5 text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors font-medium"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-base font-medium rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 absolute top-20 left-0 right-0 shadow-xl min-h-screen animate-in slide-in-from-top-5 duration-200">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <MobileNavLink href="/" active={isActive('/')} icon="🏠">Home</MobileNavLink>
              <MobileNavLink href="/recipes" active={isActive('/recipes')} icon="📖">Recipes</MobileNavLink>
              {isAuthenticated && (
                <MobileNavLink href="/favorites" active={isActive('/favorites')} icon="❤️">Favorites</MobileNavLink>
              )}
              <MobileNavLink href="/about" active={isActive('/about')} icon="ℹ️">About</MobileNavLink>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center border border-orange-200 dark:border-orange-700">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{user?.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">{user?.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Logged in</p>
                    </div>
                  </div>

                  {user?.isAdmin && <MobileNavLink href="/admin" active={isActive('/admin')} icon="🛡️">Admin</MobileNavLink>}
                  <MobileNavLink href="/my-recipes" active={isActive('/my-recipes')} icon="👨‍🍳">My Recipes</MobileNavLink>
                  {/* Favorites is already in top section for mobile too, but can be here as well if preferred. Keeping it in top section for consistency. */}
                  <MobileNavLink href="/profile" active={isActive('/profile')} icon="👤">Profile</MobileNavLink>
                  <MobileNavLink href="/settings" active={isActive('/settings')} icon="⚙️">Settings</MobileNavLink>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium text-lg"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/login"
                    className="flex justify-center items-center px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="flex justify-center items-center px-4 py-3 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-colors text-lg"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Helper Components
function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-200 ${active
          ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
          : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
    >
      {children}
    </Link>
  );
}

function DropdownLink({ href, icon, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-2.5 text-base text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, icon, children }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-colors ${active
          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
    >
      <span className="text-xl">{icon}</span>
      {children}
    </Link>
  );
}
