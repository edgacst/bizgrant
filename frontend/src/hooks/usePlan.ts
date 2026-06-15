import { useCallback, useEffect, useState } from 'react';
import { getPlanInfo, type PlanInfo } from '../api/plan';
import { isLoggedIn } from '../utils/authSession';

const FREE_DEFAULT: PlanInfo = {
  plan: 'free',
  planLabel: 'Free',
  limits: {
    maxMatchResults: 10,
    matchReasonsEnabled: false,
    matchFlagsEnabled: false,
    maxAlertCategories: 1,
    maxAlertIndustries: 2,
    maxDailyAlerts: 1,
    maxPipelineItems: 1,
    maxBookmarks: 5,
    checklistSaveEnabled: false,
    templateAutofillEnabled: false,
    allowedAlertChannels: ['email'],
    maxUserFiles: 5,
    grantCompareEnabled: false,
  },
};

export function usePlan() {
  const [planInfo, setPlanInfo] = useState<PlanInfo>(FREE_DEFAULT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) {
      setPlanInfo(FREE_DEFAULT);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const info = await getPlanInfo();
      setPlanInfo(info);
      localStorage.setItem('userPlan', info.plan);
    } catch {
      setPlanInfo(FREE_DEFAULT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => { void refresh(); };
    window.addEventListener('auth-session-updated', onUpdate);
    return () => window.removeEventListener('auth-session-updated', onUpdate);
  }, [refresh]);

  const isProOrAbove = planInfo.plan === 'pro' || planInfo.plan === 'enterprise' || planInfo.plan === 'admin';

  return { planInfo, loading, refresh, isProOrAbove, limits: planInfo.limits, usage: planInfo.usage };
}
