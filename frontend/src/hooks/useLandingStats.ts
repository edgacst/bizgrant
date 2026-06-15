import { useEffect, useState } from 'react';
import client from '../api/client';

export type LandingStats = {
  grantCount: number | null;
  bidCount: number | null;
  partnerCounts: Record<string, number>;
};

const PARTNER_SOURCES: Record<string, string[]> = {
  MSS: ['MSS'],
  G2B: ['G2B', 'G2B_AWARD'],
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

function parseBySource(data: unknown): Record<string, number> {
  const map: Record<string, number> = {};
  if (!data || typeof data !== 'object' || !('bySource' in data)) {
    return map;
  }
  const rows = (data as { bySource: unknown }).bySource;
  if (!Array.isArray(rows)) return map;
  for (const row of rows) {
    if (Array.isArray(row) && row.length >= 2) {
      map[String(row[0])] = Number(row[1]) || 0;
    }
  }
  return map;
}

function sumSources(bySource: Record<string, number>, keys: string[]): number {
  return keys.reduce((sum, key) => sum + (bySource[key] ?? 0), 0);
}

export function useLandingStats(): LandingStats {
  const [stats, setStats] = useState<LandingStats>(
    cached ?? { grantCount: null, bidCount: null, partnerCounts: {} },
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cached && Date.now() - cacheTime < CACHE_MS) {
        setStats(cached);
        return;
      }

      try {
        const [grantRes, bidRes, syncRes] = await Promise.all([
          client.get('/grants/active-count', { params: { excludeSource: 'G2B' } }),
          client.get('/grants/active-count', { params: { source: 'G2B' } }),
          client.get('/grants/sync/status'),
        ]);

        const bySource = parseBySource(syncRes.data);
        const partnerCounts: Record<string, number> = {};
        for (const [abbr, keys] of Object.entries(PARTNER_SOURCES)) {
          partnerCounts[abbr] = sumSources(bySource, keys);
        }

        if (!cancelled) {
          cached = {
            grantCount: grantRes.data?.total ?? null,
            bidCount: bidRes.data?.total ?? null,
            partnerCounts,
          };
          cacheTime = Date.now();
          setStats(cached);
        }
      } catch {
        if (!cancelled) {
          setStats({ grantCount: null, bidCount: null, partnerCounts: {} });
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
