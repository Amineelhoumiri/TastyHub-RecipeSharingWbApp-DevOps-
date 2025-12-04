'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-gray-900 text-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-9xl font-extrabold text-orange-500 opacity-20">404</h1>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md">
                        Oops! The recipe you&apos;re looking for seems to have been eaten.
                    </p>
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition-colors"
                        >
                            Return Home
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
