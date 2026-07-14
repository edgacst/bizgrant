import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles } from 'lucide-react';
import { useGuestPreview } from '../hooks/useGuestPreview';

const GuestPreviewBanner: React.FC = () => {
  const { remainingLabel } = useGuestPreview({ enabled: true });

  return (
    <div className="sticky top-16 z-40 border-b border-amber-200/80 dark:border-amber-900/50 bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            비회원 무료 미리보기{' '}
            <strong className="font-extrabold tabular-nums">{remainingLabel}</strong> 남음
          </span>
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          회원가입하고 계속 보기
        </Link>
      </div>
    </div>
  );
};

export default GuestPreviewBanner;
