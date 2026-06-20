import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, isAdsenseEnabled } from '../lib/adsense';

type AdSenseProps = {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
};

const AdSense: React.FC<AdSenseProps> = ({
  slot,
  format = 'auto',
  fullWidthResponsive = true,
  className = '',
}) => {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!isAdsenseEnabled() || !slot || !insRef.current) {
      return;
    }
    if (insRef.current.getAttribute('data-adsbygoogle-status')) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocker or script not loaded yet
    }
  }, [slot]);

  if (!isAdsenseEnabled() || !slot) {
    return null;
  }

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSense;
