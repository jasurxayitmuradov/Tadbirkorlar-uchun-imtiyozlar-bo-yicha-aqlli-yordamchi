import { useMemo, useState } from 'react';
import type {
  AutoApplicationAnalyzeResponse,
  AutoApplicationScanResponse,
  UserProfile,
} from '../types';
import {
  analyzeAndAutoSubmit,
  scanNewAutoApplications,
} from '../services/autoApplicationService';

const PROFILE_STORAGE_KEY = 'user_profile';

const loadProfile = (): UserProfile => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}') as UserProfile;
    return {
      name: parsed.name || '',
      region: parsed.region || 'Barcha hududlar',
      phone: parsed.phone || '',
      businessName: parsed.businessName || '',
      tin: parsed.tin || '',
      legalForm: parsed.legalForm || '',
      activityType: parsed.activityType || '',
      directorName: parsed.directorName || '',
      email: parsed.email || '',
      address: parsed.address || '',
      employeeCount: parsed.employeeCount,
    };
  } catch {
    return { name: '', region: 'Barcha hududlar' };
  }
};

export const AutoApplicationPage = () => {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState<AutoApplicationScanResponse | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AutoApplicationAnalyzeResponse | null>(null);

  const eligibleCount = useMemo(
    () => scanResult?.items.filter((item) => item.eligible).length || 0,
    [scanResult]
  );

  const saveProfile = () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  };

  const update = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const runFlow = async () => {
    setLoading(true);
    setError('');
    try {
      saveProfile();
      const scan = await scanNewAutoApplications(profile);
      setScanResult(scan);
      const analyze = await analyzeAndAutoSubmit(profile);
      setAnalyzeResult(analyze);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="status-marquee rounded-xl border border-red-300/30" role="status" aria-live="polite">
        <div className="status-marquee__track">
          <span>
            Davlat tomonidan ruxsat berilgandan so&apos;ng Avto ariza xizmati to&apos;liq ishlaydi.
          </span>
          <span aria-hidden="true">
            Davlat tomonidan ruxsat berilgandan so&apos;ng Avto ariza xizmati to&apos;liq ishlaydi.
          </span>
        </div>
      </div>
      <div className="glass-panel ai-panel scanline rounded-2xl p-5">
        <h1 className="text-2xl ai-title">Avto ariza xizmati</h1>
        <p className="text-slate-400 mt-1">
          Yangi arizalarni davlat platformalaridan tekshiradi, profilingiz bilan to&apos;ldiradi va
          ma&apos;lumot yetishmasa SMS navbatga qo&apos;yadi.
        </p>
        <div className="mt-3">
          <span className="ai-chip"><span className="ai-dot" /> AI Auto Flow Active</span>
        </div>
      </div>

      <section className="glass-panel ai-panel rounded-2xl p-5 space-y-4">
        <h2 className="text-lg text-white font-semibold">Biznes profilingiz</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Foydalanuvchi ismi" value={profile.name || ''} onChange={(e) => update('name', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Hudud" value={profile.region || ''} onChange={(e) => update('region', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Biznes nomi" value={profile.businessName || ''} onChange={(e) => update('businessName', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="STIR (TIN)" value={profile.tin || ''} onChange={(e) => update('tin', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Tashkiliy shakl (YTT/MCHJ)" value={profile.legalForm || ''} onChange={(e) => update('legalForm', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Faoliyat turi" value={profile.activityType || ''} onChange={(e) => update('activityType', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Direktor F.I.Sh" value={profile.directorName || ''} onChange={(e) => update('directorName', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Telefon (+998...)" value={profile.phone || ''} onChange={(e) => update('phone', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Email" value={profile.email || ''} onChange={(e) => update('email', e.target.value)} />
          <input className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-2 text-slate-100 placeholder:text-slate-400" placeholder="Manzil" value={profile.address || ''} onChange={(e) => update('address', e.target.value)} />
        </div>
        <button
          onClick={runFlow}
          disabled={loading}
          className="ai-button disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Tekshirilmoqda..." : "Yangi arizalarni tekshirish va avtomatik yuborish"}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </section>

      {loading && (
        <section className="grid md:grid-cols-2 gap-4">
          <div className="skeleton-card h-40 rounded-2xl" />
          <div className="skeleton-card h-40 rounded-2xl" />
        </section>
      )}

      {scanResult && (
        <section className="glass-panel ai-panel scanline rounded-2xl p-5 space-y-3">
          <h2 className="text-lg text-white font-semibold">Yangi arizalar tahlili</h2>
          <p className="text-sm text-slate-400">
            Jami: {scanResult.total} | Avto yuborishga tayyor: {eligibleCount}
          </p>
          <div className="space-y-2">
            {scanResult.items.map((item) => (
              <div key={item.opportunity.id} className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm p-3 ai-panel">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-200">{item.opportunity.title}</p>
                  <span className={`text-xs px-2 py-1 rounded ${item.eligible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {item.eligible ? 'Eligible' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {item.opportunity.platform} | Deadline: {item.opportunity.deadline}
                </p>
                {!item.eligible && item.missing_fields.length > 0 && (
                  <p className="text-xs text-amber-300 mt-2">
                    Yetishmayotgan maydonlar: {item.missing_fields.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !scanResult && (
        <section className="glass-panel ai-panel rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-lg ai-title">AI monitoring hali ishga tushmagan</h3>
          <p className="text-sm text-slate-400">
            Profil ma&apos;lumotlarini to&apos;ldirib, tekshiruvni boshlang. Tizim mos arizalarni avtomatik tahlil qiladi.
          </p>
        </section>
      )}

      {analyzeResult && (
        <section className="grid lg:grid-cols-2 gap-4">
          <div className="glass-panel ai-panel rounded-2xl p-5 space-y-3">
            <h2 className="text-lg text-white font-semibold">Avtomatik yuborilgan arizalar</h2>
            {analyzeResult.auto_submitted.length === 0 && (
              <p className="text-sm text-slate-400">Hozircha avtomatik yuborilgan ariza yo&apos;q.</p>
            )}
            {analyzeResult.auto_submitted.map((item) => (
              <div key={item.application_id} className="rounded-lg border border-emerald-400/20 bg-emerald-900/10 p-3">
                <p className="text-emerald-200 text-sm">{item.title}</p>
                <p className="text-xs text-emerald-300/80 mt-1">
                  {item.platform} | {item.status} | {new Date(item.submitted_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="glass-panel ai-panel rounded-2xl p-5 space-y-3">
            <h2 className="text-lg text-white font-semibold">SMS navbati</h2>
            {analyzeResult.sms_queue.length === 0 && (
              <p className="text-sm text-slate-400">Qo&apos;shimcha ma&apos;lumot so&apos;ralmadi.</p>
            )}
            {analyzeResult.sms_queue.map((sms, idx) => (
              <div key={`${sms.related_opportunity_id}-${idx}`} className="rounded-lg border border-amber-400/20 bg-amber-900/10 p-3">
                <p className="text-amber-100 text-sm">{sms.message}</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  {sms.to_phone} | {new Date(sms.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !analyzeResult && (
        <section className="glass-panel ai-panel rounded-2xl p-6 text-center">
          <p className="text-sm text-slate-400">
            Tahlil natijalari bu yerda ko&apos;rinadi: avtomatik yuborilgan arizalar va SMS navbat.
          </p>
        </section>
      )}
    </div>
  );
};
