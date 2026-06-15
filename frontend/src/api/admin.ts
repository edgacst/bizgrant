import client from './client';

export interface AdminDashboardData {
  users: { total: number; admins: number };
  grants: { active: number; total: number };
  newsletter: {
    activeSubscribers: number;
    totalSubscribers: number;
    enabled: boolean;
    cron: string;
  };
  pipeline: { totalItems: number };
  sync: {
    activeTotal?: number;
    totalAll?: number;
    bySource?: [string, number][];
    recentRuns?: unknown[];
  };
  recentUsers: AdminUserSummary[];
  recentSyncRuns: AdminSyncRun[];
}

export interface AdminUserSummary {
  id: number;
  email: string;
  name: string;
  companyName?: string;
  plan?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface AdminSyncRun {
  id: number;
  source: string;
  status: string;
  fetched?: number;
  created?: number;
  updated?: number;
  failed?: number;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await client.get('/admin/dashboard');
  return res.data;
}

export async function triggerGrantSync(): Promise<Record<string, unknown>> {
  const res = await client.post('/admin/grants/sync');
  return res.data;
}

export async function triggerNewsletterSend(): Promise<Record<string, unknown>> {
  const res = await client.post('/admin/newsletter/send');
  return res.data;
}

export async function updateAdminUserPlan(userId: number, plan: string): Promise<{ status: string; plan?: string }> {
  const res = await client.patch(`/admin/users/${userId}/plan`, { plan });
  return res.data;
}

export async function deleteAdminUser(userId: number): Promise<{ status: string; email?: string }> {
  const res = await client.delete(`/admin/users/${userId}`);
  return res.data;
}
