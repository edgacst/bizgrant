import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatGuestPreviewRemaining,
  getGuestPreviewRemainingMs,
  isGuestPreviewExpired,
  startGuestPreview,
} from '../utils/guestPreview';

interface UseGuestPreviewOptions {
  enabled: boolean;
}

export function useGuestPreview({ enabled }: UseGuestPreviewOptions) {
  const navigate = useNavigate();
  const [remainingMs, setRemainingMs] = useState(() =>
    enabled ? getGuestPreviewRemainingMs() : 0,
  );

  const redirectToSignup = useCallback(() => {
    navigate('/signup', {
      replace: true,
      state: { previewExpired: true, from: '/grants' },
    });
  }, [navigate]);

  useEffect(() => {
    if (!enabled) return;

    startGuestPreview();

    if (isGuestPreviewExpired()) {
      redirectToSignup();
      return;
    }

    const tick = () => {
      const next = getGuestPreviewRemainingMs();
      setRemainingMs(next);
      if (next <= 0) {
        redirectToSignup();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [enabled, redirectToSignup]);

  return {
    remainingMs,
    remainingLabel: formatGuestPreviewRemaining(remainingMs),
    isExpired: enabled && remainingMs <= 0,
  };
}
