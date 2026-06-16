import { useEffect, useState } from 'react';
import client from '../api/client';

export type LandingStats = {
  grantCount: number | null;
  bidCount: number | null;
  awardCount: number | null;
  partnerCounts: Record<string, number | null>;
};

/** 파트너 카드 abbr → DB source 코드 (인트로 active-count 와 동일 기준) */
const PARTNER_SOURCES: Record<string, string[]> = {
  MSS: ['MSS'],
  G2B: ['G2B'],
  BIZ: ['BIZINFO', 'BIZINFO_API'],
  KITA: ['KITA'],
  SBA: ['SBA'],
  KOTRA: ['KOTRA'],
  KOSME: ['KOSME'],
  KISED: ['KISED'],
  KOCCA: ['KOCCA'],
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
    cached ?? { grantCount: null, bidCount: null, awardCount: null, partnerCounts: {} },
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cached && Date.now() - cacheTime < CACHE_MS) {
        setStats(cached);
        return;
      }

      try {
        const sourceKeys = [...new Set(Object.values(PARTNER_SOURCES).flat())];
        const [grantCount, bidCount, awardCount, ...sourceTotals] = await Promise.all([
          fetchActiveCount({ excludeSource: 'G2B' }),
          fetchActiveCount({ source: 'G2B' }),
          fetchActiveCount({ source: 'G2B_AWARD' }),
          ...sourceKeys.map((source) => fetchActiveCount({ source })),
        ]);

        const bySource: Record<string, number> = {};
        sourceKeys.forEach((key, i) => {
          bySource[key] = sourceTotals[i] ?? 0;
        });

        const partnerCounts: Record<string, number | null> = {};
        for (const [abbr, keys] of Object.entries(PARTNER_SOURCES)) {
          const total = keys.reduce((sum, key) => sum + (bySource[key] ?? 0), 0);
          partnerCounts[abbr] = total;
        }

        if (!cancelled) {
          cached = { grantCount, bidCount, awardCount, partnerCounts };
          cacheTime = Date.now();
          setStats(cached);
        }
      } catch {
        if (!cancelled) {
          setStats({ grantCount: null, bidCount: null, awardCount: null, partnerCounts: {} });
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
