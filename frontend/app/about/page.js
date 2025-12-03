'use client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.2 } }
    };

    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
            <Navbar />

            <div className="flex-1 w-full">
                {/* Hero Section */}
                <section className="relative py-20 px-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400 rounded-full blur-3xl"></div>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="relative z-10 max-w-4xl mx-auto text-center"
                    >
                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-6xl font-extrabold text-orange-600 dark:text-orange-500 mb-6"
                        >
                            About TastyHub
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
                        >
                            Connecting food lovers, home cooks, and culinary enthusiasts from around the world.
                        </motion.p>
                    </motion.div>
                </section>

                {/* Mission Section */}
                <section className="py-16 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Our Mission</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                                At TastyHub, we believe that cooking is more than just preparing food—it&apos;s an expression of creativity, culture, and love. Our mission is to build a platform where anyone can discover new flavors, share their family secrets, and find inspiration for their next meal.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Whether you&apos;re a professional chef or just starting out in the kitchen, TastyHub provides the tools and community you need to grow your culinary journey.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative h-80 rounded-2xl overflow-hidden shadow-2xl bg-orange-100 dark:bg-gray-700 flex items-center justify-center"
                        >
                            <span className="text-9xl">🍳</span>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-16"
                        >
                            Why Join Us?
                        </motion.h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: "🌍", title: "Global Community", desc: "Connect with cooks from diverse cultures and backgrounds." },
                                { icon: "📖", title: "Recipe Collection", desc: "Save, organize, and share your favorite recipes easily." },
                                { icon: "💬", title: "Engage & Review", desc: "Rate recipes, leave tips, and discuss cooking techniques." }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-orange-100 dark:border-gray-700"
                                >
                                    <div className="text-5xl mb-6">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-6 bg-orange-500 text-white text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl font-bold mb-6">Ready to Start Cooking?</h2>
                        <p className="text-xl mb-10 opacity-90">Join thousands of foodies sharing their passion today.</p>
                        <Link href="/register">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition-colors"
                            >
                                Create an Account
                            </motion.button>
                        </Link>
                    </motion.div>
                </section>
            </div>

            <Footer />
        </main>
    );
}
