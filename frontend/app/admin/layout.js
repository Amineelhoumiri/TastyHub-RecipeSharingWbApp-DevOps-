'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.isAdmin) {
          setIsAdmin(true);
        } else {
          router.push('/'); // Redirect non-admins to home
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            Verifying admin privileges...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊', description: 'Overview & Stats' },
    { name: 'Users', href: '/admin/users', icon: '👥', description: 'Manage Accounts' },
    { name: 'Recipes', href: '/admin/recipes', icon: '🍲', description: 'Moderate Content' },
    // { name: 'Comments', href: '/admin/comments', icon: '💬', description: 'Review Discussions' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 gap-6 lg:gap-10">
        {/* Admin Sidebar - Desktop */}
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-28">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-2xl">🛡️</span> Admin Portal
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-9">
                Manage your platform
              </p>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-orange-50 text-orange-700 shadow-sm dark:bg-orange-900/20 dark:text-orange-400 border border-orange-100 dark:border-orange-800/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    <span
                      className={`text-2xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div className="font-semibold text-base">{item.name}</div>
                      <div
                        className={`text-xs ${isActive ? 'text-orange-600/70 dark:text-orange-400/70' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 mt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">
                  System Status
                </h3>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  Operational
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Admin Nav (Horizontal) */}
        <div className="lg:hidden w-full mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px] p-6 sm:p-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
