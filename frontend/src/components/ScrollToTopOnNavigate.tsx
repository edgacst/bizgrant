import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }, 150);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTopOnNavigate;
