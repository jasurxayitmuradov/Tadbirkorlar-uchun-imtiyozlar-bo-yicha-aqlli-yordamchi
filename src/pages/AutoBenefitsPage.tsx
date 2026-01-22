import React, { useEffect, useState } from 'react';

type Submission = {
  id: string;
  companyName: string;
  stir: string;
  region: string;
  benefitType: string;
  message: string;
  createdAt: number;
  status: 'qabul qilindi';
};

const STORAGE_KEY = 'bn_auto_benefit_submissions';
const BUSINESS_KEY = 'bn_auto_businesses';
const BUSINESS_SELECTED_KEY = 'bn_auto_business_selected';

const regions = [
  'Barcha hududlar', 'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro',
  "Farg'ona", 'Jizzax', 'Xorazm', 'Namangan', 'Navoiy',
  'Qashqadaryo', 'Qoraqalpog‘iston', 'Samarqand', 'Sirdaryo', 'Surxondaryo',
];

const businessTypes = [
  'YTT — Savdo',
  'YTT — Xizmat',
  'MChJ — Ishlab chiqarish',
  'MChJ — IT xizmatlar',
  'Fermer xo‘jaligi',
  'Hunarmandchilik',
];

export const AutoBenefitsPage: React.FC = () => {
  const [form, setForm] = useState({
    companyName: '',
    stir: '',
    region: 'Toshkent shahri',
    benefitType: 'Soliq imtiyozi',
    message: '',
  });
  const [autoProfile, setAutoProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  const API_BASE =
    (import.meta.env.VITE_NEWS_API_BASE as string | undefined) ||
    'http://127.0.0.1:8000';

  const benefits = [
    {
      benefitId: 'BEN-001',
      benefitTitle: 'Soliq yengilligi (demo)',
      benefitSummary: 'Soliq bo‘yicha yengilliklar paketi (demo).',
      status_hint: 'amaldagi',
      applicationSpec: {
        requiredFields: ['tin', 'legalForm', 'companyName', 'phone', 'region', 'oked'],
        optionalFields: ['bankAccount', 'email', 'address'],
        requiredAttachments: ['registrationCert'],
        submitChannel: 'portal_api',
      },
      eligibilityRules: [],
      contextSnippets: [],
    },
    {
      benefitId: 'BEN-002',
      benefitTitle: 'Subsidiya (demo)',
      benefitSummary: 'Tadbirkorlar uchun subsidiya (demo).',
      status_hint: 'noaniq',
      applicationSpec: {
        requiredFields: ['tin', 'legalForm', 'companyName', 'phone', 'region'],
        optionalFields: ['bankAccount', 'email'],
        requiredAttachments: ['registrationCert', 'passportCopy'],
        submitChannel: 'operator_panel',
      },
      eligibilityRules: [],
      contextSnippets: [],
    },
    {
      benefitId: 'BEN-003',
      benefitTitle: 'Grant (manual link)',
      benefitSummary: 'Manual ariza bilan grant (demo).',
      status_hint: 'amaldagi',
      applicationSpec: {
        requiredFields: ['tin', 'legalForm', 'companyName', 'phone', 'region'],
        optionalFields: ['email'],
        requiredAttachments: [],
        submitChannel: 'manual_link',
        manualLink: 'https://example.uz/apply',
      },
      eligibilityRules: [],
      contextSnippets: [],
    },
  ];
  const taxApplications = [
    {
      applicationId: 'TAX-001',
      title: 'Ortiqcha to‘langan soliqni qaytarish (demo)',
      summary: 'Ortiqcha to‘langan soliq summasini qaytarish bo‘yicha ariza.',
      serviceUrl: 'https://my.gov.uz/uz/service/123',
      status_hint: 'amaldagi',
      submitChannel: 'mygov_api',
      requiredFields: ['tin', 'firstName', 'lastName', 'phone', 'region'],
      requiredAttachments: [],
      needsOneID: true,
      needsECP: false,
      contextSnippets: [],
    },
    {
      applicationId: 'TAX-002',
      title: 'Soliq organiga murojaat (demo)',
      summary: 'Soliq organiga murojaat qilish xizmati.',
      serviceUrl: 'https://my.gov.uz/uz/service/456',
      status_hint: 'noaniq',
      submitChannel: 'manual_link',
      requiredFields: ['tin', 'firstName', 'lastName', 'phone', 'region'],
      requiredAttachments: ['passportCopy'],
      needsOneID: true,
      needsECP: true,
      contextSnippets: [],
    },
  ];

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSubmissions(JSON.parse(raw));
      } catch {
        setSubmissions([]);
      }
    }
    const prof = localStorage.getItem('bn_auto_profile');
    if (prof) {
      try {
        const parsed = JSON.parse(prof);
        setAutoProfile(parsed);
        const existing = localStorage.getItem(BUSINESS_KEY);
        if (!existing) {
          const initial = [{
            ...parsed,
            businessId: 'B-001',
            businessType: businessTypes[0],
          }];
          setBusinesses(initial);
          setSelectedBusinessId('B-001');
          localStorage.setItem(BUSINESS_KEY, JSON.stringify(initial));
          localStorage.setItem(BUSINESS_SELECTED_KEY, 'B-001');
        }
      } catch {
        setAutoProfile(null);
      }
    }
    const bizRaw = localStorage.getItem(BUSINESS_KEY);
    if (bizRaw) {
      try {
        const list = JSON.parse(bizRaw);
        setBusinesses(list);
      } catch {
        setBusinesses([]);
      }
    }
    const selected = localStorage.getItem(BUSINESS_SELECTED_KEY);
    if (selected) setSelectedBusinessId(selected);
    const notif = localStorage.getItem('bn_auto_notifications');
    if (notif) {
      try {
        setNotifications(JSON.parse(notif));
      } catch {
        setNotifications([]);
      }
    }
  }, []);

  const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const selectedBusiness = businesses.find((b) => b.businessId === selectedBusinessId) || autoProfile;

  const saveBusinesses = (next: any[]) => {
    setBusinesses(next);
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(next));
  };

  const updateBusinessField = (field: string, value: any) => {
    const next = businesses.map((b) =>
      b.businessId === selectedBusinessId ? { ...b, [field]: value } : b
    );
    saveBusinesses(next);
    if (selectedBusinessId && selectedBusinessId === 'B-001') {
      const updated = next.find((b) => b.businessId === selectedBusinessId);
      if (updated) {
        setAutoProfile(updated);
        localStorage.setItem('bn_auto_profile', JSON.stringify(updated));
      }
    }
  };

  const updateBusinessAttachment = (key: string, value: boolean) => {
    const next = businesses.map((b) =>
      b.businessId === selectedBusinessId
        ? {
            ...b,
            attachments: { ...(b.attachments || {}), [key]: value ? `${key}-file` : null },
          }
        : b
    );
    saveBusinesses(next);
  };

  const addBusiness = () => {
    const id = `B-${Date.now()}`;
    const base = {
      businessId: id,
      businessType: businessTypes[0],
      consentAutoSubmit: false,
      legalForm: 'YTT',
      companyName: '',
      firstName: '',
      lastName: '',
      tin: '',
      phone: '',
      region: 'Toshkent shahri',
      address: '',
      oked: [],
      bankAccount: '',
      email: '',
      employeesCount: 0,
      annualTurnover: 0,
      attachments: {
        registrationCert: null,
        charter: null,
        directorOrder: null,
        passportCopy: null,
      },
    };
    const next = [base, ...businesses];
    saveBusinesses(next);
    setSelectedBusinessId(id);
    localStorage.setItem(BUSINESS_SELECTED_KEY, id);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setLoading(true);
    setTimeout(() => {
      const newItem: Submission = {
        id: `auto-${Date.now()}`,
        companyName: form.companyName.trim(),
        stir: form.stir.trim(),
        region: form.region,
        benefitType: form.benefitType,
        message: form.message.trim(),
        createdAt: Date.now(),
        status: 'qabul qilindi',
      };
      const updated = [newItem, ...submissions];
      setSubmissions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setLoading(false);
      setSuccess('Ariza avtomatik qabul qilindi. Operatorlar ko‘rib chiqadi (demo).');
      setForm({
        companyName: '',
        stir: '',
        region: 'Toshkent shahri',
        benefitType: 'Soliq imtiyozi',
        message: '',
      });
    }, 500);
  };

  const getMissing = (benefit: any) => {
    const missingFields = benefit.applicationSpec.requiredFields.filter((field: string) => {
      const value = selectedBusiness?.[field];
      if (Array.isArray(value)) return value.length === 0;
      return !value;
    });
    const missingAttachments = benefit.applicationSpec.requiredAttachments.filter(
      (att: string) => !selectedBusiness?.attachments?.[att]
    );
    return { missingFields, missingAttachments };
  };

  const getStatus = (benefitId: string) => {
    const mapRaw = localStorage.getItem('bn_auto_benefit_status');
    if (!mapRaw) return 'Draft';
    try {
      const map = JSON.parse(mapRaw);
      return map[benefitId] || 'Draft';
    } catch {
      return 'Draft';
    }
  };

  const setStatus = (benefitId: string, status: string) => {
    const mapRaw = localStorage.getItem('bn_auto_benefit_status');
    let map = {};
    if (mapRaw) {
      try {
        map = JSON.parse(mapRaw);
      } catch {
        map = {};
      }
    }
    const updated = { ...map, [benefitId]: status };
    localStorage.setItem('bn_auto_benefit_status', JSON.stringify(updated));
  };

  const runAuto = async (benefit: any) => {
    if (!selectedBusiness) return;
    const payload = {
      benefit,
      user_profile: selectedBusiness,
      app_base_url: `${window.location.origin}/#`,
    };
    const res = await fetch(`${API_BASE}/api/benefits/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setStatus(benefit.benefitId, 'Failed');
      return;
    }
    const decision = await res.json();
    if (decision.decision === 'AUTO_SUBMIT') {
      const submitRes = await fetch(`${API_BASE}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision.submit_request.body),
      });
      if (submitRes.ok) {
        setStatus(benefit.benefitId, 'Submitted');
      } else {
        setStatus(benefit.benefitId, 'Failed');
      }
    } else if (decision.decision === 'SEND_SMS') {
      await fetch(`${API_BASE}/api/notify/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision.sms),
      });
      setStatus(benefit.benefitId, 'Needs_Info');
      const entry = { id: `sms-${Date.now()}`, text: decision.sms.text, createdAt: Date.now() };
      const updated = [entry, ...notifications];
      setNotifications(updated);
      localStorage.setItem('bn_auto_notifications', JSON.stringify(updated));
    } else {
      setStatus(benefit.benefitId, 'Draft');
    }
  };

  const runAutoTax = async (app: any) => {
    if (!selectedBusiness) return;
    const payload = {
      tax_application: app,
      user_profile: selectedBusiness,
      app_base_url: `${window.location.origin}/#`,
    };
    const res = await fetch(`${API_BASE}/api/tax/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setStatus(app.applicationId, 'Failed');
      return;
    }
    const decision = await res.json();
    if (decision.decision === 'AUTO_SUBMIT') {
      const submitRes = await fetch(`${API_BASE}/api/mygov/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision.submit_request.body),
      });
      if (submitRes.ok) {
        setStatus(app.applicationId, 'Submitted');
      } else {
        setStatus(app.applicationId, 'Failed');
      }
    } else if (decision.decision === 'SEND_SMS' || decision.decision === 'MANUAL_ONLY') {
      await fetch(`${API_BASE}/api/notify/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision.sms),
      });
      setStatus(app.applicationId, decision.decision === 'MANUAL_ONLY' ? 'Draft' : 'Needs_Info');
      const entry = { id: `sms-${Date.now()}`, text: decision.sms.text, createdAt: Date.now() };
      const updated = [entry, ...notifications];
      setNotifications(updated);
      localStorage.setItem('bn_auto_notifications', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Imtiyozlarni avtomatik qabul qilish</h1>
        <p className="text-slate-400">Arizalarni tez va soddalashtirilgan tarzda qabul qilish (MVP demo).</p>
      </header>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Tadbirkorlik profillari</h3>
              <button
                onClick={addBusiness}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg"
              >
                + Yangi biznes
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Biznes turi</label>
                <select
                  value={selectedBusinessId || ''}
                  onChange={(e) => {
                    setSelectedBusinessId(e.target.value);
                    localStorage.setItem(BUSINESS_SELECTED_KEY, e.target.value);
                  }}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {businesses.map((b) => (
                    <option key={b.businessId} value={b.businessId} className="bg-slate-900">
                      {b.businessType || b.companyName || b.businessId}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Faoliyat turi</label>
                <select
                  value={selectedBusiness?.businessType || businessTypes[0]}
                  onChange={(e) => updateBusinessField('businessType', e.target.value)}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  {businessTypes.map((t) => (
                    <option key={t} value={t} className="bg-slate-900">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Kompaniya nomi</label>
                <input
                  value={selectedBusiness?.companyName || ''}
                  onChange={(e) => updateBusinessField('companyName', e.target.value)}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">STIR</label>
                <input
                  value={selectedBusiness?.tin || ''}
                  onChange={(e) => updateBusinessField('tin', e.target.value)}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Telefon</label>
                <input
                  value={selectedBusiness?.phone || ''}
                  onChange={(e) => updateBusinessField('phone', e.target.value)}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Tashkiliy shakl</label>
                <select
                  value={selectedBusiness?.legalForm || 'YTT'}
                  onChange={(e) => updateBusinessField('legalForm', e.target.value)}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="YTT" className="bg-slate-900">YTT</option>
                  <option value="MChJ" className="bg-slate-900">MChJ</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Hudud</label>
                <input
                  value={selectedBusiness?.region || ''}
                  onChange={(e) => updateBusinessField('region', e.target.value)}
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">OKED (vergul bilan)</label>
                <input
                  value={(selectedBusiness?.oked || []).join(',')}
                  onChange={(e) =>
                    updateBusinessField(
                      'oked',
                      e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                    )
                  }
                  className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={!!selectedBusiness?.consentAutoSubmit}
                onChange={(e) => updateBusinessField('consentAutoSubmit', e.target.checked)}
                className="accent-ion-500"
              />
              Avto yuborishga roziman
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Hujjatlar (demo)</p>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-300">
                {['registrationCert','charter','directorOrder','passportCopy'].map((key) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedBusiness?.attachments?.[key]}
                      onChange={(e) => updateBusinessAttachment(key, e.target.checked)}
                      className="accent-ion-500"
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Yangi imtiyozlar</h3>
            {benefits.map((benefit) => {
              const { missingFields, missingAttachments } = getMissing(benefit);
              const canAuto =
                selectedBusiness?.consentAutoSubmit &&
                missingFields.length === 0 &&
                missingAttachments.length === 0 &&
                benefit.applicationSpec.submitChannel !== 'manual_link';
              const badge = canAuto ? 'Auto-submit mumkin' : 'Ma’lumot yetishmaydi';
              const status = getStatus(benefit.benefitId);
              return (
                <div key={benefit.benefitId} className="bg-slate-950/70 border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">{benefit.benefitTitle}</p>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      canAuto ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                    }`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{benefit.benefitSummary}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-ion-300">{status}</span>
                  </div>
                  <button
                    onClick={() => runAuto(benefit)}
                    className="text-xs bg-ion-600/20 hover:bg-ion-600/30 border border-ion-500/30 text-ion-200 px-3 py-2 rounded-lg"
                  >
                    Avto jarayonni ishga tushirish
                  </button>
                  {missingFields.length > 0 && (
                    <p className="text-xs text-amber-300">Yetishmayotgan maydonlar: {missingFields.join(', ')}</p>
                  )}
                  {missingAttachments.length > 0 && (
                    <p className="text-xs text-amber-300">Yetishmayotgan hujjatlar: {missingAttachments.join(', ')}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Soliq arizalari (demo)</h3>
            {taxApplications.map((app) => {
              const missingFields = app.requiredFields.filter((field: string) => !selectedBusiness?.[field]);
              const missingAttachments = app.requiredAttachments.filter((att: string) => !selectedBusiness?.attachments?.[att]);
              const canAuto =
                selectedBusiness?.consentAutoSubmit &&
                missingFields.length === 0 &&
                missingAttachments.length === 0 &&
                app.submitChannel !== 'manual_link' &&
                !app.needsECP &&
                app.status_hint !== 'amalda_emas';
              const badge = canAuto ? 'Auto-submit mumkin' : 'Ma’lumot yetishmaydi';
              const status = getStatus(app.applicationId);
              return (
                <div key={app.applicationId} className="bg-slate-950/70 border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">{app.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      canAuto ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                    }`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{app.summary}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-ion-300">{status}</span>
                  </div>
                  <button
                    onClick={() => runAutoTax(app)}
                    className="text-xs bg-ion-600/20 hover:bg-ion-600/30 border border-ion-500/30 text-ion-200 px-3 py-2 rounded-lg"
                  >
                    Avto soliq arizasini ishga tushirish
                  </button>
                  {missingFields.length > 0 && (
                    <p className="text-xs text-amber-300">Yetishmayotgan maydonlar: {missingFields.join(', ')}</p>
                  )}
                  {missingAttachments.length > 0 && (
                    <p className="text-xs text-amber-300">Yetishmayotgan hujjatlar: {missingAttachments.join(', ')}</p>
                  )}
                  {app.needsECP && (
                    <p className="text-xs text-amber-300">Eslatma: ERI talab qilinadi.</p>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={submit} className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Kompaniya nomi</label>
              <input
                value={form.companyName}
                onChange={updateField('companyName')}
                required
                className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ion-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">STIR</label>
              <input
                value={form.stir}
                onChange={updateField('stir')}
                required
                className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ion-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Hudud</label>
              <select
                value={form.region}
                onChange={updateField('region')}
                className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                {regions.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Imtiyoz turi</label>
              <input
                value={form.benefitType}
                onChange={updateField('benefitType')}
                className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ion-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Qisqa izoh</label>
            <textarea
              value={form.message}
              onChange={updateField('message')}
              rows={4}
              className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ion-500"
              placeholder="Ariza bo‘yicha qisqa izoh..."
            />
          </div>

          <div className="text-xs text-slate-500">
            MVP demo: hujjat yuklash va rasmiy tekshiruv keyinroq qo‘shiladi.
          </div>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ion-600 hover:bg-ion-500 text-white py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? 'Yuborilmoqda...' : 'Arizani avtomatik qabul qilish'}
          </button>
          </form>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">So‘nggi arizalar</h3>
          {submissions.length === 0 && (
            <p className="text-sm text-slate-500">Hozircha arizalar yo‘q.</p>
          )}
          <div className="space-y-3">
            {submissions.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-slate-950/70 border border-white/10 rounded-lg p-3">
                <p className="text-sm text-slate-200 font-medium">{item.companyName}</p>
                <p className="text-xs text-slate-500">{item.benefitType} • {item.region}</p>
                <p className="text-xs text-emerald-300 mt-1">Status: {item.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">SMS bildirishnomalari</h3>
          {notifications.length === 0 && (
            <p className="text-sm text-slate-500">Hozircha SMS yuborilmadi.</p>
          )}
          <div className="space-y-3">
            {notifications.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-slate-950/70 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                <p className="text-sm text-slate-200">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
