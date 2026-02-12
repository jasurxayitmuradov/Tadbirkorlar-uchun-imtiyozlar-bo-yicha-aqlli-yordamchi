import type {
  AutoApplicationAnalyzeResponse,
  AutoApplicationOpportunity,
  AutoApplicationScanResponse,
  AutoApplicationStatus,
  SmsEvent,
  UserProfile,
} from '../types';

const DEMO_DELAY_MS = 700;

const MOCK_OPPORTUNITIES: AutoApplicationOpportunity[] = [
  {
    id: 'app-2026-001',
    title: 'Ayollar tadbirkorligi uchun subsidiya',
    platform: 'my.gov.uz',
    published_at: '2026-02-11T09:00:00Z',
    deadline: '2026-03-15',
    target_regions: ['all'],
    required_fields: ['businessName', 'tin', 'legalForm', 'directorName', 'phone', 'activityType'],
    required_activity_keywords: ['xizmat', 'savdo', 'ishlab chiqarish'],
    allowed_legal_forms: ['YTT', 'MCHJ'],
  },
  {
    id: 'app-2026-002',
    title: 'Eksportyorlar uchun aylanma mablag kredit liniyasi',
    platform: 'lex.uz',
    published_at: '2026-02-12T07:30:00Z',
    deadline: '2026-02-28',
    target_regions: ['all'],
    required_fields: ['businessName', 'tin', 'legalForm', 'phone', 'email', 'address', 'activityType'],
    required_activity_keywords: ['eksport', 'logistika', 'ishlab chiqarish'],
    allowed_legal_forms: ['MCHJ'],
  },
  {
    id: 'app-2026-003',
    title: 'Yangi YTT uchun soliq imtiyozi arizasi',
    platform: 'soliq.uz',
    published_at: '2026-02-10T13:00:00Z',
    deadline: '2026-04-01',
    target_regions: ['all'],
    required_fields: ['businessName', 'tin', 'legalForm', 'phone'],
    required_activity_keywords: [],
    allowed_legal_forms: ['YTT'],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getProfileFieldValue = (profile: UserProfile, field: string): unknown => {
  const fieldMap: Record<string, unknown> = {
    name: profile.name,
    region: profile.region,
    businessName: profile.businessName,
    tin: profile.tin,
    legalForm: profile.legalForm,
    activityType: profile.activityType,
    directorName: profile.directorName,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    employeeCount: profile.employeeCount,
  };
  return fieldMap[field];
};

const getMissingFields = (profile: UserProfile, requiredFields: string[]): string[] =>
  requiredFields.filter((field) => {
    const value = getProfileFieldValue(profile, field);
    if (value === null || value === undefined) return true;
    return typeof value === 'string' ? value.trim().length === 0 : false;
  });

const isActivityMatched = (profile: UserProfile, keywords: string[]): boolean => {
  if (keywords.length === 0) return true;
  const text = (profile.activityType || '').toLowerCase();
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

const isLegalFormMatched = (profile: UserProfile, forms: string[]): boolean => {
  if (forms.length === 0) return true;
  const userForm = (profile.legalForm || '').toUpperCase();
  return forms.some((form) => form.toUpperCase() === userForm);
};

const toStatus = (profile: UserProfile, opportunity: AutoApplicationOpportunity): AutoApplicationStatus => {
  const missingFields = getMissingFields(profile, opportunity.required_fields);
  if (missingFields.length > 0) {
    return { opportunity, eligible: false, missing_fields: missingFields, reason: 'required_fields_missing' };
  }
  if (!isLegalFormMatched(profile, opportunity.allowed_legal_forms)) {
    return { opportunity, eligible: false, missing_fields: [], reason: 'legal_form_not_supported' };
  }
  if (!isActivityMatched(profile, opportunity.required_activity_keywords)) {
    return { opportunity, eligible: false, missing_fields: [], reason: 'activity_not_matched' };
  }
  return { opportunity, eligible: true, missing_fields: [], reason: 'eligible' };
};

export const scanNewAutoApplications = async (
  profile: UserProfile
): Promise<AutoApplicationScanResponse> => {
  await delay(DEMO_DELAY_MS);
  const items = MOCK_OPPORTUNITIES.map((opportunity) => toStatus(profile, opportunity));
  return {
    generated_at: new Date().toISOString(),
    total: items.length,
    items,
  };
};

export const analyzeAndAutoSubmit = async (
  profile: UserProfile
): Promise<AutoApplicationAnalyzeResponse> => {
  await delay(DEMO_DELAY_MS);
  const statuses = MOCK_OPPORTUNITIES.map((opportunity) => toStatus(profile, opportunity));
  const nowIso = new Date().toISOString();

  const autoSubmitted = statuses
    .filter((item) => item.eligible)
    .map((item) => ({
      application_id: `demo-${item.opportunity.id}-${Date.now()}`,
      opportunity_id: item.opportunity.id,
      title: item.opportunity.title,
      platform: item.opportunity.platform,
      status: 'submitted',
      submitted_at: nowIso,
      payload: {
        business_name: profile.businessName || '',
        tin: profile.tin || '',
        legal_form: profile.legalForm || '',
        activity_type: profile.activityType || '',
        director_name: profile.directorName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
      },
    }));

  const pendingUserInput = statuses.filter((item) => !item.eligible);
  const smsQueue: SmsEvent[] = pendingUserInput.map((item) => ({
    to_phone: profile.phone || 'unknown',
    message:
      item.missing_fields.length > 0
        ? `Auto ariza uchun ma'lumot yetishmaydi: ${item.opportunity.title}. Yetishmayotgan maydonlar: ${item.missing_fields.join(', ')}.`
        : `Auto ariza uchun moslik to'liq emas: ${item.opportunity.title}. Sabab: ${item.reason}.`,
    related_opportunity_id: item.opportunity.id,
    created_at: nowIso,
  }));

  return {
    generated_at: nowIso,
    auto_submitted: autoSubmitted,
    pending_user_input: pendingUserInput,
    sms_queue: smsQueue,
  };
};
