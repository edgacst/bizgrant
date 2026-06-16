import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Calendar,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Sparkles,
} from 'lucide-react';
import GrantCard from '../components/GrantCard';
import client from '../api/client';
import { getVisiblePages } from '../utils/pagination';
import { usePageSeo } from '../hooks/usePageSeo';
import { PAGE_SEO } from '../seo/config';
import type { GrantNotice, MatchingScore } from '../types';

const CATEGORIES = ['전체', 'R&D', '창업', '수출', '제조혁신', '인력', '마케팅', '기타'];
const SOURCE_OPTIONS = [
  { value: '전체', label: '전체 소스' },
  { value: 'BIZINFO', label: '기업마당' },
  { value: 'MSS', label: '중소벤처기업부' },
  { value: 'KSTARTUP', label: 'K-Startup' },
];
const SORT_OPTIONS = [
  { value: 'deadline', label: '마감임박순' },
  { value: 'matchScore', label: '매칭률순' },
  { value: 'latest', label: '최신순' },
];

const GrantListPage: React.FC = () => {
  usePageSeo(PAGE_SEO.grants);

  const [grants, setGrants] = useState<GrantNotice[]>([]);
  const [scores, setScores] = useState<Map<number, MatchingScore>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('deadline');
  const [activeSource, setActiveSource] = useState('전체');
  const [loadError, setLoadError] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const activeFiltersCount =
    (activeCategory !== '전체' ? 1 : 0) +
    (activeSource !== '전체' ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    (search ? 1 : 0);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const params: Record<string, string | number> = {
        page: page - 1,
        size: 10,
        sort: sortBy === 'matchScore' ? 'deadline' : sortBy,
      };
      if (search) params.keyword = search;
      if (activeCategory !== '전체') params.category = activeCategory;
      if (activeSource !== '전체') {
        params.source = activeSource;
      } else {
        params.excludeSource = 'G2B';
      }
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

      if (items.length > 0) {
        try {
          const scoreRes = await client.get('/grants/scores', {
            params: { ids: items.map((g: GrantNotice) => g.id).join(',') },
          });
          if (Array.isArray(scoreRes.data)) {
            const map = new Map<number, MatchingScore>();
            scoreRes.data.forEach((s: MatchingScore) => map.set(s.noticeId, s));
            setScores(map);
          }
        } catch {
          setScores(new Map());
        }
      } else {
        setScores(new Map());
      }
    } catch {
      setGrants([]);
      setTotalElements(0);
      setTotalPages(1);
      setScores(new Map());
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory, activeSource, dateFrom, dateTo, sortBy]);

  useEffect(() => {
    fetchGrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeCategory, activeSource, dateFrom, dateTo, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        setPage(1);
        fetchGrants();
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const displayGrants = useMemo(() => {
    if (sortBy !== 'matchScore') {
      return grants;
    }
    return [...grants].sort(
      (a, b) => (scores.get(b.id)?.score ?? 0) - (scores.get(a.id)?.score ?? 0),
    );
  }, [grants, scores, sortBy]);

  const clearAllFilters = () => {
    setActiveCategory('전체');
    setActiveSource('전체');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            <Sparkles className="w-6 h-6 inline mr-2 text-brand-500" />
            정부지원금사업 탐색
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            신청 가능 공고 <span className="font-bold text-brand-600">{totalElements.toLocaleString()}</span>건
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-bold ml-2">
                <SlidersHorizontal className="w-3 h-3" />
                {activeFiltersCount}개 필터 적용 중
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              리스트
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-1" />
              그리드
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="공고명, 기관명, 키워드로 검색..."
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

      {/* Source + Category Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={activeSource}
          onChange={(e) => { setActiveSource(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {cat}
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

      {/* Date Range */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">마감일</span>
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
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            초기화
          </button>
        )}
      </div>

      {/* Grant List / Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="premium-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-16 rounded-full" />
                    <div className="skeleton h-5 w-20 rounded-full" />
                  </div>
                  <div className="skeleton h-6 w-3/4" />
                  <div className="flex gap-4">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-4 w-40" />
                  </div>
                </div>
                <div className="skeleton w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">공고를 불러오지 못했습니다</p>
          <p className="text-sm text-gray-500 mt-2">서버 연결을 확인한 뒤 다시 시도해 주세요.</p>
          <button onClick={() => fetchGrants()} className="btn btn-secondary mt-4">
            다시 시도
          </button>
        </div>
      ) : grants.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">검색 결과가 없습니다</p>
          <p className="text-sm text-gray-500 mt-2">다른 키워드나 필터를 시도해보세요</p>
          <button onClick={clearAllFilters} className="btn btn-secondary mt-4">
            모든 필터 초기화
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} matchScore={scores.get(grant.id)?.score} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} matchScore={scores.get(grant.id)?.score} />
          ))}
        </div>
      )}

      {/* Load More / Pagination */}
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
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
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

export default GrantListPage;
