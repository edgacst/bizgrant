import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  TrendingUp,
  Tag,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import client from '../api/client';
import { getPipelineStats } from '../api/pipeline';
import type { GrantNotice, MatchingScore, PipelineStats } from '../types';
import { normalizePipelineStats } from '../utils/pipelineStats';
import { isLoggedIn } from '../utils/authSession';
import { buildCategoryDistribution, isDeadlineWithinDays } from '../utils/categoryDist';
import type { AlertHistory } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '창업': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '수출': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '제조혁신': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '인력': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '마케팅': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '기타': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const CATEGORY_BAR_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-500',
  '창업': 'bg-green-500',
  '수출': 'bg-blue-500',
  '제조혁신': 'bg-orange-500',
  '인력': 'bg-pink-500',
  '마케팅': 'bg-teal-500',
  '기타': 'bg-gray-400',
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  alert: <Bell className="w-4 h-4 text-brand-500" />,
  match: <TrendingUp className="w-4 h-4 text-green-500" />,
  view: <ExternalLink className="w-4 h-4 text-blue-500" />,
};

const DashboardPage: React.FC = () => {
  const [grants, setGrants] = useState<GrantNotice[]>([]);
  const [recommended, setRecommended] = useState<MatchingScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activities, setActivities] = useState<Array<{ id: number; type: string; text: string; time: string }>>([]);
  const [stats, setStats] = useState({
    alertCount: 0,
    matchRate: 0,
    interestCategory: '로그인 후 설정',
  });

  // Category distribution for mini chart
  const [categoryDist, setCategoryDist] = useState<Map<string, number>>(new Map());

  // Pipeline summary
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadError(false);
      try {
        const [grantsRes, statsRes, categoryRes] = await Promise.allSettled([
          client.get('/grants', { params: { page: 0, size: 8, sort: 'deadline', excludeSource: 'G2B' } }),
          client.get('/dashboard/stats'),
          client.get('/grants', { params: { page: 0, size: 100, sort: 'deadline', excludeSource: 'G2B' } }),
        ]);

        if (grantsRes.status === 'fulfilled') {
          const grantItems = grantsRes.value.data.content || grantsRes.value.data || [];
          setGrants(grantItems);
          setCategoryDist(buildCategoryDistribution(grantItems));
        }
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }

        if (isLoggedIn()) {
          try {
            const matchRes = await client.get('/matches');
            if (Array.isArray(matchRes.data)) {
              setRecommended(matchRes.data.slice(0, 6));
            }
          } catch {
            setRecommended([]);
          }
        } else {
          setRecommended([]);
        }

        if (categoryRes.status === 'fulfilled') {
          const categoryItems = categoryRes.value.data.content || categoryRes.value.data || [];
          if (categoryItems.length > 0) {
            setCategoryDist(buildCategoryDistribution(categoryItems));
          }
        }

        if (isLoggedIn()) {
          try {
            const historyRes = await client.get('/history');
            const history: AlertHistory[] = historyRes.data || [];
            setActivities(history.slice(0, 5).map((item, index) => ({
              id: item.id ?? index,
              type: 'alert',
              text: item.noticeTitle ? `알림: ${item.noticeTitle}` : '알림 발송',
              time: item.date ? new Date(item.date).toLocaleString('ko-KR') : '',
            })));
          } catch {
            setActivities([]);
          }
        } else {
          setActivities([]);
        }

        // Fetch pipeline stats for mini summary
        try {
          const pipeStats = await getPipelineStats();
          setPipelineStats(normalizePipelineStats(pipeStats));
        } catch {
          setPipelineStats(null);
        }
      } catch {
        setLoadError(true);
        setGrants([]);
        setRecommended([]);
        setCategoryDist(new Map());
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const formatDDay = (dateStr: string) => {
    const end = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '마감';
    if (diff === 0) return 'D-Day';
    return `D-${diff}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  // Skeleton loading
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
        <div className="mb-8">
          <div className="skeleton h-8 w-56 mb-2" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="premium-card p-6">
              <div className="flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <div className="skeleton h-3 w-24 mb-2" />
                  <div className="skeleton h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-6 w-40 mb-4" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-24 rounded-2xl mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          오늘의 공고
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{today}</p>
      </div>

      {loadError && (
        <div className="mb-6 premium-card p-4 text-sm text-red-600 dark:text-red-400">
          일부 데이터를 불러오지 못했습니다. 새로고침하거나 잠시 후 다시 시도해 주세요.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="premium-card flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">오늘의 알림 건수</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {stats.alertCount}
              <span className="text-sm font-medium text-gray-400 ml-1">건</span>
            </p>
          </div>
        </div>

        <div className="premium-card flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">평균 적합도 (참고)</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {stats.matchRate}
              <span className="text-sm font-medium text-gray-400 ml-1">%</span>
            </p>
          </div>
        </div>

        <div className="premium-card flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">관심 카테고리</p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white truncate">
              {stats.interestCategory}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Grants list */}
        <div className="lg:col-span-2 space-y-8">
          {/* 이번 주 마감 - Urgent Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                ⚡ 이번 주 마감 공고
              </h2>
            </div>

            <div className="space-y-3">
              {grants.filter((g) => isDeadlineWithinDays(g.applyEnd, 7)).slice(0, 2).map((grant) => {
                const tagColor = CATEGORY_COLORS[grant.category] || CATEGORY_COLORS['기타'];
                const dday = formatDDay(grant.applyEnd);
                return (
                  <Link
                    key={grant.id}
                    to={`/grants/${grant.id}`}
                    className="premium-card flex items-center justify-between group p-5 border-red-200 dark:border-red-900/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
                          {grant.category}
                        </span>
                        <span className="text-xs font-extrabold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                          {dday}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">
                        {grant.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {grant.organization}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(grant.applyEnd)} 마감
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 shrink-0 ml-4 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 추천 공고 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              <Sparkles className="w-5 h-5 inline mr-1 text-brand-500" />
              맞춤 추천 공고
            </h2>
            <div className="space-y-3">
              {recommended.length > 0 ? recommended.map((match) => {
                const tagColor = CATEGORY_COLORS[match.category || ''] || CATEGORY_COLORS['기타'];
                const scoreValue = match.score ?? match.matchScore ?? 0;
                return (
                  <Link
                    key={match.noticeId}
                    to={`/grants/${match.noticeId}`}
                    className="premium-card flex items-center justify-between group p-5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
                          {match.category || '기타'}
                        </span>
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          scoreValue >= 80
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          적합도 {scoreValue}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">
                        {match.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {match.organization}
                        </span>
                        {match.applyEnd && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(match.applyEnd)} 마감
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 shrink-0 ml-4 transition-colors" />
                  </Link>
                );
              }) : (
                <div className="premium-card p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {isLoggedIn()
                    ? '알림 설정(/alerts)에서 관심 카테고리·산업군을 저장하면 맞춤 공고가 표시됩니다.'
                    : '로그인 후 알림 설정을 저장하면 맞춤 공고를 추천해 드립니다.'}
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link to="/grants" className="btn btn-secondary">
              더 많은 공고 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 내 파이프라인 미리보기 */}
          {pipelineStats && pipelineStats.total > 0 && (
            <div className="premium-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  📋 내 파이프라인
                </h3>
                <Link
                  to="/pipeline"
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1"
                >
                  전체보기
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {pipelineStats.byStage
                  .filter((s) => ['reviewing', 'preparing', 'submitted', 'selected'].includes(s.stage))
                  .map((stage) => {
                    const dotColors: Record<string, string> = {
                      reviewing: 'bg-amber-500',
                      preparing: 'bg-blue-500',
                      submitted: 'bg-green-500',
                      selected: 'bg-cyan-500',
                    };
                    const labels: Record<string, string> = {
                      reviewing: '검토중',
                      preparing: '서류준비',
                      submitted: '제출완료',
                      selected: '선정',
                    };
                    return (
                      <div key={stage.stage} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[stage.stage] || 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {labels[stage.stage] || stage.stage}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {stage.count}건
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Distribution Chart */}
          <div className="premium-card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">카테고리 분포</h3>
            <div className="space-y-3">
              {Array.from(categoryDist.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cat}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{count}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CATEGORY_BAR_COLORS[cat] || 'bg-gray-400'} transition-all duration-700`}
                        style={{ width: `${count}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="premium-card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">최근 활동</h3>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">최근 알림 이력이 없습니다.</p>
              ) : activities.map((act, i) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      {ACTIVITY_ICONS[act.type] || <CheckCircle2 className="w-4 h-4 text-gray-400" />}
                    </div>
                    {i < activities.length - 1 && (
                      <div className="absolute top-8 left-4 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{act.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
