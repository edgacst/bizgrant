import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { isLoggedIn } from '../utils/authSession';

type FooterLinkProps = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

const FooterLink: React.FC<FooterLinkProps> = ({ to, children, className = '' }) => (
  <Link
    to={to}
    onClick={() => {
      if (!to.includes('#')) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }}
    className={className}
  >
    {children}
  </Link>
);

const Footer: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setLoggedIn(isLoggedIn());
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    syncAuth();
    window.addEventListener('auth-session-updated', syncAuth);
    return () => window.removeEventListener('auth-session-updated', syncAuth);
  }, []);

  const handleNewsletterSubscribe = async () => {
    if (!isLoggedIn()) {
      toast.error('뉴스레터는 회원만 구독할 수 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await client.post('/newsletter/subscribe');
      toast.success('구독 완료! 매주 월요일 오전 정부지원금사업 요약 메일을 보내드립니다.');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '구독 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';
      if (status === 401) {
        toast.error('로그인이 필요합니다. 로그인 후 다시 시도해 주세요.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <FooterLink to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-all">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">
                Biz<span className="gradient-text">Grant</span>
              </span>
            </FooterLink>
            <p className="text-sm leading-relaxed">
              정부·기관 공고 수집과 맞춤 적합도(참고용) 플랫폼.
              <br />
              당신의 지원금을 찾아드립니다.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">제품</h4>
            <ul className="space-y-2 text-sm">
              <li><FooterLink to="/grants" className="hover:text-white transition-colors">정부지원금사업</FooterLink></li>
              <li><FooterLink to="/procurement" className="hover:text-white transition-colors">나라장터</FooterLink></li>
              <li><FooterLink to="/pipeline" className="hover:text-white transition-colors">파이프라인</FooterLink></li>
              <li><FooterLink to="/calendar" className="hover:text-white transition-colors">캘린더</FooterLink></li>
              <li><FooterLink to="/pricing" className="hover:text-white transition-colors">요금제</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">회사</h4>
            <ul className="space-y-2 text-sm">
              <li><FooterLink to="/guide" className="hover:text-white transition-colors">사용방법</FooterLink></li>
              <li><FooterLink to="/board" className="hover:text-white transition-colors">공개 게시판</FooterLink></li>
              <li><FooterLink to="/about" className="hover:text-white transition-colors">소개</FooterLink></li>
              <li><FooterLink to="/pricing" className="hover:text-white transition-colors">요금제</FooterLink></li>
              <li>
                <FooterLink to="/pricing#enterprise-contact" className="hover:text-white transition-colors">
                  문의
                </FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">뉴스레터</h4>
            <p className="text-sm mb-4">회원 전용 주간 정부지원금사업 요약 메일</p>
            {loggedIn ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 break-all">
                  가입 이메일: <span className="text-gray-300">{userEmail || '등록된 이메일'}</span>
                </p>
                <button
                  type="button"
                  onClick={handleNewsletterSubscribe}
                  disabled={submitting}
                  className="btn btn-primary w-full sm:w-auto px-4 py-2.5 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  뉴스레터 구독
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-gray-500">로그인한 회원만 구독할 수 있습니다.</p>
                <div className="flex flex-wrap gap-2">
                  <FooterLink
                    to="/login"
                    className="btn btn-primary px-4 py-2 inline-flex items-center gap-1.5 text-sm"
                  >
                    로그인
                  </FooterLink>
                  <FooterLink
                    to="/signup"
                    className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm"
                  >
                    회원가입
                  </FooterLink>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mb-6">
          <div className="text-xs text-gray-500 space-y-1.5">
            <p>
              <span className="text-gray-600">회사명</span> 주식회사 에드가씨에스티
              <span className="mx-3 text-gray-700">|</span>
              <span className="text-gray-600">대표</span> 김기철
            </p>
            <p>
              <span className="text-gray-600">주소</span> 경기도 부천시 원미구 상동 457
            </p>
            <p>
              <span className="text-gray-600">사업자등록번호</span> 634-81-02760
              <span className="mx-3 text-gray-700">|</span>
              <span className="text-gray-600">통신판매업신고</span> 제 2026-부천원미-0446 호
            </p>
            <p>
              <span className="text-gray-600">고객센터</span>{' '}
              <a href="mailto:freecompr@naver.com" className="hover:text-white transition-colors">
                freecompr@naver.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span>&copy; 2026 BizGrant. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <FooterLink to="/terms" className="hover:text-white transition-colors">이용약관</FooterLink>
            <FooterLink to="/privacy" className="hover:text-white transition-colors">개인정보처리방침</FooterLink>
            <FooterLink to="/pricing#enterprise-contact" className="hover:text-white transition-colors">
              문의하기
            </FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
