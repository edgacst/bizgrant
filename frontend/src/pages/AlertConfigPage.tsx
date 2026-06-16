import React, { useEffect, useState } from 'react';
import {
  Save,
  Bell,
  Mail,
  MessageCircle,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Pencil,
  X,
  Trash2,
  Hash,
  Send,
  Webhook,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import {
  deleteAlertHistory,
  deleteAlertHistoryBatch,
  formatAlertChannel,
  notifyAlertHistoryUpdated,
} from '../api/alerts';
import type { AlertPrefForm, AlertHistory } from '../types';
import { usePlan } from '../hooks/usePlan';
import { formatLimit, isUnlimited } from '../api/plan';
import PlanUpgradeHint from '../components/PlanUpgradeHint';

const ALL_CATEGORIES = ['R&D', '창업', '수출', '제조혁신', '인력', '마케팅', '기타'];
const ALL_INDUSTRIES = [
  'IT/소프트웨어', '제조/하드웨어', '서비스/유통', '건설/인테리어',
  '교육/컨설팅', '바이오/헬스케어', '문화/콘텐츠', '프리랜서/개인',
];

const MAX_BUDGET = 1_000_000_000;
const BUDGET_STEP = 1_000_000;
const BUDGET_PRESETS = [0, 10_000_000, 50_000_000, 100_000_000, 500_000_000, MAX_BUDGET];

const DEFAULT_FORM: AlertPrefForm = {
  categories: ['R&D', '창업'],
  industries: ['IT/소프트웨어'],
  minBudget: 10_000_000,
  channel: 'email',
  channelId: '',
  enabled: true,
};

const COMING_SOON_TOAST = '카카오톡·문자 알림은 추후 연동 예정입니다. 이메일 또는 Slack·Telegram·Webhook을 이용해 주세요.';

function normalizeChannel(channel?: string): AlertPrefForm['channel'] {
  switch ((channel ?? 'email').toLowerCase()) {
    case 'slack':
      return 'slack';
    case 'telegram':
      return 'telegram';
    case 'webhook':
      return 'webhook';
    case 'kakao':
    case 'sms':
      return 'email';
    default:
      return 'email';
  }
}

const ALERT_CHANNELS: Array<{
  value: AlertPrefForm['channel'];
  label: string;
  icon: typeof Mail;
  proOnly?: boolean;
  comingSoon?: boolean;
}> = [
  { value: 'email', label: '이메일', icon: Mail },
  { value: 'kakao', label: '카카오톡', icon: MessageCircle, comingSoon: true },
  { value: 'sms', label: '문자', icon: Smartphone, comingSoon: true },
  { value: 'slack', label: 'Slack', icon: Hash, proOnly: true },
  { value: 'telegram', label: 'Telegram', icon: Send, proOnly: true },
  { value: 'webhook', label: 'Webhook', icon: Webhook, proOnly: true },
];

function parsePrefs(prefs: Record<string, unknown>): AlertPrefForm {
  return {
    categories: (typeof prefs.categories === 'string'
      ? prefs.categories.split(',')
      : (prefs.categories as string[])) || [],
    industries: (typeof prefs.industries === 'string'
      ? prefs.industries.split(',')
      : (prefs.industries as string[])) || [],
    minBudget: Math.min(Number(prefs.minBudget) || DEFAULT_FORM.minBudget, MAX_BUDGET),
    channel: normalizeChannel(prefs.channel as string),
    channelId: (prefs.channelId as string) || '',
    enabled: prefs.enabled !== undefined ? Boolean(prefs.enabled) : true,
  };
}

function budgetTrackStyle(value: number) {
  const pct = Math.min(100, Math.max(0, (value / MAX_BUDGET) * 100));
  return {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
  } as React.CSSProperties;
}

const AlertConfigPage: React.FC = () => {
  const { planInfo, limits, usage } = usePlan();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(true);
  const [hasSavedPrefs, setHasSavedPrefs] = useState(false);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);
  const [form, setForm] = useState<AlertPrefForm>(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState<AlertPrefForm>(DEFAULT_FORM);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await client.get('/prefs');
        const prefs = res.data;
        if (prefs) {
          const parsed = parsePrefs(prefs);
          setForm(parsed);
          setSavedForm(parsed);
          setHasSavedPrefs(true);
          setEditing(false);
        } else {
          setForm(DEFAULT_FORM);
          setSavedForm(DEFAULT_FORM);
          setHasSavedPrefs(false);
          setEditing(true);
        }
      } catch {
        setEditing(true);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await client.get('/history');
        setHistory(res.data || []);
      } catch {
        setHistory([]);
      }
    };

    Promise.all([fetchPrefs(), fetchHistory()]).finally(() => setLoading(false));
  }, []);

  const handleDeleteOne = async (id: number) => {
    if (!id) {
      toast.error('삭제할 알림 ID가 없습니다. 페이지를 새로고침해주세요.');
      return;
    }
    if (!window.confirm('이 알림 이력을 삭제할까요?')) return;
    setDeletingId(id);
    try {
      await deleteAlertHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      notifyAlertHistoryUpdated();
      toast.success('알림 이력을 삭제했습니다.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast.error('삭제 API를 찾을 수 없습니다. 백엔드를 최신 코드로 재시작해주세요.');
      } else {
        toast.error(msg || '삭제에 실패했습니다.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`알림 이력 ${history.length}건을 모두 삭제할까요?`)) return;
    setDeletingAll(true);
    try {
      const deleted = await deleteAlertHistoryBatch({ all: true });
      if (deleted === 0 && history.length > 0) {
        toast.error('삭제된 항목이 없습니다. 백엔드를 재시작했는지 확인해주세요.');
        return;
      }
      setHistory([]);
      notifyAlertHistoryUpdated();
      toast.success('알림 이력을 모두 삭제했습니다.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast.error('삭제 API를 찾을 수 없습니다. 백엔드를 최신 코드로 재시작해주세요.');
      } else {
        toast.error(msg || '전체 삭제에 실패했습니다.');
      }
    } finally {
      setDeletingAll(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (!editing) return;
    setForm(prev => {
      if (!prev.categories.includes(cat) && !isUnlimited(limits.maxAlertCategories)
          && prev.categories.length >= limits.maxAlertCategories) {
        toast.error(`관심 카테고리는 ${limits.maxAlertCategories}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return {
        ...prev,
        categories: prev.categories.includes(cat)
          ? prev.categories.filter(c => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const toggleIndustry = (ind: string) => {
    if (!editing) return;
    setForm(prev => {
      if (!prev.industries.includes(ind) && !isUnlimited(limits.maxAlertIndustries)
          && prev.industries.length >= limits.maxAlertIndustries) {
        toast.error(`관심 업종은 ${limits.maxAlertIndustries}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return {
        ...prev,
        industries: prev.industries.includes(ind)
          ? prev.industries.filter(i => i !== ind)
          : [...prev.industries, ind],
      };
    });
  };

  const startEditing = () => {
    setForm(savedForm);
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(hasSavedPrefs ? savedForm : DEFAULT_FORM);
    setEditing(!hasSavedPrefs);
  };

  const handleSave = async () => {
    if (form.channel === 'kakao' || form.channel === 'sms') {
      toast(COMING_SOON_TOAST, { icon: 'ℹ️' });
      return;
    }
    if (!limits.allowedAlertChannels.includes(form.channel)) {
      toast.error(`${formatAlertChannel(form.channel)} 알림은 Pro 이상에서 설정할 수 있습니다.`);
      return;
    }
    if ((form.channel === 'slack' || form.channel === 'webhook') && !/^https?:\/\//i.test(form.channelId.trim())) {
      toast.error('Webhook URL(https://...)을 입력해 주세요.');
      return;
    }
    if (form.channel === 'telegram' && !form.channelId.trim()) {
      toast.error('Telegram Chat ID를 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        categories: form.categories.join(','),
        industries: form.industries.join(','),
      };
      await client.post('/prefs', payload).catch(() => client.put('/prefs', payload));
      setSavedForm(form);
      setHasSavedPrefs(true);
      setEditing(false);
      toast.success('알림 설정이 저장되었습니다.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async () => {
    if (!hasSavedPrefs) {
      toast.error('알림 설정을 먼저 저장해 주세요.');
      return;
    }
    setTestingAlert(true);
    try {
      const res = await client.post<{ success: boolean; message: string }>('/alerts/test');
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '테스트 알림 발송에 실패했습니다.');
    } finally {
      setTestingAlert(false);
    }
  };

  const formatBudget = (amount: number) => {
    if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(amount % 100_000_000 === 0 ? 0 : 1)}억원`;
    if (amount >= 10_000) return `${(amount / 10_000).toFixed(0)}만원`;
    return `${amount.toLocaleString()}원`;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case 'sent': return '전송 완료';
      case 'failed': return '전송 실패';
      case 'pending': return '대기 중';
      default: return status;
    }
  };

  const fieldLocked = !editing;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="skeleton h-8 w-40" />
        <div className="premium-card p-8 space-y-6">
          <div className="skeleton h-6 w-32" />
          <div className="flex gap-2">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-10 w-20 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          <Bell className="w-7 h-7 inline mr-2 text-brand-500" />
          알림 설정
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {planInfo.planLabel} · 카테고리 {form.categories.length}/{formatLimit(limits.maxAlertCategories)}
          · 일일 알림 {usage?.alertsSentToday ?? 0}/{formatLimit(limits.maxDailyAlerts)}
        </p>
      </div>

      {planInfo.plan === 'free' && (
        <PlanUpgradeHint
          compact
          message="Pro에서는 Slack·Telegram·Webhook 알림과 일일 알림 30건을 사용할 수 있습니다."
          requiredPlan="Pro"
        />
      )}

      <div className="premium-card mb-8">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              알림 기본 설정
            </h2>
            <div className="flex items-center gap-2 self-start">
              {editing ? (
                <>
                  {hasSavedPrefs && (
                    <button type="button" onClick={cancelEditing} disabled={saving} className="btn btn-secondary inline-flex items-center gap-2">
                      <X className="w-4 h-4" />
                      취소
                    </button>
                  )}
                  <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn btn-primary inline-flex items-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    알림 설정 저장
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void handleTestAlert()}
                    disabled={testingAlert || !hasSavedPrefs}
                    className="btn btn-secondary inline-flex items-center gap-2"
                  >
                    {testingAlert ? (
                      <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    테스트 발송
                  </button>
                  <button type="button" onClick={startEditing} className="btn btn-secondary inline-flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    알림설정수정
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={`space-y-6 ${fieldLocked ? 'opacity-90' : ''}`}>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">알림 활성화</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">전체 알림 수신 여부</p>
              </div>
              <button
                type="button"
                disabled={fieldLocked}
                onClick={() => setForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative w-12 h-7 rounded-full transition-colors disabled:cursor-default ${form.enabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.enabled ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                관심 카테고리
                <span className="ml-2 text-xs font-normal text-gray-500">(최대 {formatLimit(limits.maxAlertCategories)})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    disabled={fieldLocked}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:cursor-default ${
                      form.categories.includes(cat)
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-300'
                    }`}
                  >{cat}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                관심 업종
                <span className="ml-2 text-xs font-normal text-gray-500">(최대 {formatLimit(limits.maxAlertIndustries)})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    type="button"
                    disabled={fieldLocked}
                    onClick={() => toggleIndustry(ind)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:cursor-default ${
                      form.industries.includes(ind)
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-300'
                    }`}
                  >{ind}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                최소 지원금액: <span className="gradient-text font-extrabold">{formatBudget(form.minBudget)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={MAX_BUDGET}
                step={BUDGET_STEP}
                value={form.minBudget}
                disabled={fieldLocked}
                onChange={e => setForm(prev => ({ ...prev, minBudget: Number(e.target.value) }))}
                style={budgetTrackStyle(form.minBudget)}
                className="budget-range w-full h-2 rounded-lg appearance-none cursor-pointer disabled:cursor-default disabled:opacity-70"
              />
              <div className="flex flex-wrap justify-between gap-1 mt-2">
                {BUDGET_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    disabled={fieldLocked}
                    onClick={() => setForm(prev => ({ ...prev, minBudget: preset }))}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all disabled:cursor-default ${
                      form.minBudget === preset
                        ? 'bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >{formatBudget(preset)}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Free는 이메일만, Pro 이상은 Slack·Telegram·Webhook을 설정할 수 있습니다. 카카오톡·문자는 추후 연동 예정입니다.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALERT_CHANNELS.map(ch => {
                  const Icon = ch.icon;
                  const allowed = !ch.comingSoon && limits.allowedAlertChannels.includes(ch.value);
                  const selectable = allowed && !fieldLocked;
                  return (
                    <button
                      key={ch.value}
                      type="button"
                      disabled={fieldLocked && !ch.comingSoon && !allowed}
                      onClick={() => {
                        if (fieldLocked) return;
                        if (ch.comingSoon) {
                          toast(COMING_SOON_TOAST, { icon: 'ℹ️' });
                          return;
                        }
                        if (!allowed) return;
                        setForm(prev => ({ ...prev, channel: ch.value, channelId: '' }));
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        ch.comingSoon
                          ? 'opacity-60 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 text-gray-400 cursor-pointer hover:opacity-80'
                          : !allowed
                          ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400'
                          : selectable && form.channel === ch.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${form.channel === ch.value ? 'text-brand-600' : ''}`} />
                      <span className="text-sm font-bold">{ch.label}</span>
                      {ch.comingSoon && (
                        <span className="text-[10px] font-semibold text-gray-400">추후 연동</span>
                      )}
                      {ch.proOnly && !allowed && !ch.comingSoon && (
                        <span className="text-[10px] font-semibold text-gray-400">Pro</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {(form.channel === 'slack' || form.channel === 'webhook') && (
              <label className="block">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Incoming Webhook URL</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-1">Slack 또는 사내 시스템 Webhook 주소</p>
                <input
                  value={form.channelId}
                  onChange={e => setForm(prev => ({ ...prev, channelId: e.target.value }))}
                  readOnly={fieldLocked}
                  placeholder="https://hooks.slack.com/services/..."
                  className={`input w-full ${fieldLocked ? 'bg-gray-50 dark:bg-gray-900/50 cursor-default' : ''}`}
                />
              </label>
            )}

            {form.channel === 'telegram' && (
              <label className="block">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Telegram Chat ID</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-1">봇 연동 후 수신할 채팅 ID</p>
                <input
                  value={form.channelId}
                  onChange={e => setForm(prev => ({ ...prev, channelId: e.target.value }))}
                  readOnly={fieldLocked}
                  placeholder="-1001234567890"
                  className={`input w-full ${fieldLocked ? 'bg-gray-50 dark:bg-gray-900/50 cursor-default' : ''}`}
                />
              </label>
            )}

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-500 shrink-0" />
                채널별 설정 방법
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm leading-relaxed">
                <li><strong>이메일</strong> — 가입 이메일로 발송 (서버 SMTP 설정)</li>
                <li><strong>Slack</strong> — Incoming Webhooks URL 붙여넣기 (Pro 이상)</li>
                <li><strong>Webhook</strong> — n8n·디스코드 등 수신 URL (JSON POST, Pro 이상)</li>
                <li><strong>Telegram</strong> — 서버에 봇 토큰 + Chat ID (Pro 이상)</li>
                <li><strong>카카오톡·문자</strong> — 추후 연동 예정</li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                저장 후 「테스트 발송」으로 수신 여부를 확인하세요. 매일 오전 9시경 새 맞춤 공고가 있으면 발송됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">알림 이력</h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => void handleDeleteAll()}
                disabled={deletingAll}
                className="btn btn-secondary text-sm text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 self-start"
              >
                {deletingAll ? (
                  <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                전체 삭제
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">아직 발송된 알림이 없습니다.</p>
          ) : (
            <div className="max-h-[min(50vh,420px)] overflow-y-auto overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                    <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">날짜</th>
                    <th className="py-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">공고명</th>
                    <th className="py-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">채널</th>
                    <th className="py-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">상태</th>
                    <th className="py-3 pr-4 font-semibold text-gray-500 dark:text-gray-400 w-12">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <tr
                      key={item.id || i}
                      className={i < history.length - 1 ? 'border-b border-gray-50 dark:border-gray-800/50' : ''}
                    >
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(item.sentAt ?? item.date ?? '').toLocaleDateString('ko-KR', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-900 dark:text-white">
                        {item.noticeTitle || '—'}
                        {item.organization && (
                          <span className="block text-xs text-gray-500 mt-0.5">{item.organization}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatAlertChannel(item.channel)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                          item.status === 'sent' ? 'text-green-600' : item.status === 'failed' ? 'text-red-500' : 'text-yellow-600'
                        }`}>
                          {statusIcon(item.status)}
                          {statusText(item.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => void handleDeleteOne(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          title="삭제"
                          aria-label="알림 이력 삭제"
                        >
                          {deletingId === item.id ? (
                            <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertConfigPage;
