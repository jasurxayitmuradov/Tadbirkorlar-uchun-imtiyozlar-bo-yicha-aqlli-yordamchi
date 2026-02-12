import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout, setPlan } from '../lib/auth';

const AvatarFallback = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24 text-ion-400">
    <defs>
      <linearGradient id="avatarGradient" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="112" height="112" rx="24" fill="url(#avatarGradient)" />
    <circle cx="60" cy="50" r="20" fill="#0f172a" opacity="0.85" />
    <rect x="26" y="76" width="68" height="28" rx="14" fill="#0f172a" opacity="0.85" />
  </svg>
);

export const Profile = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [plan, setPlanState] = React.useState(user?.plan || 'freemium');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleUpgrade = () => {
    setPlan('premium');
    setPlanState('premium');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Profil</h1>
          <nav className="text-sm text-slate-400">
            <button
              onClick={() => navigate('/app/profile')}
              className="hover:text-white transition-colors"
            >
              Profile
            </button>
          </nav>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
          <AvatarFallback />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-slate-400 mt-1">{user.email}</p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              Status: <span className="text-emerald-300 font-semibold">{plan === 'premium' ? 'Premium' : 'Freemium'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              MVP demo: ma’lumotlar qurilmada saqlanadi.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              type="button"
              className="w-full bg-slate-800 border border-white/10 text-slate-400 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Profilni tahrirlash (MVP’da keyinroq)
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-red-500/10 border border-red-500/30 text-red-200 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Profildan chiqish
            </button>
            {plan !== 'premium' && (
              <button
                type="button"
                onClick={handleUpgrade}
                className="w-full bg-ion-600 hover:bg-ion-500 text-white py-2 rounded-lg"
              >
                Premiumga o‘tish (demo)
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Profil holati</h3>
            <span className="text-sm text-slate-400">Joriy sessiya</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-500">Hisob turi</p>
              <p className="text-xl font-semibold text-white">
                {plan === 'premium' ? 'Premium' : 'Freemium'}
              </p>
            </div>
            <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-500">Login email</p>
              <p className="text-xl font-semibold text-white">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
