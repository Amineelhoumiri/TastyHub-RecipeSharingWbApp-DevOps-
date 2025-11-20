'use client';
// Navigation bar component - appears on all pages
// Shows different options based on whether user is logged in or not

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Handle logout and redirect to home
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold text-orange-600">
        🍽️ TastyHub
      </Link>
      <ul className="flex gap-6 text-gray-700 font-medium items-center">
        <li>
          <Link href="/" className="hover:text-orange-500">
            Home
          </Link>
        </li>
        <li>
          <Link href="/recipes" className="hover:text-orange-500">
            Recipes
          </Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link href="/profile" className="hover:text-orange-500">
                Profile
              </Link>
            </li>
            <li className="text-orange-600">
              Welcome, {user?.username || user?.email}
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" className="hover:text-orange-500">
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

