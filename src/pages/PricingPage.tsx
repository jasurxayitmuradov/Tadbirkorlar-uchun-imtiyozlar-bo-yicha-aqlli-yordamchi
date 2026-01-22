import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Premium va Freemium</h1>
        <p className="text-slate-400">
          Platformadan foyda olish modeli — tadbirkorlar uchun kuchli qiymat yaratish.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck size={18} className="text-slate-400" />
            <span className="text-sm uppercase tracking-wider">Freemium</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Bepul asosiy imkoniyatlar</h2>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• Asosiy kurslar va demo darslar</li>
            <li>• AI yordamchi (standart javoblar)</li>
            <li>• Yangiliklar asosiy ko‘rinish</li>
            <li>• Progress tracking (local)</li>
          </ul>
          <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg">
            Freemium rejada qolish
          </button>
        </div>

        <div className="bg-gradient-to-br from-ion-600/20 via-slate-900 to-emerald-500/20 border border-ion-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-ion-200">
            <Sparkles size={18} className="text-ion-300" />
            <span className="text-sm uppercase tracking-wider">Premium</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Eng kerakli qiymat</h2>
          <ul className="text-sm text-slate-200 space-y-2">
            <li>• AI chat bot yanada aqilliroq va aniq tavsiyalar</li>
            <li>• Yangiliklar tahlili kuchli va amaliy xulosa bilan</li>
            <li>• Reklamalarsiz toza tajriba</li>
            <li>• Eng kerakli premium kurslar to‘plami</li>
            <li>• Tezkor qo‘llab‑quvvatlash (demo)</li>
          </ul>
          <button className="w-full bg-ion-600 hover:bg-ion-500 text-white py-2 rounded-lg">
            Premiumga o‘tish (demo)
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-slate-300 mb-3">
          <Zap size={18} className="text-amber-300" />
          <h3 className="text-lg font-semibold text-white">Premium kurslar nima uchun muhim?</h3>
        </div>
        <p className="text-sm text-slate-400">
          Premium kurslar tadbirkorlar uchun “eng kerakli” mavzularni qamrab oladi:
          soliq va hisobot, grant/subsidiya, huquqiy risklarni kamaytirish, hamda amaliy
          chek‑listlar. Bu modul monetizatsiyaning asosiy drayveri bo‘ladi.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Monetizatsiya modeli (MVP)</h3>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>• Freemium: asosiy kurslar va demo kontent</li>
          <li>• Premium: aqlli AI, kuchli tahlil, reklamasiz tajriba, premium kurslar</li>
          <li>• Kelajak: korporativ paketlar va sertifikatlash</li>
        </ul>
      </div>
    </div>
  );
};
