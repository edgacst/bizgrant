import React from 'react';
import { isLoggedIn } from '../utils/authSession';
import Navbar from './Navbar';
import PublicHeader from './PublicHeader';

const SiteHeader: React.FC = () => {
  return isLoggedIn() ? <Navbar /> : <PublicHeader />;
};

export default SiteHeader;
