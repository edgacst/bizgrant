import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
      }`}
      aria-label="맨 위로"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTop;
