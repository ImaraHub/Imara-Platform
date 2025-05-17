import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
      // Load saved theme or default to system preference
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
  
    useEffect(() => {
      const classList = document.documentElement.classList;
      if (isDark) {
        classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }, [isDark]);
  
    return (
      <button
        onClick={() => setIsDark(!isDark)}
        className="p-2 rounded bg-primary text-background hover:opacity-80"
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    );
  }