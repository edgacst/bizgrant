import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
      aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
    </button>
  );
};

export default DarkModeToggle;
