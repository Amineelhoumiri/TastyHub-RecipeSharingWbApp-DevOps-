import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HubbyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <div className="flex-1 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-10 md:p-16 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-orange-100 dark:bg-orange-900/40 mb-8 sm:mb-10 shadow-inner">
                                <span className="text-5xl sm:text-7xl animate-bounce">🤖</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
                                Meet <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Hubby</span>
                            </h1>

                            <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-8">
                                Coming Soon
                            </div>

                            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Your personal AI culinary assistant is almost here! Hubby will be able to recommend the perfect recipes based on <span className="font-semibold text-gray-800 dark:text-gray-100">your unique taste</span> or whatever ingredients you currently have <span className="font-semibold text-gray-800 dark:text-gray-100">in your fridge</span>.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                                <div className="bg-gray-50 dark:bg-gray-800/80 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-4">🧠</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Taste Profiling</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Hubby learns your flavor preferences over time.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/80 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-4">🧊</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Fridge Scan</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Tell Hubby what you have, get instant meal ideas.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/80 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-4">⚡</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quick & Easy</h3>
                                    <p className="text-gray-600 dark:text-gray-400">No more staring at the pantry not knowing what to cook.</p>
                                </div>
                            </div>

                            <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-full hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
