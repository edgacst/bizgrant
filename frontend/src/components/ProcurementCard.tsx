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

  const tagColor = TYPE_COLORS[grant.category] || TYPE_COLORS['용역'];

  return (
    <div
      onClick={() => navigate(`/grants/${grant.id}`)}
      className="premium-card cursor-pointer group p-5 border-l-4 border-l-slate-500 hover:border-l-brand-500"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
              {grant.category}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              나라장터
            </span>
          </div>

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
    </div>
  );
};

export default ProcurementCard;
