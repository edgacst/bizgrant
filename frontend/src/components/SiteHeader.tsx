import React, { useEffect, useState } from 'react';
import { isLoggedIn } from '../utils/authSession';
import Navbar from './Navbar';
import PublicHeader from './PublicHeader';

const SiteHeader: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn());
    sync();
    window.addEventListener('auth-session-updated', sync);
    return () => window.removeEventListener('auth-session-updated', sync);
  }, []);

  return loggedIn ? <Navbar /> : <PublicHeader />;
};

export default SiteHeader;
