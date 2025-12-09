'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-extrabold text-orange-600 dark:text-orange-400 mb-6"
          >
            About TastyHub
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            Your ultimate destination for discovering, sharing, and celebrating delicious recipes
            from around the world.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              At TastyHub, we believe that food brings people together. Our mission is to create a
              vibrant community where food enthusiasts can share their culinary creations, discover
              new flavors, and connect with fellow cooking lovers from all corners of the globe.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Whether you're a professional chef, a home cook, or someone just starting their
              culinary journey, TastyHub is your platform to inspire and be inspired.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-orange-50/50 dark:bg-gray-900/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            What Makes Us Special
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="👨‍🍳"
              title="Share Your Recipes"
              description="Upload your favorite recipes with photos, ingredients, and step-by-step instructions. Help others recreate your culinary masterpieces."
            />
            <FeatureCard
              icon="🔍"
              title="Discover New Dishes"
              description="Explore thousands of recipes from various cuisines. Filter by tags, ingredients, or dietary preferences to find exactly what you're craving."
            />
            <FeatureCard
              icon="❤️"
              title="Save Favorites"
              description="Bookmark your favorite recipes for easy access. Build your personal cookbook and never lose track of dishes you love."
            />
            <FeatureCard
              icon="💬"
              title="Community Engagement"
              description="Rate recipes, leave comments, and share tips with other food lovers. Learn from each other's experiences."
            />
            <FeatureCard
              icon="📱"
              title="Mobile Friendly"
              description="Access TastyHub from any device. Cook along with recipes on your phone or tablet right in the kitchen."
            />
            <FeatureCard
              icon="🌙"
              title="Dark Mode"
              description="Easy on the eyes with our beautiful dark mode. Perfect for late-night recipe browsing and meal planning."
            />
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Our Values
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <ValueCard
              title="Community First"
              description="We prioritize building a supportive and inclusive community where everyone feels welcome to share their culinary passion."
            />
            <ValueCard
              title="Quality Content"
              description="We encourage detailed, well-crafted recipes that help users successfully recreate dishes at home."
            />
            <ValueCard
              title="Authenticity"
              description="We celebrate authentic recipes from diverse cultures and encourage users to share their genuine culinary heritage."
            />
            <ValueCard
              title="Continuous Improvement"
              description="We're constantly evolving based on user feedback to provide the best recipe-sharing experience possible."
            />
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-20 px-6 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Community Today
          </h2>
          <p className="text-xl text-orange-50 mb-8">
            Start sharing your recipes and discovering amazing dishes from food lovers worldwide.
          </p>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-orange-600 text-lg font-bold rounded-full shadow-2xl hover:shadow-white/20 transition-all"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
}

function FeatureCard({ icon, title, description }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ValueCard({ title, description }) {
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-orange-50 dark:bg-gray-800 rounded-2xl p-8 border-l-4 border-orange-500"
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}
