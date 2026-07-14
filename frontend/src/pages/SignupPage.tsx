import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Hash,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { signup } from '../api/auth';
import type { SignupForm } from '../types';

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

const COMPANY_SIZES = [
  '개인/1인',
  '10인 미만',
  '50인 미만',
  '100인 미만',
  '100인 이상',
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewExpired = Boolean((location.state as { previewExpired?: boolean } | null)?.previewExpired);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    companyName: '',
    bizNumber: '',
    phone: '',
    industry: INDUSTRIES[0],
    companySize: COMPANY_SIZES[0],
  });

  useEffect(() => {
    if (previewExpired) {
      toast('무료 미리보기 5분이 종료되었습니다. 회원가입 후 공고를 계속 볼 수 있습니다.', {
        icon: '⏱️',
        duration: 5000,
      });
    }
  }, [previewExpired]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.companyName) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (form.password.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'naver' | 'kakao') => {
    const label = provider === 'google' ? 'Google' : provider === 'naver' ? '네이버' : '카카오';
    toast(`${label} 간편 회원가입은 추후 적용 예정입니다.`, { icon: 'ℹ️' });
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
          <div className="premium-card p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                회원가입
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                BizGrant와 함께 정부지원금사업을 찾아보세요
              </p>
              {previewExpired ? (
                <p className="mt-3 text-sm font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl px-4 py-3 text-left leading-relaxed">
                  무료 미리보기 시간이 끝났습니다. <span className="font-extrabold">회원가입 후</span> 공고 검색·알림·북마크를 계속 이용하세요.
                </p>
              ) : (
                <p className="mt-3 text-sm font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 rounded-xl px-4 py-3 text-left leading-relaxed">
                  <span className="font-extrabold">회원가입만 하면 모든 기능을 이용</span>할 수 있습니다.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="input-premium pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@company.com"
                    className="input-premium pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="8자 이상 입력해주세요"
                    className="input-premium pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  회사명 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="회사명을 입력해주세요"
                    className="input-premium pl-10"
                    required
                  />
                </div>
              </div>

              {/* Biz Number + Phone side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    사업자번호
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="bizNumber"
                      value={form.bizNumber}
                      onChange={handleChange}
                      placeholder="000-00-00000"
                      className="input-premium pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    전화번호
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="010-0000-0000"
                      className="input-premium pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  업종
                </label>
                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="input-premium"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  회사 규모
                </label>
                <select
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange}
                  className="input-premium"
                >
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center text-base py-3 mt-6"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    가입하기
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                로그인
              </Link>
            </p>

            {/* Social Signup */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">
                    간편 회원가입
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('naver')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#03C75A] hover:bg-[#02b350] transition-all text-sm font-bold text-white"
                >
                  <span className="text-lg leading-none">N</span>
                  네이버
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('kakao')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FEE500] hover:bg-[#f0d800] transition-all text-sm font-medium text-[#191919]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#191919" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.73 1.74 5.13 4.36 6.49-.18.6-.62 2.15-.7 2.46-.1.42.15.42.32.3.13-.1 2.07-1.42 2.92-2 .85.24 1.74.37 2.66.37h.02c5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                  </svg>
                  카카오
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SignupPage;
