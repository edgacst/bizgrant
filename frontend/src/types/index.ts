// ============================================================
// BizGrant — TypeScript Interfaces
// ============================================================

export interface User {
  id: number;
  name: string;
  email: string;
  companyName: string;
  bizNumber: string;
  phone: string;
  industry: string;
  companySize: string;
  createdAt: string;
  role?: string;
  plan?: string;
}

export interface GrantNotice {
  id: number;
  title: string;
  organization: string;
  category: string;
  source?: string;
  sourceLabel?: string;
  applyStart: string;
  applyEnd: string;
  budget: string;
  content: string;
  eligibility: string;
  requirements: string;
  originalUrl: string;
  createdAt: string;
}

export interface MatchingScore {
  noticeId: number;
  score: number;
  matchedIndustry: boolean;
  matchedCategory: boolean;
  matchedSize: boolean;
  matchReasons?: string[];
  title?: string;
  organization?: string;
  category?: string;
  applyEnd?: string;
  applyStart?: string;
  budget?: string;
  url?: string;
  matchScore?: number;
}

export interface AlertPref {
  id: number;
  categories: string[];
  industries: string[];
  minBudget: number;
  channel: 'email' | 'kakao' | 'sms';
  channelId: string;
  enabled: boolean;
  userId: number;
}

export interface AlertHistory {
  id: number;
  date: string;
  noticeTitle: string;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  role?: string;
  email?: string;
  name?: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  companyName: string;
  bizNumber: string;
  phone: string;
  industry: string;
  companySize: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface UpdateProfileForm {
  name?: string;
  phone?: string;
  companyName?: string;
  bizNumber?: string;
  industry?: string;
  companySize?: string;
}

export interface GrantDocumentItem {
  key: string;
  label: string;
  type: string;
  required: boolean;
  templateCode?: string | null;
  officialFormUrl?: string | null;
  hwpOfficialUrl?: string | null;
  officialLinkLabel?: string | null;
  officialSource?: string | null;
  matchedTemplateName?: string | null;
  attachmentUrls?: string[];
}

export interface OfficialFormEntry {
  code: string;
  name: string;
  sourceLabel: string;
  officialUrl?: string;
  hwpOfficialUrl?: string;
  documentTypes?: string[];
}

export interface GrantChecklist {
  grantId: number;
  grantTitle?: string;
  grantSource?: string;
  grantUrl?: string;
  requirementsRaw?: string;
  items: GrantDocumentItem[];
  checkedKeys: string[];
  attachments: Record<string, number>;
  grantAttachmentUrls?: string[];
  recommendedOfficialForms?: OfficialFormEntry[];
  totalCount: number;
  checkedCount: number;
}

export interface DocumentTemplate {
  code: string;
  name: string;
  description: string;
  type: string;
  autoFillSupported: boolean;
  officialUrl?: string;
  hwpOfficialUrl?: string;
  sourceLabel?: string;
}

export interface UserFileItem {
  id: number;
  originalName: string;
  mimeType?: string;
  fileSize?: number;
  documentType?: string;
  createdAt?: string;
}

export interface AlertPrefForm {
  categories: string[];
  industries: string[];
  minBudget: number;
  channel: 'email' | 'kakao' | 'sms';
  channelId: string;
  enabled: boolean;
}

// ============================================================
// Pipeline Kanban Interfaces
// ============================================================

export interface PipelineColumn {
  id: string;
  title: string;
  color: string;
  count: number;
}

export interface PipelineItem {
  id: number;
  grantId: number;
  title: string;
  organization: string;
  category: string;
  budget: string;
  stage: string;
  dueDate: string;
  notes: string;
  documents: string[];
  daysLeft: number;
  totalAmount?: string;
  originalUrl?: string;
}

export interface PipelineStats {
  total: number;
  byStage: { stage: string; count: number; totalBudget: string; color: string }[];
  totalBudget: string;
  urgentCount: number;
  successRate: number;
}
