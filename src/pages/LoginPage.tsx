import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserProfile, User } from '../types';
import { ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [method, setMethod] = useState<'login' | 'phone'>('login');
  const [error, setError] = useState('');

  // Login/Parol usuli
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Telefon usuli
  const [phone, setPhone] = useState('');

  const formatPhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('998')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.length > 0 && !cleaned.startsWith('998')) {
      return `+998${cleaned}`;
    }
    return `+${cleaned}`;
  };

  const getUsers = (): User[] => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (method === 'login') {
      // Login/Parol bilan kirish
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        const profile: UserProfile = {
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone,
          region: user.region,
        };
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('current_user', JSON.stringify(user));
        navigate('/app/dashboard');
      } else {
        setError(t('login.error.invalid'));
      }
    } else {
      // Telefon bilan kirish
      const formattedPhone = formatPhone(phone);
      const users = getUsers();
      const user = users.find(u => u.phone === formattedPhone);

      if (user) {
        const profile: UserProfile = {
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone,
          region: user.region,
        };
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('current_user', JSON.stringify(user));
        navigate('/app/dashboard');
      } else {
        // Demo uchun: har qanday telefon raqam bilan kirish mumkin
        const profile: UserProfile = {
          name: 'Foydalanuvchi',
          region: 'Toshkent shahri',
          phone: formattedPhone,
        };
        localStorage.setItem('user_profile', JSON.stringify(profile));
        navigate('/app/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-ion-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 z-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-ion-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_#0ea5e9]">
            <span className="text-3xl font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('app.name')}</h1>
          <p className="text-slate-400">{t('app.subtitle')}</p>
        </div>

        {/* Usul tanlash */}
        <div className="mb-6 flex gap-2 bg-slate-900/50 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setMethod('login');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              method === 'login'
                ? 'bg-ion-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('login.method.login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod('phone');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              method === 'phone'
                ? 'bg-ion-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('login.method.phone')}
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {method === 'login' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('login.username')}</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
                  placeholder={t('login.username')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('login.password')}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
                  placeholder={t('login.password')}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('login.phone')}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
                placeholder={t('login.phone.placeholder')}
              />
              <p className="mt-1 text-xs text-slate-500">+998 avtomatik qo'shiladi</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-ion-600 hover:bg-ion-500 text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all transform hover:scale-[1.02]"
          >
            {t('login.submit')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {t('login.register.link')}{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-ion-400 hover:text-ion-300 font-semibold"
            >
              {t('login.register')}
            </button>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <ShieldCheck size={16} />
          <span>Verified Official Sources Only</span>
        </div>
      </div>
    </div>
  );
};
