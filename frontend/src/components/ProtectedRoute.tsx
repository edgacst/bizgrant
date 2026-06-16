import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { restoreAuthSession } from '../utils/authSession';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-500 dark:text-gray-400">로그인 상태 확인 중…</p>
      </div>
    );
  }

  if (authState === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
