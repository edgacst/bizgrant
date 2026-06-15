import type { PipelineStats } from '../types';

export function normalizePipelineStats(data: unknown): PipelineStats | null {
  if (!data || typeof data !== 'object') return null;

  const stats = data as Record<string, unknown>;
  if (typeof stats.total !== 'number') return null;

  let byStage: PipelineStats['byStage'] = [];
  if (Array.isArray(stats.byStage)) {
    byStage = stats.byStage as PipelineStats['byStage'];
  } else if (stats.byStage && typeof stats.byStage === 'object') {
    byStage = Object.entries(stats.byStage as Record<string, number>).map(([stage, count]) => ({
      stage: stage.toLowerCase(),
      count: Number(count),
      totalBudget: '',
      color: 'gray',
    }));
  }

  return {
    total: stats.total,
    byStage,
    totalBudget: String(stats.totalBudget ?? '0원'),
    urgentCount: Number(stats.urgentCount ?? 0),
    successRate: Number(stats.successRate ?? 0),
  };
}
