import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, ArrowRight, Trophy } from 'lucide-react';
import type { GrantNotice } from '../types';

interface AwardCardProps {
  grant: GrantNotice;
}

const TYPE_COLORS: Record<string, string> = {
  '물품': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '공사': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  '용역': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const AwardCard: React.FC<AwardCardProps> = ({ grant }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  const tagColor = TYPE_COLORS[grant.category] || TYPE_COLORS['용역'];

  const tags = (
    <>
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
        {grant.category}
      </span>
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 flex items-center gap-1">
        <Trophy className="w-3 h-3" />
        낙찰정보
      </span>
    </>
  );

  return (
    <div
      onClick={() => navigate(`/grants/${grant.id}`)}
      className="premium-card cursor-pointer group p-5 md:py-3 md:px-4 border-l-4 border-l-amber-500 hover:border-l-brand-500"
    >
      {/* 모바일: 기존 카드형 */}
      <div className="md:hidden flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">{tags}</div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
            {grant.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {grant.organization}
            </span>
            {grant.applyStart && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                개찰 {formatDate(grant.applyStart)}
              </span>
            )}
          </div>

          {grant.eligibility && (
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {grant.eligibility}
            </p>
          )}

          {grant.budget && (
            <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
              {grant.budget}
            </p>
          )}
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0 transition-colors mt-1" />
      </div>

      {/* PC: 게시판형 2줄 */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">{tags}</div>
          <div className="flex items-center gap-3 min-w-0 text-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate min-w-0 flex-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {grant.title}
            </h3>
            <span className="shrink-0 text-gray-400 hidden lg:inline">|</span>
            <span className="shrink-0 text-gray-500 dark:text-gray-400 flex items-center gap-1 max-w-[10rem] truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              {grant.organization}
            </span>
            {grant.applyStart && (
              <span className="shrink-0 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                개찰 {formatDateShort(grant.applyStart)}
              </span>
            )}
            {grant.eligibility && (
              <span className="shrink-0 text-gray-600 dark:text-gray-300 max-w-[8rem] truncate hidden xl:inline">
                {grant.eligibility}
              </span>
            )}
            {grant.budget && (
              <span className="shrink-0 font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                {grant.budget}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0 transition-colors" />
      </div>
    </div>
  );
};

export default AwardCard;
