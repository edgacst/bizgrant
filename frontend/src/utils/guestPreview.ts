export const GUEST_PREVIEW_DURATION_MS = 5 * 60 * 1000;
const STORAGE_KEY = 'bizgrant_grants_preview_started_at';

export function startGuestPreview(): void {
  if (!sessionStorage.getItem(STORAGE_KEY)) {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  }
}

export function getGuestPreviewStartedAt(): number | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function getGuestPreviewRemainingMs(): number {
  const startedAt = getGuestPreviewStartedAt();
  if (startedAt === null) return GUEST_PREVIEW_DURATION_MS;
  const elapsed = Date.now() - startedAt;
  return Math.max(0, GUEST_PREVIEW_DURATION_MS - elapsed);
}

export function isGuestPreviewExpired(): boolean {
  return getGuestPreviewRemainingMs() <= 0;
}

export function formatGuestPreviewRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function clearGuestPreview(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
