'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/profile');
        return;
      }
      setIsAuthenticated(true);
      fetchProfile();
    };

    checkAuth();
  }, [router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await api.getUserProfile();
      setUser(userData);

      // Also check localStorage for profile picture
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed.profilePicture && !userData.profilePicture) {
            setUser({ ...userData, profilePicture: parsed.profilePicture });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 dark:text-orange-400 text-lg">Loading profile...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!isAuthenticated || error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error || 'Please login to view your profile'}
          </div>
          <Link href="/login" className="text-orange-600 dark:text-orange-400 hover:underline">
            ← Back to Login
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-8 text-center">
          My Profile
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-4xl font-bold text-orange-600 dark:text-orange-400 overflow-hidden border-4 border-orange-300 dark:border-orange-700 shadow-lg relative">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    // Hide image and show initial on error
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={`profile-initial absolute inset-0 flex items-center justify-center ${user?.profilePicture ? 'hidden' : 'flex'}`}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {user?.username || 'User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {user?.email || ''}
              </p>
              {user?.createdAt && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Edit Button */}
            <Link
              href="/settings"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/my-recipes"
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">My Recipes</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">View your recipes</div>
          </Link>

          <Link
            href="/favorites"
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">❤️</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">Favorites</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Saved recipes</div>
          </Link>

          <Link
            href="/settings"
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">Settings</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Preferences</div>
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}

