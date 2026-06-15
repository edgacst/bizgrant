import { useEffect, useState } from 'react';
import client from '../api/client';

let cachedTotal: number | null = null;
let cacheTime = 0;
const CACHE_MS = 60_000;

export function useGrantTotal() {
  const [total, setTotal] = useState<number | null>(cachedTotal);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cachedTotal != null && Date.now() - cacheTime < CACHE_MS) {
        setTotal(cachedTotal);
        return;
      }

      try {
        const countRes = await client.get('/grants/active-count', {
          params: { excludeSource: 'G2B' },
        });
        if (!cancelled && countRes.data?.total != null) {
          cachedTotal = countRes.data.total;
          cacheTime = Date.now();
          setTotal(cachedTotal);
          return;
        }
      } catch {
        // fallback below
      }

      try {
        const listRes = await client.get('/grants', {
          params: { page: 0, size: 1, excludeSource: 'G2B' },
        });
        if (!cancelled) {
          const value = listRes.data?.totalElements ?? null;
          cachedTotal = value;
          cacheTime = Date.now();
          setTotal(value);
        }
      } catch {
        if (!cancelled) setTotal(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return total;
}
