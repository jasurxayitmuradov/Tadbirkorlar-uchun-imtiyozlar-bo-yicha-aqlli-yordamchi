export interface UserProfile {
  name: string;
  region: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  businessName?: string;
  tin?: string;
  legalForm?: string;
  activityType?: string;
  directorName?: string;
  email?: string;
  address?: string;
  employeeCount?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  phone: string;
  region: string;
  createdAt: number;
}

export type Language = 'uz' | 'ru' | 'en';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'html' | 'api' | 'static';
  url: string;
  enabled: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  impact?: string;
  changes?: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: number;
  tags: string[];
  docRefs: string[]; // PF-\d+, etc.
}

export interface ContextItem {
  id: string;
  doc_title: string;
  doc_type: 'Qonun' | 'Farmon' | 'Qaror' | 'Boshqa';
  source: 'lex.uz' | 'gov.uz' | 'other';
  url: string;
  status_hint: 'amaldagi' | 'amalda emas' | 'unknown';
  published_date: string;
  effective_date: string;
  last_updated: string;
  article_or_clause: string;
  snippet_text: string;
  snippet_language: 'uz' | 'ru';
  confidence: number;
}

export interface ContextPayload {
  items: ContextItem[];
}

export interface BenefitProcessStep {
  id: string;
  title: string;
  description: string;
  owner: 'tadbirkor' | 'organ' | 'bank' | 'portal' | 'hududiy bo‘lim';
  inputs: string[];
  outputs: string[];
}

export interface BenefitEdge {
  from: string;
  to: string;
  label: string;
}

export interface BenefitDocumentRequirement {
  doc: string;
  required: boolean;
  source_ref: string;
}

export interface BenefitApplyChannel {
  channel: string;
  details: string;
  source_ref: string;
}

export interface BenefitFeeOrDeadline {
  item: string;
  value: string;
  source_ref: string;
}

export interface BenefitRoadmap {
  benefit_id: string;
  benefit_title: string;
  benefit_summary: string;
  status: 'demo';
  status_warning: boolean;
  target_audience: string[];
  process_steps: BenefitProcessStep[];
  edges: BenefitEdge[];
  required_documents: BenefitDocumentRequirement[];
  where_to_apply: BenefitApplyChannel[];
  fees_and_deadlines: BenefitFeeOrDeadline[];
  citations: string[];
}

export type Theme = 'system' | 'light' | 'dark';

export interface AutoApplicationOpportunity {
  id: string;
  title: string;
  platform: string;
  published_at: string;
  deadline: string;
  target_regions: string[];
  required_fields: string[];
  required_activity_keywords: string[];
  allowed_legal_forms: string[];
}

export interface AutoApplicationStatus {
  opportunity: AutoApplicationOpportunity;
  eligible: boolean;
  missing_fields: string[];
  reason: string;
}

export interface AutoApplicationScanResponse {
  generated_at: string;
  total: number;
  items: AutoApplicationStatus[];
}

export interface AutoApplicationDraft {
  application_id: string;
  opportunity_id: string;
  title: string;
  platform: string;
  status: string;
  submitted_at: string;
  payload: Record<string, string>;
}

export interface SmsEvent {
  to_phone: string;
  message: string;
  related_opportunity_id: string;
  created_at: string;
}

export interface AutoApplicationAnalyzeResponse {
  generated_at: string;
  auto_submitted: AutoApplicationDraft[];
  pending_user_input: AutoApplicationStatus[];
  sms_queue: SmsEvent[];
}
