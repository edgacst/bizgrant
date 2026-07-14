import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { restoreAuthSession } from '../utils/authSession';
import {
  isGuestPreviewExpired,
  startGuestPreview,
} from '../utils/guestPreview';
import GuestPreviewBanner from './GuestPreviewBanner';

interface GuestPreviewRouteProps {
  children: React.ReactNode;
}

const GuestPreviewRoute: React.FC<GuestPreviewRouteProps> = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'guest'>('loading');

  useEffect(() => {
    let cancelled = false;

    void restoreAuthSession().then((ok) => {
      if (!cancelled) {
        setAuthState(ok ? 'authenticated' : 'guest');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중…</p>
      </div>
    );
  }

  if (authState === 'authenticated') {
    return <>{children}</>;
  }

  startGuestPreview();

  if (isGuestPreviewExpired()) {
    return (
      <Navigate
        to="/signup"
        replace
        state={{ from: location, previewExpired: true }}
      />
    );
  }

  return (
    <>
      <GuestPreviewBanner />
      {children}
    </>
  );
};

export default GuestPreviewRoute;
