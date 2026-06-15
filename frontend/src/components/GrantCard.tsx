import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, ArrowRight } from 'lucide-react';
import type { GrantNotice } from '../types';

interface GrantCardProps {
  grant: GrantNotice;
  matchScore?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'R&D': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '창업': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '수출': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '제조혁신': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '인력': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '마케팅': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '기타': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const GrantCard: React.FC<GrantCardProps> = ({ grant, matchScore }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tagColor = CATEGORY_COLORS[grant.category] || CATEGORY_COLORS['기타'];

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div
      onClick={() => navigate(`/grants/${grant.id}`)}
      className="premium-card cursor-pointer group p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Category + Match score */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>
              {grant.category}
            </span>
            {grant.sourceLabel && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {grant.sourceLabel}
              </span>
            )}
            {matchScore !== undefined && (
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${getMatchColor(matchScore)}`}>
                매칭 {matchScore}%
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
            {grant.title}
          </h3>

          {/* Organization + Period */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {grant.organization}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(grant.applyStart)} ~ {formatDate(grant.applyEnd)}
            </span>
          </div>

          {/* Budget snippet */}
          {grant.budget && (
            <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
              {grant.budget}
            </p>
          )}
        </div>

        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0 transition-colors mt-1" />
      </div>
    </div>
  );
};

export default GrantCard;
