'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {user?.username || 'Admin'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Here's what's happening in TastyHub today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Management Card */}
                <Link
                    href="/admin/users"
                    className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            👥
                        </div>
                        <span className="text-gray-400 group-hover:text-orange-500 transition-colors">→</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">User Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        View, edit, and manage all registered users. Grant or revoke admin privileges.
                    </p>
                </Link>

                {/* Future: Content Moderation */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 opacity-75 cursor-not-allowed">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                            🚩
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">Coming Soon</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Content Moderation</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Review reported recipes and comments. Take action on inappropriate content.
                    </p>
                </div>
            </div>
        </div>
    );
}
