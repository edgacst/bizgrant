import React from 'react';
// imports removed (unused)
import type { GrantNotice, MatchingScore } from '../types';

interface GrantComparisonProps {
  grants: GrantNotice[];
  scores?: Map<number, MatchingScore>;
}

const COMPARE_ROWS = [
  { key: 'category', label: '지원 분야' },
  { key: 'budget', label: '지원 금액' },
  { key: 'organization', label: '주관 기관' },
  { key: 'applyEnd', label: '마감일' },
  { key: 'eligibility', label: '지원 자격' },
];

const GrantComparison: React.FC<GrantComparisonProps> = ({ grants, scores }) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-left font-medium text-gray-500 dark:text-gray-400 w-32">
              항목
            </th>
            {grants.map((g) => {
              const s = scores?.get(g.id);
              return (
                <th key={g.id} className="py-3 px-4 text-left">
                  <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                    {g.title}
                  </div>
                  {s && (
                    <span
                      className={`inline-flex items-center gap-1 mt-1 text-xs font-bold ${getScoreColor(
                        s.score
                      )}`}
                    >
                      매칭 {s.score}%
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                {row.label}
              </td>
              {grants.map((g) => (
                <td key={g.id} className="py-3 px-4 text-gray-900 dark:text-gray-200">
                  {row.key === 'applyEnd'
                    ? formatDate((g as any)[row.key])
                    : row.key === 'budget'
                    ? (g as any)[row.key] || '미정'
                    : (g as any)[row.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GrantComparison;
