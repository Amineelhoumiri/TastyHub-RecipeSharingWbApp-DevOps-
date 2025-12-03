'use client';
import { useEffect } from 'react';

export default function DarkModeScript() {
  useEffect(() => {
    // Default is ALWAYS light mode (white/beige background)
    // Only activate dark mode if user explicitly clicked the toggle
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Force remove dark class first, then add only if explicitly enabled
    document.documentElement.classList.remove('dark');
    
    if (darkMode === true || darkMode === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return null;
}

