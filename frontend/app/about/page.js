import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <Navbar />
      
      <div className="flex-1 px-8 py-12">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-orange-600 text-center mb-6">
          About TastyHub
        </h1>

        {/* Description */}
        <section className="max-w-3xl mx-auto text-center text-gray-700 text-lg leading-relaxed">
          <p className="mb-4">
            TastyHub is a simple and modern platform created for food lovers.
            Whether you want to discover new recipes or share your own creations,
            TastyHub brings the community together in one place.
          </p>

          <p className="mb-4">
            Our mission is to make cooking fun, accessible, and inspiring.
            From everyday meals to creative dishes, TastyHub empowers people
            to explore food without limits.
          </p>

          <p>
            Enjoy browsing recipes, saving your favourites, and becoming part
            of a growing food community — all in one clean and easy-to-use platform.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold text-orange-600">
        🍽️ TastyHub
      </Link>
      <ul className="flex gap-6 text-gray-700 font-medium">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/recipes">Recipes</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="text-center py-6 text-gray-500 text-sm border-t mt-auto">
      © 2025 TastyHub. All rights reserved.
    </footer>
  );
}
