export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} TastyHub. All rights reserved.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <a
            href="/about"
            className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            About
          </a>
          <a
            href="https://github.com/Amineelhoumiri/Recipesharingwebapp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
