import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Building2,
  Calendar,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBookmarks, removeBookmark, type BookmarkItem } from '../api/bookmarks';
import { formatLimit } from '../api/plan';
import { usePlan } from '../hooks/usePlan';
import PlanUpgradeHint from '../components/PlanUpgradeHint';
import { syncAuthSession } from '../utils/authSession';

const CATEGORY_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '창업': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '수출': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '제조혁신': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '인력': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '마케팅': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '기타': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function BookmarksPage() {
  const { planInfo, limits, usage, refresh } = usePlan();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      await syncAuthSession();
      const result = await getBookmarks();
      setItems(result || []);
    } catch (err: unknown) {
      setItems([]);
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 401) {
        toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        toast.error(msg || '북마크 목록을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleRemove(grantId: number) {
    try {
      await removeBookmark(grantId);
      setItems((prev) => prev.filter((item) => item.grantId !== grantId));
      await refresh();
      toast.success('북마크를 해제했습니다.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '북마크 해제에 실패했습니다.');
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-brand-600" />
            북마크
          </h1>
          <p className="text-gray-500 mt-1">
            {planInfo.planLabel} · {usage?.bookmarks ?? items.length}/{formatLimit(limits.maxBookmarks)}건
          </p>
        </div>

        {planInfo.plan === 'free' && (
          <div className="mb-6">
            <PlanUpgradeHint compact message="Free는 북마크 5건까지 저장할 수 있습니다." requiredPlan="Pro" />
          </div>
        )}

        {items.length === 0 ? (
          <div className="premium-card p-10 text-center">
            <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">저장한 북마크가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">공고 상세에서 북마크 아이콘을 눌러 저장하세요.</p>
            <Link to="/grants" className="btn btn-primary mt-6 inline-flex">
              공고 둘러보기
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const tagColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['기타'];
              return (
                <li key={item.id} className="premium-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
                          {item.category}
                        </span>
                        {item.applyEnd && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            마감 {formatDate(item.applyEnd)}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/grants/${item.grantId}`}
                        className="text-base font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" />
                          {item.organization}
                        </span>
                        {item.budget && <span>{item.budget}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.originalUrl && (
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="원문 보기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleRemove(item.grantId)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="북마크 해제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
