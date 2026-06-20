export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT?.trim() ?? '';
export const ADSENSE_SLOT_FOOTER = import.meta.env.VITE_ADSENSE_SLOT_FOOTER?.trim() ?? '';

export function isAdsenseEnabled(): boolean {
  return /^ca-pub-\d+$/i.test(ADSENSE_CLIENT);
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
