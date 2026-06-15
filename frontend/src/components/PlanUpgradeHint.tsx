import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

type PlanUpgradeHintProps = {
  message: string;
  requiredPlan?: string;
  compact?: boolean;
};

const PlanUpgradeHint: React.FC<PlanUpgradeHintProps> = ({ message, requiredPlan, compact }) => (
  <div className={`rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 ${
    compact ? 'p-3' : 'p-4'
  }`}>
    <p className={`text-amber-800 dark:text-amber-200 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Sparkles className="w-4 h-4 inline mr-1 text-amber-600" />
      {message}
      {requiredPlan && (
        <span className="font-semibold"> ({requiredPlan} 필요)</span>
      )}
    </p>
    <Link
      to="/pricing"
      className={`inline-block mt-2 font-semibold text-brand-600 dark:text-brand-400 hover:underline ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      요금제 보기 →
    </Link>
  </div>
);

export default PlanUpgradeHint;
