"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for token in URL (from Google Auth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userData = params.get('user');
    const errorMsg = params.get('error');

    if (errorMsg) {
      setError('Google authentication failed. Please try again.');
      router.replace('/login'); // Clear URL params
    } else if (token && userData) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userData); // userData is already a JSON string from backend
        router.push('/');
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Login failed');
      }
    }
  }, [router]);

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth endpoint
    window.location.href = `${api.API_BASE_URL || 'http://localhost:5000'}/api/users/auth/google`;
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
          Login to TastyHub
        </h2>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          aria-describedby={error ? "login-error" : undefined}
        >
          {/* Email field: label is linked to input via htmlFor/id */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
          </div>

          {/* Password field: label is linked to input via htmlFor/id */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-black">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
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
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          {error && (
            <p id="login-error" role="alert" className="text-sm text-red-600 mt-2">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <a className="text-orange-600 font-medium hover:underline" href="/register">
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
