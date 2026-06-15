import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Gavel,
  Trophy,
  FileText,
} from 'lucide-react';
import ProcurementCard from '../components/ProcurementCard';
import AwardCard from '../components/AwardCard';
import client from '../api/client';
import { getVisiblePages } from '../utils/pagination';
import type { GrantNotice } from '../types';

type ProcTab = 'bid' | 'award';

const BID_TYPES = ['전체', '물품', '공사', '용역'];
const BID_SORT_OPTIONS = [
  { value: 'deadline', label: '마감임박순' },
  { value: 'latest', label: '최신순' },
];
const AWARD_SORT_OPTIONS = [
  { value: 'latest', label: '개찰 최신순' },
  { value: 'deadline', label: '개찰일순' },
];

const TAB_CONFIG: Record<ProcTab, { source: string; label: string; icon: typeof Gavel }> = {
  bid: { source: 'G2B', label: '입찰공고', icon: FileText },
  award: { source: 'G2B_AWARD', label: '낙찰정보', icon: Trophy },
};

const ProcurementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProcTab>('bid');
  const [grants, setGrants] = useState<GrantNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('전체');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [totalElements, setTotalElements] = useState(0);

  const isAward = activeTab === 'award';
  const sortOptions = isAward ? AWARD_SORT_OPTIONS : BID_SORT_OPTIONS;

  const activeFiltersCount =
    (activeType !== '전체' ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    (search ? 1 : 0);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchTab = (tab: ProcTab) => {
    setActiveTab(tab);
    setPage(1);
    setGrants([]);
    setTotalElements(0);
    setLoading(true);
    setActiveType('전체');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setSortBy(tab === 'award' ? 'latest' : 'deadline');
  };

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page - 1,
        size: 10,
        sort: sortBy,
        source: TAB_CONFIG[activeTab].source,
      };
      if (search) params.keyword = search;
      if (activeType !== '전체') params.category = activeType;
      if (dateFrom) params.applyEndFrom = dateFrom;
      if (dateTo) params.applyEndTo = dateTo;

      const res = await client.get('/grants', { params });
      const data = res.data;
      const items = (data.content || data || []).map((g: GrantNotice & { url?: string }) => ({
        ...g,
        originalUrl: g.originalUrl || g.url || '',
      }));
      setGrants(items);
      setTotalElements(data.totalElements ?? items.length);
      setTotalPages(data.totalPages || Math.ceil((data.totalElements || items.length) / 10) || 1);
    } catch {
      setGrants([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeType, dateFrom, dateTo, sortBy, activeTab]);

  useEffect(() => {
    fetchGrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeType, dateFrom, dateTo, sortBy, activeTab]);

  useEffect(() => {
    if (search === '') return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchGrants();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearAllFilters = () => {
    setActiveType('전체');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            <Gavel className="w-6 h-6 inline mr-2 text-slate-600 dark:text-slate-400" />
            나라장터
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {TAB_CONFIG[activeTab].label}{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">{totalElements.toLocaleString()}</span>건
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold ml-2">
                <SlidersHorizontal className="w-3 h-3" />
                {activeFiltersCount}개 필터 적용 중
              </span>
            )}
          </p>
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 입찰공고 / 낙찰정보 탭 */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
        {(Object.keys(TAB_CONFIG) as ProcTab[]).map((tab) => {
          const cfg = TAB_CONFIG[tab];
          const Icon = cfg.icon;
          return (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? tab === 'award'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-slate-700 text-white shadow-lg shadow-slate-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAward ? '공고명, 수요기관, 낙찰업체 검색...' : '공고명, 수요기관명으로 검색...'}
          className="input-premium pl-12 py-3.5 text-base rounded-2xl"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {BID_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => { setActiveType(type); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeType === type
                ? isAward
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-slate-700 text-white shadow-lg shadow-slate-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-slate-400 hover:text-slate-700'
            }`}
          >
            {type}
          </button>
        ))}

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            필터 초기화
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isAward ? '개찰일' : '입찰마감일'}
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-700 dark:text-gray-300"
        />
        <span className="text-gray-400">~</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-700 dark:text-gray-300"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="premium-card p-6">
              <div className="skeleton h-6 w-3/4 mb-3" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : grants.length === 0 ? (
        <div className="text-center py-20">
          {isAward ? (
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          ) : (
            <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          )}
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {isAward ? '낙찰정보가 없습니다' : '입찰공고가 없습니다'}
          </p>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            {isAward
              ? '공공데이터포털에서 「나라장터 낙찰정보서비스」 활용승인 후 POST /api/grants/sync/g2b-award 로 동기화하세요.'
              : '관리자 대시보드에서 G2B 동기화를 실행하거나, 필터를 조정해 보세요.'}
          </p>
          <button onClick={clearAllFilters} className="btn btn-secondary mt-4">
            모든 필터 초기화
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map((grant) =>
            isAward ? (
              <AwardCard key={grant.id} grant={grant} />
            ) : (
              <ProcurementCard key={grant.id} grant={grant} />
            )
          )}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex flex-col items-center gap-3 mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalElements.toLocaleString()}건 중 {(page - 1) * 10 + 1}–{Math.min(page * 10, totalElements)}건
          </p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← 이전
            </button>
            {getVisiblePages(page, totalPages).map((token, index) =>
              token === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={token}
                  onClick={() => goToPage(token)}
                  className={`min-w-10 h-10 px-2 rounded-xl text-sm font-bold transition-all ${
                    page === token
                      ? isAward
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-slate-700 text-white shadow-lg shadow-slate-500/20'
                      : 'text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {token}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              다음 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
