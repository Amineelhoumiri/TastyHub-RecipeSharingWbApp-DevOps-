'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { compressImage } from "@/lib/imageUtils";

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
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

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

  const handleSaveProfile = async (e, field) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updateData = {};
      if (field === 'username') updateData.username = username;
      if (field === 'email') updateData.email = email;

      await api.updateUserProfile(updateData);
      setSuccess(`${field === 'username' ? 'Name' : 'Email'} updated successfully!`);
      if (field === 'username') setEditingName(false);
      if (field === 'email') setEditingEmail(false);

      // Update localStorage user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (field === 'username') user.username = username;
        if (field === 'email') user.email = email;
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
      } catch {
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

      // Compress image before upload (smaller size for profile pics)
      const compressedFile = await compressImage(file, 500);

      const result = await api.uploadProfilePicture(compressedFile);

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
              <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden border-2 border-orange-200 dark:border-orange-700 relative">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`text-3xl font-bold text-orange-600 dark:text-orange-400 absolute inset-0 flex items-center justify-center ${profilePicture ? 'hidden' : 'flex'}`}>
                  {username.charAt(0).toUpperCase() || 'U'}
                </span>
                {uploadingPicture && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
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

          <div className="space-y-8">
            {/* Username Update */}
            <div className="border-b dark:border-gray-700 pb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
                  >
                    Change Name
                  </button>
                )}
              </div>

              {!editingName ? (
                <p className="text-gray-900 dark:text-gray-100 text-lg">{username}</p>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProfile(e, 'username');
                }} className="flex gap-4 animate-fade-in">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    className="flex-1 px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Your username"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            {/* Email Update */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                {!editingEmail && (
                  <button
                    onClick={() => setEditingEmail(true)}
                    className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
                  >
                    Change Email
                  </button>
                )}
              </div>

              {!editingEmail ? (
                <p className="text-gray-900 dark:text-gray-100 text-lg">{email}</p>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProfile(e, 'email');
                }} className="flex gap-4 animate-fade-in">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="flex-1 px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="your@email.com"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmail(false)}
                    className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Security</h2>
          <ChangePasswordForm />
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
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
    </main >
  );
}

function ChangePasswordForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsEditing(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="font-medium text-gray-700 dark:text-gray-300">Password</label>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
          >
            Change Password
          </button>
        )}
      </div>

      {!isEditing ? (
        <p className="text-gray-500 dark:text-gray-400">••••••••</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
          {message.text && (
            <div className={`px-4 py-3 rounded ${message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-400 dark:border-green-600'
              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-600'
              }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setMessage({ type: '', text: '' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

