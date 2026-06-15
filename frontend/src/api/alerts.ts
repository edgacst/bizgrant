import client from './client';

export type AlertHistoryItem = {
  id: number;
  userId?: number;
  noticeId?: number;
  sentAt?: string;
  readAt?: string | null;
  date?: string;
  channel?: string;
  noticeTitle?: string;
  organization?: string;
  category?: string;
  applyEnd?: string;
  status?: 'sent' | 'failed' | 'pending';
};

export async function getAlertHistory(): Promise<AlertHistoryItem[]> {
  const { data } = await client.get<AlertHistoryItem[]>('/history');
  const items = Array.isArray(data) ? data : [];
  return enrichAlertHistory(items);
}

async function enrichAlertHistory(items: AlertHistoryItem[]): Promise<AlertHistoryItem[]> {
  const missing = items.filter((item) => !item.noticeTitle?.trim() && item.noticeId);
  if (missing.length === 0) {
    return items;
  }

  const uniqueIds = [...new Set(missing.map((item) => item.noticeId!))].slice(0, 30);
  const details = new Map<number, Partial<AlertHistoryItem>>();

  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const { data } = await client.get<{
          title?: string;
          organization?: string;
          category?: string;
          applyEnd?: string;
        }>(`/grants/${id}`);
        details.set(id, {
          noticeTitle: data.title,
          organization: data.organization,
          category: data.category,
          applyEnd: data.applyEnd,
        });
      } catch {
        // 삭제·만료된 공고
      }
    }),
  );

  return items.map((item) => {
    if (item.noticeTitle?.trim() || !item.noticeId) {
      return item;
    }
    const extra = details.get(item.noticeId);
    return extra ? { ...item, ...extra } : item;
  });
}

export async function getUnreadAlertCount(): Promise<number> {
  const { data } = await client.get<{ count?: number }>('/history/unread-count');
  return data?.count ?? 0;
}

export async function markAlertsRead(ids?: number[]): Promise<number> {
  const { data } = await client.post<{ updated?: number }>('/history/read', ids?.length ? { ids } : {});
  return data?.updated ?? 0;
}

export function isAlertUnread(item: AlertHistoryItem): boolean {
  return !item.readAt;
}

export function getAlertTimestamp(item: AlertHistoryItem): string | undefined {
  return item.sentAt ?? item.date;
}

export function getAlertLabel(item: AlertHistoryItem): string {
  if (item.noticeTitle?.trim()) {
    return item.noticeTitle.trim();
  }
  if (item.noticeId) {
    return '만료되었거나 삭제된 공고';
  }
  return '알림';
}

export function formatAlertChannel(channel?: string): string {
  switch ((channel ?? '').toLowerCase()) {
    case 'email':
      return '이메일';
    case 'telegram':
      return 'Telegram';
    case 'slack':
      return 'Slack';
    default:
      return channel || '이메일';
  }
}
