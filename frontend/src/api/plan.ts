import client from './client';

export type PlanLimits = {
  maxMatchResults: number;
  matchReasonsEnabled: boolean;
  matchFlagsEnabled: boolean;
  maxAlertCategories: number;
  maxAlertIndustries: number;
  maxDailyAlerts: number;
  maxPipelineItems: number;
  maxBookmarks: number;
  checklistSaveEnabled: boolean;
  templateAutofillEnabled: boolean;
  allowedAlertChannels: string[];
  maxUserFiles: number;
  grantCompareEnabled: boolean;
};

export type PlanUsage = {
  pipelineItems: number;
  bookmarks: number;
  alertsSentToday: number;
  userFiles: number;
  matchResultsCap: number;
};

export type PlanInfo = {
  plan: string;
  planLabel: string;
  limits: PlanLimits;
  usage?: PlanUsage;
};

export async function getPlanInfo(): Promise<PlanInfo> {
  const { data } = await client.get<PlanInfo>('/plan');
  return data;
}

export function isUnlimited(value: number): boolean {
  return value < 0;
}

export function formatLimit(value: number): string {
  return isUnlimited(value) ? '무제한' : `${value}`;
}
