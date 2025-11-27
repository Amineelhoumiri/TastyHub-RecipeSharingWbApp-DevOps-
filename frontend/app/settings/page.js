'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState('metric');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/settings');
        return;
      }
      setIsAuthenticated(true);
      loadSettings();
    };
    
    checkAuth();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const user = await api.getUserProfile();
      setUsername(user.username || '');
      setEmail(user.email || '');
      setProfilePicture(user.profilePicture || user.profile_picture || '');
      
      // Load preferences from localStorage (will sync with backend later)
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedUnits = localStorage.getItem('units') || 'metric';
      
      setDarkMode(savedDarkMode);
      setUnits(savedUnits);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.updateUserProfile({ username, email });
      setSuccess('Profile updated successfully!');
      
      // Update localStorage user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.username = username;
        user.email = email;
        if (profilePicture) {
          user.profilePicture = profilePicture;
        }
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      // Save to localStorage first for immediate effect
      localStorage.setItem('darkMode', darkMode.toString());
      localStorage.setItem('units', units);
      
      // Apply dark mode immediately - ensure light mode by default
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        // Explicitly remove dark class to ensure light mode
        document.documentElement.classList.remove('dark');
      }
      
      // Try to sync with backend if endpoint exists
      try {
        // Check if updateUserPreferences exists in api
        if (api.updateUserPreferences) {
          await api.updateUserPreferences({ darkMode, units });
        }
      } catch (err) {
        // Backend sync is optional - preferences are saved locally
        console.log('Preferences saved locally. Backend sync not available.');
      }
      
      setSuccess('Preferences saved!');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPicture(true);
      setError('');
      const result = await api.uploadProfilePicture(file);
      
      // Update profile picture URL
      const newPictureUrl = result.profilePicture || result.profile_picture || result.url;
      setProfilePicture(newPictureUrl);
      
      // Update localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.profilePicture = newPictureUrl;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setSuccess('Profile picture uploaded successfully!');
      
      // Reload user profile to get updated picture
      try {
        const updatedUser = await api.getUserProfile();
        setUser(updatedUser);
        setProfilePicture(updatedUser.profilePicture || updatedUser.profile_picture || newPictureUrl);
        
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.profilePicture = updatedUser.profilePicture || updatedUser.profile_picture || newPictureUrl;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (profileErr) {
        console.error('Error reloading profile:', profileErr);
        // Continue anyway - picture is uploaded
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      // Show user-friendly error message
      if (err.message.includes('not yet implemented')) {
        setError('Profile picture upload is not yet available. This feature is coming soon!');
      } else {
        setError(err.message || 'Failed to upload profile picture. Please try again.');
      }
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-orange-600 dark:text-orange-400 text-lg">
            {loading ? 'Loading settings...' : 'Checking authentication...'}
          </div>
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
          Settings
        </h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Profile Settings</h2>
          
          {/* Profile Picture Upload */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {username.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition inline-block">
                    {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadingPicture}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Your username"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Preferences</h2>
          
          <div className="space-y-6">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dark Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Units */}
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                Measurement Units
              </label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="metric">Metric (grams, liters, Celsius)</option>
                <option value="imperial">Imperial (ounces, cups, Fahrenheit)</option>
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred measurement system
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              <strong>Note:</strong> Preferences are currently saved locally. Backend sync will be available soon.
            </div>

            <button
              onClick={handleSavePreferences}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              View Profile
            </Link>
            <Link
              href="/my-recipes"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              My Recipes
            </Link>
            <Link
              href="/favorites"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Favorites
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

