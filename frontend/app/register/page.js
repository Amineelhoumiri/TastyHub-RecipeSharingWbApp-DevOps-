"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.register(username, email, password);
      // Registration successful, redirect to login
      router.push('/login');
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Choose a username" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Choose a secure password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Repeat password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50">{loading ? 'Creating...' : 'Create account'}</button>
        </form>

        <p className="text-center text-gray-600 mt-4">Already have an account? <Link href="/login" className="text-orange-600 font-medium hover:underline">Login</Link></p>
      </div>
    </main>
  );
}
