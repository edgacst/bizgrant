import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, Loader2, Settings, XCircle } from 'lucide-react';
import {
  getAlertHistory,
  getAlertLabel,
  getAlertTimestamp,
  getUnreadAlertCount,
  formatAlertChannel,
  isAlertUnread,
  markAlertsRead,
  type AlertHistoryItem,
} from '../api/alerts';
import { isLoggedIn } from '../utils/authSession';

function formatWhen(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AlertHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isLoggedIn()) {
      setUnreadCount(0);
      return;
    }
    try {
      setUnreadCount(await getUnreadAlertCount());
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!isLoggedIn()) {
      setItems([]);
      setUnreadCount(0);
      return [];
    }
    setLoading(true);
    try {
      const history = await getAlertHistory();
      setItems(history);
      setUnreadCount(history.filter(isAlertUnread).length);
      return history;
    } catch {
      setItems([]);
      await refreshUnreadCount();
      return [];
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);

  const openPanel = useCallback(async () => {
    setOpen(true);
    const history = await loadHistory();
    const unreadIds = history.filter(isAlertUnread).map((item) => item.id);
    if (unreadIds.length === 0) {
      return;
    }
    try {
      await markAlertsRead(unreadIds);
      const readAt = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) => (unreadIds.includes(item.id) ? { ...item, readAt } : item)),
      );
      setUnreadCount(0);
    } catch {
      await refreshUnreadCount();
    }
  }, [loadHistory, refreshUnreadCount]);

  useEffect(() => {
    void refreshUnreadCount();
    const onUpdate = () => { void refreshUnreadCount(); };
    window.addEventListener('auth-session-updated', onUpdate);
    window.addEventListener('alert-history-updated', onUpdate);
    return () => {
      window.removeEventListener('auth-session-updated', onUpdate);
      window.removeEventListener('alert-history-updated', onUpdate);
    };
  }, [refreshUnreadCount]);

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            void openPanel();
          }
        }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        aria-label="알림"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] premium-card z-20 animate-fadeUp shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">알림</h3>
              {unreadCount > 0 ? (
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400">새 알림 {unreadCount}건</span>
              ) : items.length > 0 ? (
                <span className="text-xs text-gray-500">읽음</span>
              ) : null}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">새 알림이 없습니다.</p>
                  <p className="text-xs text-gray-400 mt-1">매칭 공고가 있으면 여기에 표시됩니다.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.slice(0, 15).map((item) => {
                    const when = formatWhen(getAlertTimestamp(item));
                    const label = getAlertLabel(item);
                    const failed = item.status === 'failed';
                    const unread = isAlertUnread(item);
                    const content = (
                      <div className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${unread ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                        <div className="mt-0.5 shrink-0">
                          {failed ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {item.category && (
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mb-1">
                              {item.category}
                            </span>
                          )}
                          <p className={`text-sm line-clamp-2 ${unread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                            {label}
                          </p>
                          {item.organization && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {item.organization}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {when}
                            {' · '}
                            {formatAlertChannel(item.channel)}
                          </p>
                        </div>
                        {unread && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" aria-hidden />
                        )}
                      </div>
                    );

                    return (
                      <li key={item.id}>
                        {item.noticeId ? (
                          <Link
                            to={`/grants/${item.noticeId}`}
                            onClick={() => setOpen(false)}
                          >
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {items.length > 15 && (
                <p className="text-center text-xs text-gray-400 py-2 border-t border-gray-100 dark:border-gray-800">
                  외 {items.length - 15}건 · 알림 설정에서 전체 보기
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-2">
              <Link
                to="/alerts"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                알림 설정
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
