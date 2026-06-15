import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, loginWithOAuth } from '../api/auth';
import { saveAuthSession } from '../utils/authSession';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleOAuth = async (provider: 'google' | 'naver' | 'kakao') => {
    setLoading(true);
    try {
      const tokens = await loginWithOAuth(provider);
      saveAuthSession(tokens);
      toast.success(`${provider === 'google' ? 'Google' : provider === 'naver' ? '네이버' : '카카오'} 로그인 성공!`);
      navigate(tokens.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch {
      toast.error('소셜 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const tokens = await login(form);
      saveAuthSession(tokens);
      toast.success('로그인 성공!');
      navigate(tokens.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        (status === 401 || status === 403
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : '로그인에 실패했습니다. 다시 시도해주세요.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
          <div className="premium-card p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                다시 오신 것을 환영합니다
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                BizGrant에 로그인하고 맞춤 공고를 확인하세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  이메일
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
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력해주세요"
                    className="input-premium pl-10 pr-10"
                    required
                    autoComplete="current-password"
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center text-base py-3"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    로그인
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                회원가입
              </Link>
            </p>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">
                    간편 로그인
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {/* Google */}
                <button
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

                {/* Naver */}
                <button
                  onClick={() => handleOAuth('naver')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#03C75A] hover:bg-[#02b350] transition-all text-sm font-bold text-white"
                >
                  <span className="text-lg leading-none">N</span>
                  네이버
                </button>

                {/* Kakao */}
                <button
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

export default LoginPage;
