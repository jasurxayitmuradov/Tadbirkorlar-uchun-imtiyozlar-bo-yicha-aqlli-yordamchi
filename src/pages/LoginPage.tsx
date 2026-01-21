import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Toshkent shahri');

  const regions = [
    "Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", 
    "Farg'ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", 
    "Qashqadaryo", "Qoraqalpog'iston", "Samarqand", "Sirdaryo", "Surxondaryo"
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && region) {
      const profile: UserProfile = { name, region };
      localStorage.setItem('user_profile', JSON.stringify(profile));
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-ion-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-ion-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_#0ea5e9]">
            <span className="text-3xl font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Benefit Navigator</h1>
          <p className="text-slate-400">Your guide to business in Uzbekistan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ismingiz (Name)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Hududingiz (Region)</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
            >
              {regions.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-ion-600 hover:bg-ion-500 text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all transform hover:scale-[1.02]"
          >
            Boshlash (Start)
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <ShieldCheck size={16} />
          <span>Verified Official Sources Only</span>
        </div>
      </div>
    </div>
  );
};
