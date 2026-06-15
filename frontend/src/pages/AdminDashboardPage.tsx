import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Mail,
  Kanban,
  RefreshCw,
  Shield,
  Send,
  Database,
  Loader2,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminDashboard,
  triggerGrantSync,
  triggerNewsletterSend,
  deleteAdminUser,
  updateAdminUserPlan,
  type AdminDashboardData,
  type AdminSyncRun,
  type AdminUserSummary,
} from '../api/admin';

const SOURCE_LABELS: Record<string, string> = {
  BIZINFO: '기업마당',
  G2B: '나라장터 입찰',
  G2B_AWARD: '나라장터 낙찰',
  MSS: '중소벤처기업부',
  KSTARTUP: 'K-Startup',
  KITA: '한국무역협회',
  SBA: '서울경제진흥원',
  KOTRA: 'KOTRA',
  KISED: '창업진흥원',
  KOCCA: '한국콘텐츠진흥원',
  KOSME: '중소기업진흥공단',
};

function parseBySource(rows?: [string, number][]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of rows ?? []) {
    if (Array.isArray(row) && row.length >= 2) {
      map[String(row[0])] = Number(row[1]) || 0;
    }
  }
  return map;
}

const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [updatingPlanUserId, setUpdatingPlanUserId] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const dashboard = await getAdminDashboard();
      setData(dashboard);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      toast.error(status === 403 ? '관리자 권한이 없습니다.' : '관리자 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerGrantSync();
      toast.success('지원사업 동기화를 시작했습니다.');
      await loadDashboard();
    } catch {
      toast.error('동기화 요청에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const handleNewsletter = async () => {
    setSendingNewsletter(true);
    try {
      const result = await triggerNewsletterSend();
      const sent = (result as { sent?: number }).sent;
      toast.success(sent != null ? `뉴스레터 발송 완료 (${sent}건)` : '뉴스레터 발송을 요청했습니다.');
      await loadDashboard();
    } catch {
      toast.error('뉴스레터 발송에 실패했습니다.');
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handlePlanChange = async (user: AdminUserSummary, plan: string) => {
    if (user.role === 'ADMIN') return;
    setUpdatingPlanUserId(user.id);
    try {
      await updateAdminUserPlan(user.id, plan);
      toast.success(`${user.email} → ${plan}`);
      await loadDashboard();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '플랜 변경에 실패했습니다.');
    } finally {
      setUpdatingPlanUserId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUserSummary) => {
    if (user.role === 'ADMIN') {
      toast.error('관리자 계정은 삭제할 수 없습니다.');
      return;
    }
    const confirmed = window.confirm(
      `${user.name} (${user.email}) 회원을 삭제하시겠습니까?\n파이프라인·알림 데이터도 함께 삭제됩니다.`,
    );
    if (!confirmed) return;

    setDeletingUserId(user.id);
    try {
      const result = await deleteAdminUser(user.id);
      toast.success(`${result.email ?? user.email} 회원이 삭제되었습니다.`);
      await loadDashboard();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '회원 삭제에 실패했습니다.';
      toast.error(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="premium-card p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="premium-card p-6">
          <div className="skeleton h-6 w-40 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl mb-3" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: '전체 회원',
      value: data?.users.total ?? 0,
      sub: `관리자 ${data?.users.admins ?? 0}명`,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: '신청 가능 공고',
      value: data?.grants.active ?? 0,
      sub: `DB 전체 ${data?.grants.total ?? 0}건`,
      icon: FileText,
      color: 'text-indigo-500',
    },
    {
      label: '뉴스레터 구독',
      value: data?.newsletter.activeSubscribers ?? 0,
      sub: `누적 ${data?.newsletter.totalSubscribers ?? 0}명`,
      icon: Mail,
      color: 'text-amber-500',
    },
    {
      label: '파이프라인 항목',
      value: data?.pipeline.totalItems ?? 0,
      sub: '전체 사용자 합계',
      icon: Kanban,
      color: 'text-green-500',
    },
  ];

  const activeBySource = parseBySource(data?.sync?.bySource);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-brand-500" />
            관리자 대시보드
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            회원·공고·뉴스레터·동기화를 한곳에서 관리합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            지원사업 동기화
          </button>
          <button
            onClick={handleNewsletter}
            disabled={sendingNewsletter}
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            {sendingNewsletter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            뉴스레터 발송
          </button>
          <button onClick={loadDashboard} className="btn btn-secondary inline-flex items-center gap-2">
            <Database className="w-4 h-4" />
            새로고침
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="premium-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
                </div>
                <Icon className={`w-8 h-8 ${item.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        내 사업자 정보는{' '}
        <Link to="/mypage" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1">
          <User className="w-4 h-4" />
          마이페이지
        </Link>
        에서 수정할 수 있습니다.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="premium-card p-6 xl:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">최근 가입 회원</h2>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[860px] text-sm table-fixed">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-3 w-[88px] whitespace-nowrap">이름</th>
                  <th className="pb-2 pr-3 whitespace-nowrap">이메일</th>
                  <th className="pb-2 pr-3 w-[120px] whitespace-nowrap">회사</th>
                  <th className="pb-2 pr-3 w-[88px] whitespace-nowrap">플랜</th>
                  <th className="pb-2 pr-3 w-[72px] whitespace-nowrap">역할</th>
                  <th className="pb-2 pr-3 w-[96px] whitespace-nowrap">가입일</th>
                  <th className="pb-2 w-[72px] text-right whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentUsers ?? []).map((user: AdminUserSummary) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-3 font-medium text-gray-900 dark:text-white whitespace-nowrap truncate" title={user.name}>
                      {user.name}
                    </td>
                    <td className="py-3 pr-3 text-gray-600 dark:text-gray-300 truncate" title={user.email}>
                      {user.email}
                    </td>
                    <td className="py-3 pr-3 text-gray-600 dark:text-gray-300 truncate" title={user.companyName}>
                      {user.companyName || '—'}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {user.role === 'ADMIN' ? (
                        <span className="text-xs text-gray-400">admin</span>
                      ) : (
                        <select
                          value={user.plan || 'free'}
                          disabled={updatingPlanUserId === user.id}
                          onChange={(e) => void handlePlanChange(user, e.target.value)}
                          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1"
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                          <option value="enterprise">enterprise</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {user.role === 'ADMIN' ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-gray-500 whitespace-nowrap">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {user.role === 'ADMIN' ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={deletingUserId === user.id}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 whitespace-nowrap"
                          title="회원 삭제"
                        >
                          {deletingUserId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="hidden sm:inline">삭제</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.recentUsers?.length ?? 0) === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center">가입 회원이 없습니다.</p>
            )}
          </div>
        </section>

        <section className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">소스별 활성 공고</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            사용자에게 보이는 건수입니다. 마감 지난 공고는 포함되지 않습니다.
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Object.entries(activeBySource).map(([source, count]) => (
              <div
                key={source}
                className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {SOURCE_LABELS[source] ?? source}
                  <span className="ml-1.5 text-xs text-gray-400">{source}</span>
                </span>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {count.toLocaleString()}건
                </span>
              </div>
            ))}
            {Object.keys(activeBySource).length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">데이터 없음</p>
            )}
          </div>
        </section>

        <section className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">최근 동기화 이력</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            「생성」은 그 실행에서 DB에 새로 넣은 건수입니다. 활성 공고 수와 다를 수 있습니다.
          </p>
          <div className="max-h-[min(50vh,420px)] overflow-y-auto overflow-x-hidden pr-1 -mr-1 space-y-3">
            {(data?.recentSyncRuns ?? []).map((run: AdminSyncRun) => {
              const activeNow = activeBySource[run.source];
              return (
              <div
                key={run.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {SOURCE_LABELS[run.source] ?? run.source}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    이번 실행 · 조회 {run.fetched ?? 0} · 신규 {run.created ?? 0} · 수정 {run.updated ?? 0} · 실패 {run.failed ?? 0}
                  </p>
                  {activeNow != null && (
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                      현재 활성 {activeNow.toLocaleString()}건
                    </p>
                  )}
                  {run.message && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{run.message}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      run.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : run.status === 'RUNNING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {run.status}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {run.startedAt ? new Date(run.startedAt).toLocaleString('ko-KR') : '-'}
                  </p>
                </div>
              </div>
            );
            })}
            {(data?.recentSyncRuns?.length ?? 0) === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center">동기화 이력이 없습니다.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
