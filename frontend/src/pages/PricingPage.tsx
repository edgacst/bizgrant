import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Shield,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PricingCard from '../components/PricingCard';
import { PRICING_TIERS, FEATURE_COMPARISON, FAQS } from './pricingData';
import { usePageSeo } from '../hooks/usePageSeo';
import { PAGE_SEO } from '../seo/config';

const PricingPage: React.FC = () => {
  usePageSeo(PAGE_SEO.pricing);
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('문의 내용이 기록되었습니다.');
    setContactForm({ name: '', email: '', company: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="gradient-bg py-20 pt-12 sm:pt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full mb-6 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4" />
            투명한 요금 정책
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            당신에게 딱 맞는 요금제
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            플랜마다 추천·알림·파이프라인·체크리스트 한도가 다릅니다.
            결제는 아직 없으며, Pro·Enterprise는 관리자 플랜 변경으로 적용됩니다.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium transition-colors ${
            !yearly ? 'text-gray-900 dark:text-white' : 'text-gray-400'
          }`}>월 결제</span>
          <button
            role="switch"
            aria-checked={yearly}
            aria-label={yearly ? '연 결제로 전환됨' : '월 결제로 전환됨'}
            tabIndex={0}
            onClick={() => setYearly(!yearly)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setYearly(!yearly); } }}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 ${
              yearly ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300"
              style={{ transform: yearly ? 'translateX(28px)' : 'translateX(0)' }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${
            yearly ? 'text-gray-900 dark:text-white' : 'text-gray-400'
          }`}>
            연 결제
            <span className="ml-1.5 text-xs text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              50% 할인
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} yearly={yearly} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-full">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              결제·환불 정책은 별도 공지 예정
            </span>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-10">
            기능 <span className="gradient-text">비교</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-4 text-left font-bold text-gray-900 dark:text-white">기능</th>
                  <th className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">Free</th>
                  <th className="py-4 px-4 text-center font-bold gradient-text">Pro</th>
                  <th className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, i) => (
                  <tr key={row.name} className={i === FEATURE_COMPARISON.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-800'}>
                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{row.name}</td>
                    {(['free', 'pro', 'enterprise'] as const).map((tier) => (
                      <td key={tier} className="py-3 px-4 text-center">
                        {typeof row[tier] === 'boolean' ? (
                          row[tier] ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {(row as Record<string, string | boolean>)[tier]}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-10">
            자주 묻는 <span className="gradient-text">질문</span>
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="premium-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-brand-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed animate-fadeUp">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Contact Form */}
      <section id="enterprise-contact" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Enterprise <span className="gradient-text">문의</span>
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              컨설팅사·액셀러레이터·조달 담당팀을 위한 플랜입니다.
              고객사 수·팀 규모에 따라 시트와 다중 프로필 한도를 조정해 드립니다.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="premium-card p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="홍길동"
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="example@company.com"
                  className="input-premium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                회사명
              </label>
              <input
                type="text"
                value={contactForm.company}
                onChange={(e) => setContactForm(p => ({ ...p, company: e.target.value }))}
                placeholder="회사명을 입력해주세요"
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                placeholder="필요한 기능이나 문의 사항을 알려주세요"
                className="input-premium resize-none"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center text-base py-3">
              <Send className="w-4 h-4" />
              문의하기
            </button>
          </form>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 gradient-bg">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white">아직 고민 중이신가요?</h2>
          <p className="mt-3 text-indigo-100">
            회원가입 후 공고 검색·맞춤 적합도·알림 설정을 무료로 이용해 보세요
          </p>
          <Link to="/signup" className="btn btn-accent text-lg px-10 py-4 mt-8 inline-flex">
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
