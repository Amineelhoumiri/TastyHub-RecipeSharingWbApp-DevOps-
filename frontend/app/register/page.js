'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_BASE_URL } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for token in URL (from Google Auth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userData = params.get('user');
    const errorMsg = params.get('error');

    if (errorMsg) {
      setError('Google authentication failed. Please try again.');
      router.replace('/register'); // Clear URL params
    } else if (token && userData) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userData);
        router.push('/');
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Login failed');
      }
    }
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/users/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.register(username, email, password);

      try {
        const loginResponse = await api.login(email, password);
        if (loginResponse?.token) {
          localStorage.setItem('token', loginResponse.token);
        }
        if (loginResponse?.user) {
          localStorage.setItem('user', JSON.stringify(loginResponse.user));
        }

        if (profilePicture) {
          try {
            await api.uploadProfilePicture(profilePicture);
          } catch (uploadError) {
            console.error('Profile picture upload error:', uploadError);
          }
        }

        router.push('/');
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        router.push('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('fetch')) {
        setError('Failed to connect to server. Make sure the backend is running on port 5000.');
      } else {
        setError(err.message || 'An error occurred while registering');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">Create your account</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-900">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Choose a secure password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Profile Picture (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            disabled={loading}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </form>

        <p className="text-center text-gray-900 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
