import { Inter } from "next/font/google";
import "./globals.css";
import DarkModeScript from "./components/DarkModeScript";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "TastyHub - Recipe Sharing Platform",
  description: "Share and discover amazing recipes with the TastyHub community",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Default is ALWAYS light mode (white/beige background)
                  // Force remove dark class first to ensure light mode
                  document.documentElement.classList.remove('dark');
                  
                  // Only activate dark mode if user explicitly enabled it
                  const darkMode = localStorage.getItem('darkMode');
                  if (darkMode === 'true') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <DarkModeScript />
        {children}
        <Script
          src="https://t.contentsquare.net/uxa/2dc16f9899acb.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
