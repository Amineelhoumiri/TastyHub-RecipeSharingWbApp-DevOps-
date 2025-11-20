import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-orange-600">🍽️ TastyHub</h1>
        <ul className="flex gap-6 text-gray-700 font-medium">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/recipes">Recipes</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/login">Login</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h2 className="text-5xl font-extrabold text-orange-600 mb-4">
          Share & Discover Amazing Recipes
        </h2>
        <p className="text-gray-700 text-lg max-w-2xl mb-8">
          Welcome to TastyHub — the home for food lovers. Explore delicious recipes, share your creations, and connect with a community of passionate cooks.
        </p>
        <div className="flex gap-4">
          <Link
            href="/recipes"
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
            Browse Recipes
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-orange-500 text-orange-500 rounded-xl hover:bg-orange-50 transition">
            Join Now
          </Link>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="px-8 py-12 bg-white">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Featured Recipes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Recipe Card 1 */}
          <div className="bg-orange-50 rounded-2xl p-4 shadow hover:shadow-lg transition">
            <img src="https://betterhomebase.com/wp-content/uploads/2025/06/One-Pot-Creamy-Garlic-Pasta.webp" alt="Pasta" className="rounded-xl mb-4 w-full h-48 object-cover" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Creamy Garlic Pasta</h4>
            <p className="text-gray-600 text-sm mb-3">A delicious creamy pasta recipe topped with parmesan and herbs.</p>
            <button className="text-orange-600 font-medium hover:underline">View Recipe →</button>
          </div>

          {/* Recipe Card 2 */}
          <div className="bg-orange-50 rounded-2xl p-4 shadow hover:shadow-lg transition">
            <img src="https://www.recipetineats.com/tachyon/2021/08/Garden-Salad_48.jpg?resize=900%2C1260&zoom=1" alt="Salad" className="rounded-xl mb-4 w-full h-48 object-cover" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Fresh Garden Salad</h4>
            <p className="text-gray-600 text-sm mb-3">A light and healthy salad with fresh vegetables and dressing.</p>
            <button className="text-orange-600 font-medium hover:underline">View Recipe →</button>
          </div>

          {/* Recipe Card 3 */}
          <div className="bg-orange-50 rounded-2xl p-4 shadow hover:shadow-lg transition">
            <img src="https://eightforestlane.com/wp-content/uploads/2020/02/Chocolate-Lava-Cakes_SQ-1.jpg" alt="Dessert" className="rounded-xl mb-4 w-full h-48 object-cover" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Chocolate Lava Cake</h4>
            <p className="text-gray-600 text-sm mb-3">Rich and gooey chocolate cake with a molten center.</p>
            <button className="text-orange-600 font-medium hover:underline">View Recipe →</button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-orange-100">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Join the TastyHub Community!</h3>
        <p className="text-gray-600 mb-6">
          Create your account to start sharing and saving your favorite recipes today.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
          Sign Up Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t mt-auto">
        © 2025 TastyHub. All rights reserved.
      </footer>
    </main>
  );
}
