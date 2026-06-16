import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
  Clock,
  Sparkles,
  Building2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import client from '../api/client';
import type { GrantNotice } from '../types';
import { usePageSeo } from '../hooks/usePageSeo';
import { PAGE_SEO } from '../seo/config';

const CATEGORY_DOT_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-500',
  '창업': 'bg-green-500',
  '수출': 'bg-blue-500',
  '제조혁신': 'bg-orange-500',
  '인력': 'bg-pink-500',
  '마케팅': 'bg-teal-500',
  '기타': 'bg-gray-400',
};

const CATEGORY_BG_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '창업': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '수출': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '제조혁신': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '인력': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '마케팅': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '기타': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const CalendarPage: React.FC = () => {
  usePageSeo(PAGE_SEO.calendar);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [grants, setGrants] = useState<GrantNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await client.get('/grants', {
          params: { page: 0, size: 200, sort: 'deadline', excludeSource: 'G2B' },
        });
        const items = (res.data.content || res.data || []).map((g: GrantNotice & { url?: string }) => ({
          ...g,
          originalUrl: g.originalUrl || g.url || '',
        }));
        setGrants(items);
      } catch {
        setGrants([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Build a map of date -> grants
  const grantsByDate = useMemo(() => {
    const map = new Map<string, GrantNotice[]>();
    grants.forEach((g) => {
      if (!g.applyEnd) return;
      const key = g.applyEnd.slice(0, 10);
      const existing = map.get(key) || [];
      existing.push(g);
      map.set(key, existing);
    });
    return map;
  }, [grants]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  const formatDateFull = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });

  const isToday = (day: number) =>
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth() &&
    day === today.getDate();

  const dateKey = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedGrants = selectedDate ? grantsByDate.get(selectedDate) || [] : [];

  const upcomingGrants = useMemo(() => {
    return [...grants].sort(
      (a, b) => a.applyEnd.localeCompare(b.applyEnd)
    );
  }, [grants]);

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              <CalendarIcon className="w-7 h-7 inline mr-2 text-brand-500" />
              공고 캘린더
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              마감일 기준으로 정부지원금사업 일정을 확인하세요
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                캘린더
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
                목록
              </button>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 premium-card p-4 text-sm text-red-600 dark:text-red-400">
            공고 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
        <>
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 premium-card p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{monthName}</h2>
                <button
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex mb-8">
                <button onClick={goToday} className="btn btn-secondary text-xs px-4 py-2">
                  오늘
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-bold py-2 ${
                      day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const key = dateKey(day);
                  const grantsOnDay = grantsByDate.get(key) || [];
                  const active = key === selectedDate;
                  const todayFlag = isToday(day);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(active ? null : key)}
                      className={`aspect-square relative rounded-xl flex flex-col items-center justify-center transition-all text-sm ${
                        active
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                          : todayFlag
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-bold ring-2 ring-brand-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className={`font-semibold ${todayFlag && !active ? 'text-brand-600' : ''}`}>
                        {day}
                      </span>
                      {grantsOnDay.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {grantsOnDay.slice(0, 3).map((g) => (
                            <span
                              key={g.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                active ? 'bg-white' : CATEGORY_DOT_COLORS[g.category] || 'bg-gray-400'
                              }`}
                            />
                          ))}
                          {grantsOnDay.length > 3 && (
                            <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-gray-400'}`}>
                              +{grantsOnDay.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                {Object.entries(CATEGORY_DOT_COLORS).slice(0, 5).map(([cat, color]) => (
                  <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar: Selected Date Grants */}
            <div className="premium-card p-6">
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" />
                {selectedDate
                  ? formatDateFull(selectedDate)
                  : '날짜를 선택하세요'}
              </h3>

              {selectedDate && selectedGrants.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    이 날짜에 마감되는 공고가 없습니다
                  </p>
                </div>
              )}

              {selectedDate && selectedGrants.length > 0 && (
                <div className="space-y-3">
                  {selectedGrants.map((g) => (
                    <Link
                      key={g.id}
                      to={`/grants/${g.id}`}
                      className="block p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 hover:shadow-sm transition-all group"
                    >
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_BG_COLORS[g.category] || CATEGORY_BG_COLORS['기타']}`}>
                        {g.category}
                      </span>
                      <h4 className="font-semibold text-gray-900 dark:text-white mt-2 group-hover:text-brand-600 transition-colors line-clamp-2 text-sm">
                        {g.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {g.organization}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {!selectedDate && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    캘린더에서 날짜를 클릭하면
                    <br />
                    해당 날짜에 마감되는 공고를 볼 수 있습니다
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="premium-card p-6">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-500" />
              마감일 순 공고 목록
            </h2>
            <div className="space-y-3">
              {upcomingGrants.map((g) => {
                const endDate = new Date(g.applyEnd);
                const now = new Date(today);
                const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = diffDays <= 7 && diffDays > 0;
                const isPast = diffDays < 0;

                return (
                  <Link
                    key={g.id}
                    to={`/grants/${g.id}`}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group ${
                      isPast
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50'
                        : isUrgent
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 hover:shadow-md'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Date Badge */}
                    <div className={`shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center ${
                      isPast
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : isUrgent
                        ? 'bg-red-500 text-white'
                        : 'bg-brand-50 dark:bg-brand-900/20'
                    }`}>
                      <span className="text-xs font-bold">
                        {endDate.toLocaleDateString('ko-KR', { month: 'short' })}
                      </span>
                      <span className={`text-lg font-extrabold ${isPast ? 'text-gray-500' : isUrgent ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`}>
                        {endDate.getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_BG_COLORS[g.category] || CATEGORY_BG_COLORS['기타']}`}>
                          {g.category}
                        </span>
                        {isUrgent && (
                          <span className="text-xs font-extrabold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                            D-{diffDays}
                          </span>
                        )}
                        {isPast && (
                          <span className="text-xs font-bold text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
                            마감
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">
                        {g.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {g.organization}
                      </p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
