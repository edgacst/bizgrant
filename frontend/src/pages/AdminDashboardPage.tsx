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
  Megaphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminDashboard,
  triggerGrantSync,
  triggerNewsletterSend,
  sendMemberAnnouncement,
  deleteAdminUser,
  updateAdminUserPlan,
  searchAdminUsers,
  listAdminUsers,
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
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState<AdminUserSummary[]>([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [announcementSubject, setAnnouncementSubject] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const planSelectValue = (plan?: string) =>
    (['free', 'pro', 'enterprise'].includes(plan || '') ? plan : 'free') as string;

  const renderPlanSelect = (user: AdminUserSummary) => (
    <div className="space-y-1 max-w-full">
      <select
        value={planSelectValue(user.plan)}
        disabled={updatingPlanUserId === user.id}
        onChange={(e) => void handlePlanChange(user, e.target.value)}
        className="block w-full max-w-[7.5rem] text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1"
        aria-label={`${user.email} 플랜`}
      >
        <option value="free">free</option>
        <option value="pro">pro</option>
        <option value="enterprise">enterprise</option>
      </select>
      {user.role === 'ADMIN' && (
        <p className="text-[10px] text-gray-400 leading-tight whitespace-nowrap">관리자·기능 전체</p>
      )}
    </div>
  );

  const recentUsersColGroup = (
    <colgroup>
      <col className="w-[4.5rem]" />
      <col />
      <col className="w-[7.5rem]" />
      <col className="w-[8.5rem]" />
      <col className="w-[4.5rem]" />
      <col className="w-[6.5rem]" />
      <col className="w-[4rem]" />
    </colgroup>
  );

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
      toast.success('정부지원금사업 동기화를 시작했습니다.');
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

  const handleMemberAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const subject = announcementSubject.trim();
    const message = announcementMessage.trim();
    if (!subject || !message) {
      toast.error('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    const memberCount = data?.users.total ?? 0;
    const confirmed = window.confirm(
      `가입 회원 ${memberCount}명에게 공지 메일을 보냅니다.\n\n제목: ${subject}\n\n계속할까요?`,
    );
    if (!confirmed) return;

    setSendingAnnouncement(true);
    try {
      const result = await sendMemberAnnouncement(subject, message);
      if (result.failed > 0) {
        toast.error(`발송 완료 ${result.sent}건, 실패 ${result.failed}건`);
      } else {
        toast.success(`전체 회원 공지 발송 완료 (${result.sent}건)`);
      }
      setAnnouncementSubject('');
      setAnnouncementMessage('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '공지 발송에 실패했습니다.');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handlePlanChange = async (user: AdminUserSummary, plan: string) => {
    setUpdatingPlanUserId(user.id);
    try {
      await updateAdminUserPlan(user.id, plan);
      toast.success(`${user.email} → ${plan}`);
      await loadDashboard();
      setMemberResults((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, plan } : u)),
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '플랜 변경에 실패했습니다.');
    } finally {
      setUpdatingPlanUserId(null);
    }
  };

  const handleMemberSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMemberSearchLoading(true);
    try {
      const q = memberSearch.trim();
      const users = q ? await searchAdminUsers(q, 30) : await listAdminUsers(30);
      setMemberResults(users);
      if (users.length === 0) {
        toast.error('검색 결과가 없습니다.');
      }
    } catch {
      toast.error('회원 검색에 실패했습니다.');
    } finally {
      setMemberSearchLoading(false);
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
            정부지원금사업 동기화
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
        <section className="premium-card p-6 xl:col-span-2 border-2 border-amber-100 dark:border-amber-900/30">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            전체 회원 공지 발송
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <strong className="text-gray-700 dark:text-gray-200">가입 회원 전원</strong>에게 이메일 공지를 보냅니다.
            뉴스레터(푸터 구독자)나 맞춤 알림과는 별개입니다. 현재 회원{' '}
            <strong>{(data?.users.total ?? 0).toLocaleString()}명</strong> · SMTP 설정 필요.
          </p>
          <form onSubmit={(e) => void handleMemberAnnouncement(e)} className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">제목</span>
              <input
                type="text"
                value={announcementSubject}
                onChange={(e) => setAnnouncementSubject(e.target.value)}
                maxLength={200}
                placeholder="예: [BizGrant] 서비스 점검 안내"
                className="input-premium w-full mt-1"
                disabled={sendingAnnouncement}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">내용</span>
              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="회원에게 전달할 공지 내용을 입력하세요."
                className="input-premium w-full mt-1 resize-y min-h-[8rem]"
                disabled={sendingAnnouncement}
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={sendingAnnouncement}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                {sendingAnnouncement ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Megaphone className="w-4 h-4" />
                )}
                전체 회원에게 발송
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                발송 전 확인 창이 뜹니다. 되돌릴 수 없으니 내용을 꼭 확인하세요.
              </p>
            </div>
          </form>
        </section>

        <section className="premium-card p-6 xl:col-span-2 border-2 border-brand-100 dark:border-brand-900/40">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">회원 플랜 변경</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            이메일로 회원을 찾은 뒤 <strong className="text-gray-700 dark:text-gray-200">free / pro / enterprise</strong>를 선택하세요.
            관리자 계정도 변경할 수 있으며, 관리자는 기능이 전체 적용됩니다.
          </p>
          <form onSubmit={(e) => void handleMemberSearch(e)} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="search"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="이메일 검색 (예: freecompr20@gmail.com)"
              className="input-premium flex-1"
            />
            <button type="submit" disabled={memberSearchLoading} className="btn btn-primary shrink-0">
              {memberSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
            </button>
            <button
              type="button"
              onClick={() => void handleMemberSearch()}
              disabled={memberSearchLoading}
              className="btn btn-secondary shrink-0"
            >
              전체 목록
            </button>
          </form>
          {memberResults.length > 0 && (
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[640px] text-sm table-fixed">
                <colgroup>
                  <col />
                  <col className="w-[5.5rem]" />
                  <col className="w-[8.5rem]" />
                  <col className="w-[4.5rem]" />
                </colgroup>
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 pr-3 font-medium">이메일</th>
                    <th className="pb-2 pr-3 font-medium">이름</th>
                    <th className="pb-2 pr-3 font-medium">플랜</th>
                    <th className="pb-2 font-medium">역할</th>
                  </tr>
                </thead>
                <tbody>
                  {memberResults.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 align-top">
                      <td className="py-3 pr-3 truncate align-top" title={user.email}>{user.email}</td>
                      <td className="py-3 pr-3 whitespace-nowrap align-top">{user.name}</td>
                      <td className="py-3 pr-3 align-top">{renderPlanSelect(user)}</td>
                      <td className="py-3 text-gray-500 align-top">{user.role === 'ADMIN' ? '관리자' : '일반'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="premium-card p-6 xl:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">최근 가입 회원</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            표에서 <strong>플랜</strong> 열 드롭다운을 바꾸면 즉시 저장됩니다.
          </p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[860px] text-sm table-fixed">
              {recentUsersColGroup}
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-3 font-medium whitespace-nowrap">이름</th>
                  <th className="pb-2 pr-3 font-medium whitespace-nowrap">이메일</th>
                  <th className="pb-2 pr-3 font-medium whitespace-nowrap">회사</th>
                  <th className="pb-2 pr-3 font-medium whitespace-nowrap">플랜</th>
                  <th className="pb-2 pr-3 font-medium whitespace-nowrap">역할</th>
                  <th className="pb-2 pr-3 font-medium whitespace-nowrap">가입일</th>
                  <th className="pb-2 pr-3 font-medium text-right whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentUsers ?? []).map((user: AdminUserSummary) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 align-top">
                    <td className="py-3 pr-3 font-medium text-gray-900 dark:text-white whitespace-nowrap truncate align-top" title={user.name}>
                      {user.name}
                    </td>
                    <td className="py-3 pr-3 text-gray-600 dark:text-gray-300 truncate align-top" title={user.email}>
                      {user.email}
                    </td>
                    <td className="py-3 pr-3 text-gray-600 dark:text-gray-300 truncate align-top" title={user.companyName}>
                      {user.companyName || '—'}
                    </td>
                    <td className="py-3 pr-3 align-top">
                      {renderPlanSelect(user)}
                    </td>
                    <td className="py-3 pr-3 align-top">
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
                    <td className="py-3 pr-3 text-gray-500 whitespace-nowrap align-top">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="py-3 pr-3 text-right align-top">
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
