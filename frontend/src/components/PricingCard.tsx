import React from 'react';
import { Check, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  description: string;
  /** 이런 분께 */
  audience: string;
  /** 현재 이용 상태 */
  statusNote: string;
  features: PricingFeature[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

interface PricingCardProps {
  tier: PricingTier;
  yearly: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ tier, yearly }) => {
  const navigate = useNavigate();
  const price = yearly && tier.yearlyPrice ? tier.yearlyPrice : tier.monthlyPrice;
  const period = yearly ? '/년' : '/월';

  const handleCta = () => {
    if (tier.cta === '문의하기') {
      const el = document.getElementById('enterprise-contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        toast.success('문의 폼으로 이동했습니다');
      }
    } else {
      toast.success(`${tier.name} — 회원가입 페이지로 이동합니다`);
      setTimeout(() => navigate('/signup'), 300);
    }
  };

  return (
    <div
      className={`relative premium-card p-8 flex flex-col ${
        tier.highlighted
          ? 'ring-2 ring-brand-500 shadow-lg shadow-brand-500/10 scale-[1.02] z-10'
          : ''
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
            <Zap className="w-3 h-3" />
            {tier.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tier.description}</p>
        <p className="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400">{tier.audience}</p>
        <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {tier.statusNote}
        </span>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {price === 0 ? '무료' : `₩${price.toLocaleString()}`}
          </span>
          {price > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{period}</span>
          )}
        </div>
        {yearly && tier.yearlyPrice && (
          <p className="text-xs text-green-600 mt-1">
            연간 결제 시 {100 - Math.round((tier.yearlyPrice * 100) / (tier.monthlyPrice * 12))}% 할인
            {tier.monthlyPrice > 0 && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                (월 ₩{Math.round(tier.yearlyPrice / 12).toLocaleString()} 상당)
              </span>
            )}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
            )}
            <span
              className={
                feature.included
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-600'
              }
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleCta}
        className={`btn w-full justify-center text-base py-3 ${
          tier.highlighted
            ? 'btn-primary'
            : 'btn-secondary'
        }`}
      >
        {tier.cta}
      </button>
    </div>
  );
};

export default PricingCard;
