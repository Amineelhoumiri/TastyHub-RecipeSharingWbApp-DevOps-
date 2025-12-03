'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-8 py-16">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-orange-600 dark:text-orange-400 text-center mb-12">
          About TastyHub
        </h1>

        {/* Description */}
        <section className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            TastyHub is a simple and modern platform created for food lovers.
            Whether you want to discover new recipes or share your own creations,
            TastyHub brings the community together in one place.
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Our mission is to make cooking fun, accessible, and inspiring.
            From everyday meals to creative dishes, TastyHub empowers people
            to explore food without limits.
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Enjoy browsing recipes, saving your favourites, and becoming part
            of a growing food community — all in one clean and easy-to-use platform.
          </p>
        </section>

        {/* Features Section */}
        <section className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Discover Recipes</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explore a wide variety of delicious recipes from our community
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Save Favorites</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep track of your favorite recipes and access them anytime
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Share & Connect</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share your culinary creations and connect with fellow food lovers
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
