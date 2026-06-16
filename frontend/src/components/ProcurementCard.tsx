import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, ArrowRight, Gavel } from 'lucide-react';
import type { GrantNotice } from '../types';

interface ProcurementCardProps {
  grant: GrantNotice;
}

const TYPE_COLORS: Record<string, string> = {
  '물품': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '공사': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  '용역': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const ProcurementCard: React.FC<ProcurementCardProps> = ({ grant }) => {
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
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
        <Gavel className="w-3 h-3" />
        나라장터
      </span>
    </>
  );

  return (
    <div
      onClick={() => navigate(`/grants/${grant.id}`)}
      className="premium-card cursor-pointer group p-5 md:py-3 md:px-4 border-l-4 border-l-slate-500 hover:border-l-brand-500"
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
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              마감 {formatDate(grant.applyEnd)}
            </span>
          </div>

          {grant.budget && (
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
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
            <span className="shrink-0 text-gray-500 dark:text-gray-400 whitespace-nowrap">
              마감 {formatDateShort(grant.applyEnd)}
            </span>
            {grant.budget && (
              <span className="shrink-0 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
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

export default ProcurementCard;
