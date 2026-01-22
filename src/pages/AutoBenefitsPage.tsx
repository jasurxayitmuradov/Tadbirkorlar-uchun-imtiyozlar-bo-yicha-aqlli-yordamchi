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

const regions = [
  'Barcha hududlar', 'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro',
  "Farg'ona", 'Jizzax', 'Xorazm', 'Namangan', 'Navoiy',
  'Qashqadaryo', 'Qoraqalpog‘iston', 'Samarqand', 'Sirdaryo', 'Surxondaryo',
];

export const AutoBenefitsPage: React.FC = () => {
  const [form, setForm] = useState({
    companyName: '',
    stir: '',
    region: 'Toshkent shahri',
    benefitType: 'Soliq imtiyozi',
    message: '',
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSubmissions(JSON.parse(raw));
      } catch {
        setSubmissions([]);
      }
    }
  }, []);

  const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
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

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Imtiyozlarni avtomatik qabul qilish</h1>
        <p className="text-slate-400">Arizalarni tez va soddalashtirilgan tarzda qabul qilish (MVP demo).</p>
      </header>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
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
      </div>
    </div>
  );
};
