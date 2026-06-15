import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Tag,
  Users,
  Briefcase,
  BarChart3,
  Sparkles,
  PlusSquare,
  FileText,
  CheckCircle,
  Bookmark,
  Share2,
  Download,
  ChevronUp,
  AlertCircle,
  Target,
  FileDown,
  Paperclip,
  Link2,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { addToPipeline } from '../api/pipeline';
import { addBookmark, checkBookmark, removeBookmark } from '../api/bookmarks';
import {
  downloadDocumentTemplate,
  getGrantChecklist,
  getUserFiles,
  updateGrantChecklist,
} from '../api/documents';
import { exportGrantPdf } from '../utils/exportGrantPdf';
import { isLoggedIn } from '../utils/authSession';
import { usePlan } from '../hooks/usePlan';
import PlanUpgradeHint from '../components/PlanUpgradeHint';
import GrantCard from '../components/GrantCard';
import type { GrantChecklist, GrantDocumentItem, GrantNotice, MatchingScore, UserFileItem } from '../types';

const mapGrantResponse = (data: GrantNotice & { url?: string }): GrantNotice => ({
  ...data,
  originalUrl: data.originalUrl || data.url || '',
});

const CATEGORY_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '창업': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '수출': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '제조혁신': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '인력': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '마케팅': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '기타': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const GrantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { limits, usage, refresh } = usePlan();
  const [grant, setGrant] = useState<GrantNotice | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [matchScore, setMatchScore] = useState<MatchingScore | null>(null);
  const [related, setRelated] = useState<GrantNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [grantChecklist, setGrantChecklist] = useState<GrantChecklist | null>(null);
  const [userFiles, setUserFiles] = useState<UserFileItem[]>([]);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchGrant = async () => {
      try {
        const res = await client.get(`/grants/${id}`);
        setGrant(mapGrantResponse(res.data));
        setFetchError(false);
      } catch {
        setGrant(null);
        setFetchError(true);
      }
    };

    const fetchScores = async () => {
      try {
        const res = await client.get('/grants/scores', { params: { ids: id } });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMatchScore(res.data[0]);
        }
      } catch {
        setMatchScore(null);
      }
    };

    const fetchRelated = async () => {
      try {
        const res = await client.get(`/grants/${id}/related`);
        setRelated(res.data.content || res.data || []);
      } catch {
        setRelated([]);
      }
    };

    Promise.all([fetchGrant(), fetchScores(), fetchRelated()]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const loadChecklist = async () => {
      try {
        const data = await getGrantChecklist(Number(id));
        setGrantChecklist(data);
      } catch {
        if (grant?.requirements) {
          setGrantChecklist({
            grantId: Number(id),
            requirementsRaw: grant.requirements,
            items: [],
            checkedKeys: [],
            attachments: {},
            totalCount: 0,
            checkedCount: 0,
          });
        } else {
          setGrantChecklist(null);
        }
      }
    };
    loadChecklist();
  }, [id, grant?.requirements]);

  useEffect(() => {
    if (!isLoggedIn()) return;
    getUserFiles().then(setUserFiles).catch(() => setUserFiles([]));
  }, []);

  useEffect(() => {
    if (!isLoggedIn() || !id) {
      setBookmarked(false);
      return;
    }
    checkBookmark(Number(id))
      .then((res) => setBookmarked(res.bookmarked))
      .catch(() => setBookmarked(false));
  }, [id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const handleBookmark = async () => {
    if (!grant) return;
    if (!isLoggedIn()) {
      toast.error('북마크는 로그인 후 이용할 수 있습니다.');
      return;
    }
    if (bookmarkLoading) return;

    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(grant.id);
        setBookmarked(false);
        toast.success('북마크를 해제했습니다.');
      } else {
        await addBookmark(grant.id);
        setBookmarked(true);
        toast.success('북마크에 저장했습니다.');
      }
      await refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '북마크 처리에 실패했습니다.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('링크가 복사되었습니다');
  };

  const handleExport = () => {
    if (!grant) return;
    try {
      exportGrantPdf(grant);
      toast.success('PDF 저장 창이 열렸습니다. "PDF로 저장"을 선택하세요.');
    } catch (error: any) {
      toast.error(error.message || 'PDF 다운로드에 실패했습니다.');
    }
  };

  const handleAddToPipeline = async () => {
    try {
      await addToPipeline(grant!.id, 'DISCOVERED');
      toast.success('파이프라인에 저장되었습니다!');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || '파이프라인 저장에 실패했습니다';
      toast.error(errMsg);
    }
  };

  const persistChecklist = async (checkedKeys: string[], attachments: Record<string, number>) => {
    if (!id || !isLoggedIn()) {
      toast.error('체크리스트 저장은 로그인 후 이용할 수 있습니다.');
      return;
    }
    if (!limits.checklistSaveEnabled) {
      toast.error('체크리스트 저장은 Pro 이상에서 이용할 수 있습니다.');
      return;
    }
    setSavingChecklist(true);
    try {
      const updated = await updateGrantChecklist(Number(id), { checkedKeys, attachments });
      setGrantChecklist(updated);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || '체크리스트 저장에 실패했습니다.');
    } finally {
      setSavingChecklist(false);
    }
  };

  const toggleCheck = (itemKey: string) => {
    if (!grantChecklist) return;
    if (!limits.checklistSaveEnabled) {
      toast.error('체크리스트 저장은 Pro 이상에서 이용할 수 있습니다.');
      return;
    }
    const checkedSet = new Set(grantChecklist.checkedKeys);
    if (checkedSet.has(itemKey)) checkedSet.delete(itemKey);
    else checkedSet.add(itemKey);
    const checkedKeys = Array.from(checkedSet);
    setGrantChecklist({ ...grantChecklist, checkedKeys, checkedCount: checkedKeys.length });
    void persistChecklist(checkedKeys, grantChecklist.attachments ?? {});
  };

  const attachFile = (itemKey: string, fileId: number) => {
    if (!grantChecklist) return;
    const attachments = { ...(grantChecklist.attachments ?? {}), [itemKey]: fileId };
    setGrantChecklist({ ...grantChecklist, attachments });
    void persistChecklist(grantChecklist.checkedKeys, attachments);
    toast.success('보관함 서류가 연결되었습니다.');
  };

  const handleTemplateDownload = async (item: GrantDocumentItem, format: 'docx' | 'hwp') => {
    const code = item.templateCode;
    if (!code) return;

    if (format === 'hwp') {
      const url = item.attachmentUrls?.[0] || item.hwpOfficialUrl || item.officialFormUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.success('양식 페이지를 열었습니다.');
        return;
      }
    }

    setDownloadingTemplate(`${code}-${format}`);
    try {
      await downloadDocumentTemplate(code, format, Number(id));
      toast.success(format === 'docx' ? 'Word 템플릿을 다운로드했습니다.' : 'HWP 템플릿을 다운로드했습니다.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '템플릿 다운로드에 실패했습니다.';
      toast.error(message);
    } finally {
      setDownloadingTemplate(null);
    }
  };

  const checklistItems = grantChecklist?.items ?? [];
  const checkedCount = grantChecklist?.checkedKeys.length ?? 0;
  const checklistProgress = checklistItems.length > 0
    ? Math.round((checkedCount / checklistItems.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="skeleton h-6 w-32" />
        <div className="premium-card p-8 space-y-6">
          <div className="flex gap-3"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-24 rounded-full" /></div>
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-32 w-full" />
        </div>
      </div>
    );
  }

  const isG2b = grant?.source === 'G2B' || grant?.source === 'G2B_AWARD';
  const listPath = isG2b ? '/procurement' : '/grants';
  const listLabel =
    grant?.source === 'G2B_AWARD'
      ? '나라장터 낙찰 목록'
      : grant?.source === 'G2B'
        ? '나라장터 입찰 목록'
        : '지원사업 목록';

  if (!grant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {fetchError ? '공고를 불러오지 못했습니다' : '공고를 찾을 수 없습니다'}
        </p>
        {fetchError && (
          <p className="text-sm text-gray-500 mt-2">서버 연결을 확인한 뒤 다시 시도해 주세요.</p>
        )}
        <Link to="/grants" className="text-brand-600 font-medium mt-2 inline-block hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link + Action buttons */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={listPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {listLabel}
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => void handleBookmark()}
            disabled={bookmarkLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              bookmarked
                ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${bookmarkLoading ? 'opacity-60 cursor-wait' : ''}`}
            title={isLoggedIn()
              ? `북마크 (${usage?.bookmarks ?? 0}/${limits.maxBookmarks < 0 ? '무제한' : limits.maxBookmarks})`
              : '북마크 (로그인 필요)'}
          >
            {bookmarkLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            )}
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="공유"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="PDF 다운로드"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddToPipeline}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all hover:-translate-y-0.5"
            title="파이프라인에 추가"
          >
            <PlusSquare className="w-4 h-4" />
            <span className="hidden sm:inline">파이프라인 추가</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="premium-card overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[grant.category] || CATEGORY_COLORS['기타']}`}>
              <Tag className="w-3.5 h-3.5 inline mr-1.5" />
              {grant.category}
            </span>
            {matchScore && (
              <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                matchScore.score >= 80
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : matchScore.score >= 50
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Target className="w-3.5 h-3.5 inline mr-1" />
                매칭 점수 {matchScore.score}%
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {grant.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {grant.organization}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(grant.applyStart)} ~ {formatDate(grant.applyEnd)}
            </span>
          </div>

          {grant.budget && (
            <div className="mt-4 inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-sm font-bold px-4 py-2 rounded-xl">
              💰 지원금액: {grant.budget}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              사업 개요
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                {grant.content}
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-500" />
              지원 자격
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                {grant.eligibility}
              </p>
            </div>
          </section>

          {/* Match score analysis */}
          {matchScore && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                맞춤 적합도 분석
              </h2>
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/10 dark:to-purple-900/10 rounded-2xl p-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  <span className="font-bold gradient-text">{matchScore.score}%</span>의 적합도(참고용)로 계산되었습니다. 최종 신청 가능 여부는 공고 원문·자격요건을 확인해 주세요.
                  {limits.matchFlagsEnabled && ' 아래 세 가지 기준으로 산출되었습니다.'}
                </p>
                {limits.matchFlagsEnabled ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: '카테고리 일치', ok: matchScore.matchedCategory, icon: Tag },
                    { label: '업종 일치', ok: matchScore.matchedIndustry, icon: Briefcase },
                    { label: '기업규모 적합', ok: matchScore.matchedSize, icon: BarChart3 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                          item.ok
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.ok ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <Icon className={`w-5 h-5 ${item.ok ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                          <p className={`text-lg font-bold ${item.ok ? 'text-green-600' : 'text-gray-400'}`}>
                            {item.ok ? '적합' : '미해당'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                ) : (
                  <PlanUpgradeHint compact message="Pro에서는 카테고리·업종·규모별 적합 여부 상세를 볼 수 있습니다." requiredPlan="Pro" />
                )}
              </div>
            </section>
          )}

          {/* Document Checklist */}
          <section>
            <div className="flex items-center justify-between mb-3 gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-500" />
                필요 서류 체크리스트
              </h2>
              {isLoggedIn() && (
                <Link to="/documents" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                  서류 보관함
                </Link>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
              {grantChecklist?.grantUrl && (
                <div className="mb-4">
                  <a
                    href={grantChecklist.grantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    공고 원문 · 첨부 양식 확인
                  </a>
                </div>
              )}

              {grant?.requirements && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-line border-b border-gray-200 dark:border-gray-700 pb-4">
                  {grant.requirements}
                </p>
              )}

              {grantChecklist?.recommendedOfficialForms && grantChecklist.recommendedOfficialForms.length > 0 && (
                <div className="mb-4 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/60 dark:bg-brand-900/10 p-4">
                  <p className="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-2">
                    관련 발급·안내 ({grantChecklist.grantSource?.toUpperCase()})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {grantChecklist.recommendedOfficialForms.map((form) => (
                      <a
                        key={form.code}
                        href={form.officialUrl || grantChecklist.grantUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {form.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {grantChecklist?.grantAttachmentUrls && grantChecklist.grantAttachmentUrls.length > 0 && (
                <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">공고 첨부 양식 URL</p>
                  <div className="space-y-1">
                    {grantChecklist.grantAttachmentUrls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-brand-600 dark:text-brand-400 truncate hover:underline">
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  {checkedCount}/{checklistItems.length}
                </span>
                {savingChecklist && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
              </div>

              <div className="space-y-2">
                {checklistItems.map((item) => {
                  const checked = grantChecklist?.checkedKeys.includes(item.key) ?? false;
                  const attachedFileId = grantChecklist?.attachments?.[item.key];
                  const attachedFile = userFiles.find((f) => f.id === attachedFileId);
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl transition-all ${
                        checked
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : 'hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheck(item.key)}
                          disabled={!isLoggedIn()}
                          className="w-5 h-5 rounded-md border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                        />
                        <span className={`text-sm font-medium flex-1 ${
                          checked ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {item.label}
                          {item.matchedTemplateName && (
                            <span className="block text-xs font-normal text-brand-600 dark:text-brand-400 mt-0.5">
                              {item.officialSource} · {item.matchedTemplateName}
                            </span>
                          )}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.required
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {item.required ? '필수' : '선택'}
                        </span>
                      </label>

                      <div className="mt-2 ml-8 flex flex-wrap items-center gap-2">
                        {item.officialFormUrl && (
                          <a
                            href={item.officialFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {item.officialLinkLabel || '관련 링크'}
                          </a>
                        )}
                        {item.templateCode && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTemplateDownload(item, 'docx')}
                              disabled={downloadingTemplate === `${item.templateCode}-docx`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-400"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              Word
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTemplateDownload(item, 'hwp')}
                              disabled={downloadingTemplate === `${item.templateCode}-hwp`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-400"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              HWP
                            </button>
                          </>
                        )}
                        {item.attachmentUrls?.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            첨부파일
                          </a>
                        ))}
                        {isLoggedIn() && userFiles.length > 0 && (
                          <select
                            value={attachedFileId ?? ''}
                            onChange={(e) => {
                              const fileId = Number(e.target.value);
                              if (fileId) attachFile(item.key, fileId);
                            }}
                            className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1"
                          >
                            <option value="">보관함에서 연결</option>
                            {userFiles.map((file) => (
                              <option key={file.id} value={file.id}>{file.originalName}</option>
                            ))}
                          </select>
                        )}
                        {attachedFile && (
                          <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                            <Paperclip className="w-3.5 h-3.5" />
                            {attachedFile.originalName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isLoggedIn() && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  로그인하면 체크리스트 진행 상황이 저장되고, 보관함 서류를 연결할 수 있습니다.
                </p>
              )}
            </div>
          </section>

          {/* Original Link */}
          {grant.originalUrl && (
            <div>
              <a
                href={grant.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                원문 바로가기
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Related Grants Carousel */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            유사 공고
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((g) => (
              <GrantCard key={g.id} grant={g} />
            ))}
          </div>
        </div>
      )}

      {/* Back to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-2xl gradient-bg text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default GrantDetailPage;
