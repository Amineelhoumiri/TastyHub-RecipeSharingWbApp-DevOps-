/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class-based dark mode (not system preference)
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
