import type { GrantNotice } from '../types';

export function buildCategoryDistribution(grants: GrantNotice[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const grant of grants) {
    const cat = grant.category || '기타';
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  const total = grants.length;
  if (total === 0) {
    return new Map();
  }
  const percentages = new Map<string, number>();
  for (const [cat, count] of counts.entries()) {
    percentages.set(cat, Math.round((count / total) * 100));
  }
  return percentages;
}

export function isDeadlineWithinDays(dateStr: string, days: number): boolean {
  const end = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= days;
}
