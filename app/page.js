export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-orange-600">🍽️ TastyHub</h1>
        <ul className="flex gap-6 text-gray-700 font-medium">
          <li><a href="#" className="hover:text-orange-500">Home</a></li>
          <li><a href="#" className="hover:text-orange-500">Recipes</a></li>
          <li><a href="#" className="hover:text-orange-500">About</a></li>
          <li><a href="#" className="hover:text-orange-500">Login</a></li>
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
          <button className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
            Browse Recipes
          </button>
          <button className="px-6 py-3 border border-orange-500 text-orange-500 rounded-xl hover:bg-orange-50 transition">
            Join Now
          </button>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="px-8 py-12 bg-white">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Featured Recipes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Recipe Card 1 */}
          <div className="bg-orange-50 rounded-2xl p-4 shadow hover:shadow-lg transition">
            <img src="https://scontent-lhr6-2.xx.fbcdn.net/v/t39.30808-6/500353771_991654973134156_8395707880554973080_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=YCLxBvOVj7AQ7kNvwHj0-8e&_nc_oc=Adkw4EEX5-Tt7L5yebdvJiB6nsqgUf65DxgFSAtsMCZlCjsYgrjN7GuGQok3SZai4vE&_nc_zt=23&_nc_ht=scontent-lhr6-2.xx&_nc_gid=d_jlk225l6WAgdVYVexSxA&oh=00_AfgAcyG5m1lAjNPT3lzzUMRXJVYzqNyKnWZjaCFdg6cl0Q&oe=6912B0D4" alt="Pasta" className="rounded-xl mb-4 w-full h-48 object-cover" />
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
        <button className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
          Sign Up Now
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t mt-auto">
        © 2025 TastyHub. All rights reserved.
      </footer>
    </main>
  );
}
