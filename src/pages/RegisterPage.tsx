import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { User } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'sms'>('form');
  const [smsCode, setSmsCode] = useState('');
  const [sentCode, setSentCode] = useState<string>('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phone: '',
    region: 'Toshkent shahri',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const regions = [
    "Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", 
    "Farg'ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", 
    "Qashqadaryo", "Qoraqalpog'iston", "Samarqand", "Sirdaryo", "Surxondaryo"
  ];

  // Telefon raqamni formatlash
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

  // SMS kod yuborish (test uchun)
  const sendSMSCode = (phone: string) => {
    // Test uchun: 123456
    const testCode = '123456';
    
    console.log('SMS kod yuborildi:', testCode, 'Telefon:', phone);
    setSentCode(testCode);
    return testCode;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validatsiya
    if (formData.password.length < 6) {
      newErrors.password = t('register.error.password.short');
    }

    // Login takrorlanishini tekshirish
    const users = getUsers();
    if (users.find(u => u.username === formData.username)) {
      newErrors.username = t('register.error.username.exists');
    }

    // Telefon raqam takrorlanishini tekshirish
    const formattedPhone = formatPhone(formData.phone);
    if (users.find(u => u.phone === formattedPhone)) {
      newErrors.phone = t('register.error.phone.exists');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // SMS kod yuborish
    sendSMSCode(formattedPhone);
    setStep('sms');
  };

  const handleSMSVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (smsCode === sentCode || smsCode === '123456') {
      // Foydalanuvchini saqlash
      const newUser: User = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        phone: formatPhone(formData.phone),
        region: formData.region,
        createdAt: Date.now(),
      };

      const users = getUsers();
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // User profile yaratish
      const profile = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phone: formatPhone(formData.phone),
        region: formData.region,
      };
      localStorage.setItem('user_profile', JSON.stringify(profile));
      localStorage.setItem('current_user', JSON.stringify(newUser));

      navigate('/app/dashboard');
    } else {
      setErrors({ sms: t('sms.error.invalid') });
    }
  };

  const getUsers = (): User[] => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  };

  const handleResendCode = () => {
    sendSMSCode(formatPhone(formData.phone));
    setSmsCode('');
    setErrors({});
  };

  if (step === 'sms') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-ion-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <div className="w-full max-w-md glass-panel rounded-3xl p-8 z-10 animate-slide-up">
          <button
            onClick={() => setStep('form')}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('register.title')}</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-ion-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_#0ea5e9]">
              <span className="text-3xl font-bold text-white">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('sms.title')}</h1>
            <p className="text-slate-400">{t('sms.subtitle')}</p>
            <p className="text-sm text-ion-400 mt-2">{formatPhone(formData.phone)}</p>
          </div>

          <form onSubmit={handleSMSVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('sms.code')}</label>
              <input
                type="text"
                required
                maxLength={6}
                value={smsCode}
                onChange={(e) => {
                  setSmsCode(e.target.value.replace(/\D/g, ''));
                  setErrors({});
                }}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
                placeholder={t('sms.code.placeholder')}
              />
              {errors.sms && (
                <p className="mt-2 text-sm text-red-400">{errors.sms}</p>
              )}
              <p className="mt-2 text-xs text-slate-500 text-center">
                Test uchun: <span className="text-ion-400 font-mono">123456</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-ion-600 hover:bg-ion-500 text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all transform hover:scale-[1.02]"
            >
              {t('sms.verify')}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              className="w-full text-slate-400 hover:text-ion-400 text-sm transition-colors"
            >
              {t('sms.resend')}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white mb-2">{t('register.title')}</h1>
          <p className="text-slate-400">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('register.firstName')}</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
                placeholder={t('register.firstName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('register.lastName')}</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
                placeholder={t('register.lastName')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('register.username')}</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                setErrors({ ...errors, username: '' });
              }}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
              placeholder={t('register.username')}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('register.password')}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setErrors({ ...errors, password: '' });
              }}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
              placeholder={t('register.password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">{t('register.password.min')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('register.phone')}</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setErrors({ ...errors, phone: '' });
              }}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
              placeholder={t('login.phone.placeholder')}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('register.region')}</label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 transition-all"
            >
              {regions.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-ion-600 hover:bg-ion-500 text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all transform hover:scale-[1.02]"
          >
            {t('register.submit')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {t('register.login.link')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-ion-400 hover:text-ion-300 font-semibold"
            >
              {t('register.login')}
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
