import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Building2,
  Check,
  Download,
  FileDown,
  FileText,
  FolderOpen,
  Loader2,
  Save,
  Trash2,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMe, updateProfile } from '../api/auth';
import {
  deleteUserFile,
  downloadDocumentTemplate,
  downloadUserFile,
  getDocumentTemplates,
  getUserFiles,
  uploadUserFile,
} from '../api/documents';
import type { DocumentTemplate, UpdateProfileForm, User, UserFileItem } from '../types';

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

const DOCUMENT_TYPES = [
  { value: 'BUSINESS_PLAN', label: '사업계획서' },
  { value: 'FINANCIAL', label: '재무제표' },
  { value: 'TAX', label: '세금증명' },
  { value: 'INSURANCE', label: '4대보험' },
  { value: 'CERTIFICATE', label: '증명서' },
  { value: 'OTHER', label: '기타' },
];

const DocumentArchivePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UpdateProfileForm>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [files, setFiles] = useState<UserFileItem[]>([]);
  const [uploadType, setUploadType] = useState('OTHER');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const me = await getMe();
      setProfile({
        name: me.name,
        phone: me.phone,
        companyName: me.companyName,
        bizNumber: me.bizNumber,
        industry: me.industry,
        companySize: me.companySize,
      });
    } catch {
      toast.error('프로필 정보를 불러오지 못했습니다. 다시 로그인해주세요.');
    }

    try {
      setTemplates(await getDocumentTemplates());
    } catch {
      toast.error('서류 템플릿 목록을 불러오지 못했습니다.');
    }

    try {
      setFiles(await getUserFiles());
    } catch {
      toast.error('서류 보관함을 불러오지 못했습니다.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileSaved(false);
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated: User = await updateProfile(profile);
      setProfile({
        name: updated.name,
        phone: updated.phone,
        companyName: updated.companyName,
        bizNumber: updated.bizNumber,
        industry: updated.industry,
        companySize: updated.companySize,
      });
      toast.success('회사 프로필이 저장되었습니다. 템플릿 자동완성에 반영됩니다.');
      setProfileSaved(true);
    } catch {
      toast.error('프로필 저장에 실패했습니다.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const saved = await uploadUserFile(file, uploadType);
      setFiles((prev) => [saved, ...prev]);
      toast.success('서류가 보관함에 저장되었습니다.');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? '서류 업로드에 실패했습니다.';
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!window.confirm('보관함에서 이 서류를 삭제할까요?')) return;
    try {
      await deleteUserFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success('서류가 삭제되었습니다.');
    } catch {
      toast.error('서류 삭제에 실패했습니다.');
    }
  };

  const handleTemplateDownload = async (template: DocumentTemplate, format: 'docx' | 'hwp') => {
    if (format === 'hwp' && template.hwpOfficialUrl) {
      window.open(template.hwpOfficialUrl, '_blank', 'noopener,noreferrer');
      toast.success('발급·안내 페이지를 열었습니다.');
      return;
    }

    setDownloading(`${template.code}-${format}`);
    try {
      await downloadDocumentTemplate(template.code, format);
      toast.success('템플릿을 다운로드했습니다.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '템플릿 다운로드에 실패했습니다.';
      toast.error(message);
    } finally {
      setDownloading(null);
    }
  };

  const formatSize = (size?: number) => {
    if (!size) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loadingProfile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-10 w-64 mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderOpen className="w-7 h-7 text-brand-500" />
          서류 센터
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          회사 프로필 자동완성, 자주 쓰는 서류 템플릿, 이전 제출 서류 보관함을 한곳에서 관리합니다.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section className="premium-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-500" />
            회사 프로필 (자동완성)
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-gray-500">대표자명</span>
              <input name="name" value={profile.name ?? ''} onChange={handleProfileChange} className="input w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-gray-500">연락처</span>
              <input name="phone" value={profile.phone ?? ''} onChange={handleProfileChange} className="input w-full" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-gray-500">회사명</span>
              <input name="companyName" value={profile.companyName ?? ''} onChange={handleProfileChange} className="input w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-gray-500">사업자번호</span>
              <input name="bizNumber" value={profile.bizNumber ?? ''} onChange={handleProfileChange} className="input w-full" />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-gray-500">업종</span>
              <select name="industry" value={profile.industry ?? INDUSTRIES[0]} onChange={handleProfileChange} className="input w-full">
                {INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-gray-500">기업 규모</span>
              <select name="companySize" value={profile.companySize ?? COMPANY_SIZES[0]} onChange={handleProfileChange} className="input w-full">
                {COMPANY_SIZES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile || profileSaved}
            className={`btn ${profileSaved ? 'btn-secondary' : 'btn-primary'}`}
          >
            {savingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileSaved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {profileSaved ? '저장됨' : '프로필 저장'}
          </button>
        </section>

        <section className="premium-card p-6 flex flex-col max-h-[min(70vh,560px)]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
            <FileDown className="w-5 h-5 text-brand-500" />
            서류 템플릿
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3 shrink-0">
            총 {templates.length}개
          </p>
          <div className="space-y-3 overflow-y-auto min-h-0 flex-1 pr-1 -mr-1">
            {templates.map((template) => (
              <div key={template.code} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{template.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
                    {template.autoFillSupported && (
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">회사 프로필 자동완성 지원</p>
                    )}
                    {template.sourceLabel && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.sourceLabel} 발급·안내 연결</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {template.officialUrl && (
                      <a href={template.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs px-3 py-1.5 justify-center">
                        발급·안내
                      </a>
                    )}
                    <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTemplateDownload(template, 'docx')}
                      disabled={downloading === `${template.code}-docx`}
                      className="btn btn-secondary text-xs px-3 py-1.5"
                    >
                      Word
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTemplateDownload(template, 'hwp')}
                      disabled={downloading === `${template.code}-hwp`}
                      className="btn btn-secondary text-xs px-3 py-1.5"
                    >
                      HWP
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="premium-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            서류 보관함
          </h2>
          <div className="flex items-center gap-2">
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className="input text-sm">
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              서류 업로드
            </button>
          </div>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <UserIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>보관된 서류가 없습니다. 이전에 제출한 서류를 업로드해 재활용하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 pr-4">파일명</th>
                  <th className="py-3 pr-4">유형</th>
                  <th className="py-3 pr-4">크기</th>
                  <th className="py-3 pr-4">업로드일</th>
                  <th className="py-3">작업</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{file.originalName}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{file.documentType ?? 'OTHER'}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{formatSize(file.fileSize)}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => downloadUserFile(file.id, file.originalName)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                          title="다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(file.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DocumentArchivePage;
