"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      router.push("/recipes");
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
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
          </div>

          {/* Password field: label is linked to input via htmlFor/id */}
          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
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

          {error && (
            <p id="login-error" role="alert" className="text-sm text-red-600 mt-2">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <a className="text-orange-600 font-medium hover:underline" href="/register">
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
