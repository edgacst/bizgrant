import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Building2,
  Save,
  Loader2,
  Bookmark,
  Kanban,
  FolderOpen,
  Sparkles,
  Mail,
  Shield,
  ChevronRight,
  Settings,
  Pencil,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMe, updateProfile } from '../api/auth';
import { formatLimit } from '../api/plan';
import { usePlan } from '../hooks/usePlan';
import PlanUpgradeHint from '../components/PlanUpgradeHint';
import { syncAuthSession } from '../utils/authSession';
import type { UpdateProfileForm, User as UserType } from '../types';

const INDUSTRIES = [
  'IT/소프트웨어',
  '제조/하드웨어',
  '서비스/유통',
  '건설/인테리어',
  '교육/컨설팅',
  '바이오/헬스케어',
  '문화/콘텐츠',
  '프리랜서/개인',
];

const COMPANY_SIZES = ['개인/1인', '10인 미만', '50인 미만', '100인 미만', '100인 이상'];

const QUICK_LINKS = [
  { path: '/bookmarks', label: '북마크', icon: Bookmark, desc: '저장한 공고' },
  { path: '/alerts', label: '알림 설정', icon: Settings, desc: '이메일·채널 알림' },
  { path: '/pipeline', label: '파이프라인', icon: Kanban, desc: '지원 진행 관리' },
  { path: '/documents', label: '서류센터', icon: FolderOpen, desc: '템플릿·보관함' },
];

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit < 0;
  const pct = unlimited ? 0 : limit === 0 ? 100 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = !unlimited && pct >= 80;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`font-semibold ${nearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
          {used.toLocaleString()}
          {!unlimited && ` / ${formatLimit(limit)}`}
          {unlimited && ' / 무제한'}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${nearLimit ? 'bg-amber-500' : 'bg-brand-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

const MyPage: React.FC = () => {
  const { planInfo, limits, usage, loading: planLoading, isProOrAbove } = usePlan();
  const [account, setAccount] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<UpdateProfileForm>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const applyAccountToProfile = (me: UserType) => ({
    name: me.name,
    phone: me.phone,
    companyName: me.companyName,
    bizNumber: me.bizNumber,
    industry: me.industry,
    companySize: me.companySize,
  });

  const loadAccount = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getMe();
      setAccount(me);
      setProfile(applyAccountToProfile(me));
      setEditing(false);
    } catch {
      toast.error('계정 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editing) return;
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEditing = () => {
    if (account) {
      setProfile(applyAccountToProfile(account));
    }
    setEditing(true);
  };

  const cancelEditing = () => {
    if (account) {
      setProfile(applyAccountToProfile(account));
    }
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(profile);
      setAccount(updated);
      setProfile(applyAccountToProfile(updated));
      setEditing(false);
      await syncAuthSession();
      toast.success('사업자 정보가 저장되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const planLabel = planInfo.planLabel || planInfo.plan;
  const isAdmin = account?.role === 'ADMIN';
  const fieldClass = (extra = '') =>
    `input w-full mt-1 ${extra} ${editing ? '' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 cursor-default'}`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-7 h-7 text-brand-500" />
          마이페이지
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          계정·사업자 정보와 플랜 사용량을 관리합니다.
        </p>
      </div>

      {/* Account summary */}
      <section className="premium-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {account?.name || '회원'}
              </h2>
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {planLabel}
              </span>
              {isAdmin && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  관리자
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 truncate">
              <Mail className="w-4 h-4 shrink-0" />
              {account?.email}
            </p>
            {account?.companyName && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 shrink-0 text-brand-500" />
                {account.companyName}
              </p>
            )}
          </div>
          <Link to="/pricing" className="btn btn-secondary text-sm shrink-0 self-start">
            요금제 보기
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Plan usage */}
        <section className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-500" />
            플랜 사용량
          </h2>
          {planLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-8 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <UsageMeter label="북마크" used={usage?.bookmarks ?? 0} limit={limits.maxBookmarks} />
              <UsageMeter label="파이프라인" used={usage?.pipelineItems ?? 0} limit={limits.maxPipelineItems} />
              <UsageMeter label="오늘 발송 알림" used={usage?.alertsSentToday ?? 0} limit={limits.maxDailyAlerts} />
              <UsageMeter label="서류 보관함" used={usage?.userFiles ?? 0} limit={limits.maxUserFiles} />
            </div>
          )}
          {!isProOrAbove && (
            <div className="mt-4">
              <PlanUpgradeHint
                compact
                message="Pro에서는 파이프라인·북마크·알림 한도가 크게 늘어납니다."
                requiredPlan="Pro"
              />
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">바로가기</h2>
          <div className="space-y-2">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{link.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">관리자 대시보드</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">회원·동기화·뉴스레터</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
              </Link>
            )}
          </div>
        </section>
      </div>

      {/* Business profile */}
      <section className="premium-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              사업자 정보
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              맞춤 추천·서류 자동완성에 사용됩니다. 이메일은 가입 시 설정되어 변경할 수 없습니다.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  저장
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                수정
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-gray-500">이메일</span>
            <input value={account?.email ?? ''} readOnly className="input w-full mt-1 bg-gray-50 dark:bg-gray-900/50 text-gray-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">대표자명</span>
            <input
              name="name"
              value={profile.name ?? ''}
              onChange={handleProfileChange}
              readOnly={!editing}
              className={fieldClass()}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">회사명</span>
            <input
              name="companyName"
              value={profile.companyName ?? ''}
              onChange={handleProfileChange}
              readOnly={!editing}
              className={fieldClass()}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">사업자번호</span>
            <input
              name="bizNumber"
              value={profile.bizNumber ?? ''}
              onChange={handleProfileChange}
              readOnly={!editing}
              className={fieldClass()}
              placeholder="10자리 숫자"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">연락처</span>
            <input
              name="phone"
              value={profile.phone ?? ''}
              onChange={handleProfileChange}
              readOnly={!editing}
              className={fieldClass()}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">업종</span>
            <select
              name="industry"
              value={profile.industry ?? INDUSTRIES[0]}
              onChange={handleProfileChange}
              disabled={!editing}
              className={fieldClass()}
            >
              {INDUSTRIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-gray-500">회사 규모</span>
            <select
              name="companySize"
              value={profile.companySize ?? COMPANY_SIZES[0]}
              onChange={handleProfileChange}
              disabled={!editing}
              className={fieldClass()}
            >
              {COMPANY_SIZES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        {!limits.templateAutofillEnabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Word 템플릿 자동완성은 Pro 플랜부터 이용할 수 있습니다.{' '}
            <Link to="/documents" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              서류센터
            </Link>
            에서 템플릿을 확인하세요.
          </p>
        )}
      </section>
    </div>
  );
};

export default MyPage;
