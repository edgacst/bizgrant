import { useEffect, useState } from 'react';
import client from '../api/client';

export type LandingStats = {
  grantCount: number | null;
  bidCount: number | null;
  awardCount: number | null;
};

let cached: LandingStats | null = null;
let cacheTime = 0;
const CACHE_MS = 60_000;

async function fetchActiveCount(params?: { source?: string; excludeSource?: string }): Promise<number> {
  const res = await client.get('/grants/active-count', { params });
  return Number(res.data?.total ?? 0);
}

export function useLandingStats(): LandingStats {
  const [stats, setStats] = useState<LandingStats>(
    cached ?? { grantCount: null, bidCount: null, awardCount: null },
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cached && Date.now() - cacheTime < CACHE_MS) {
        setStats(cached);
        return;
      }

      try {
        const [grantCount, bidCount, awardCount] = await Promise.all([
          fetchActiveCount({ excludeSource: 'G2B' }),
          fetchActiveCount({ source: 'G2B' }),
          fetchActiveCount({ source: 'G2B_AWARD' }),
        ]);

        if (!cancelled) {
          cached = { grantCount, bidCount, awardCount };
          cacheTime = Date.now();
          setStats(cached);
        }
      } catch {
        if (!cancelled) {
          setStats({ grantCount: null, bidCount: null, awardCount: null });
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
