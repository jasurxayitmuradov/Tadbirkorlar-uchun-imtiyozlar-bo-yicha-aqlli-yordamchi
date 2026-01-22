import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthed, register, login } from '../lib/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Auth = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthed()) navigate('/profile', { replace: true });
  }, [navigate]);

  const onRegisterChange = (field: keyof typeof registerForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onLoginChange = (field: keyof typeof loginForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validateRegister = () => {
    if (!registerForm.firstName.trim() || !registerForm.lastName.trim()) {
      return 'Ism va familiya majburiy.';
    }
    if (!registerForm.email.trim()) return 'Email yoki username majburiy.';
    if (registerForm.email.includes('@') && !emailRegex.test(registerForm.email)) {
      return 'Email formati noto‘g‘ri.';
    }
    if (registerForm.password.length < 6) return 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.';
    if (registerForm.password !== registerForm.confirm) return 'Parolni tasdiqlash mos emas.';
    return '';
  };

  const validateLogin = () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      return 'Email/username va parol majburiy.';
    }
    return '';
  };

  const submitRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const validationError = validateRegister();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      register({
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });
      setLoading(false);
      navigate('/profile');
    }, 500);
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      setLoading(false);
      if (!result.ok) {
        setError('Login yoki parol noto‘g‘ri.');
        return;
      }
      navigate('/profile');
    }, 500);
  };

  const tabButtonBase =
    'px-4 py-2 text-sm rounded-lg transition-colors border';
  const fieldBorder = error
    ? 'border-red-500/50 focus:border-red-400'
    : 'border-white/10 focus:border-ion-500';

  const mvpNote = useMemo(
    () => 'MVP demo: ma’lumotlar qurilmada saqlanadi.',
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/70 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Kirish / Ro‘yxatdan o‘tish</h1>
          <span className="text-xs text-slate-500">MVP Auth</span>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`${tabButtonBase} ${
              tab === 'login'
                ? 'bg-ion-600/30 border-ion-500/40 text-ion-100'
                : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`${tabButtonBase} ${
              tab === 'register'
                ? 'bg-ion-600/30 border-ion-500/40 text-ion-100'
                : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
          >
            Ro‘yxatdan o‘tish
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={submitLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Email yoki username</label>
              <input
                type="text"
                value={loginForm.email}
                onChange={onLoginChange('email')}
                className={`mt-1 w-full bg-slate-950/60 border ${fieldBorder} rounded-lg px-3 py-2 text-white focus:outline-none`}
                placeholder="example@mail.com yoki username"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Parol</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={onLoginChange('password')}
                className={`mt-1 w-full bg-slate-950/60 border ${fieldBorder} rounded-lg px-3 py-2 text-white focus:outline-none`}
                placeholder="******"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ion-600 hover:bg-ion-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Kuting...' : 'Kirish'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Ism</label>
                <input
                  type="text"
                  value={registerForm.firstName}
                  onChange={onRegisterChange('firstName')}
                  className={`mt-1 w-full bg-slate-950/60 border ${fieldBorder} rounded-lg px-3 py-2 text-white focus:outline-none`}
                  placeholder="Ism"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Familiya</label>
                <input
                  type="text"
                  value={registerForm.lastName}
                  onChange={onRegisterChange('lastName')}
                  className={`mt-1 w-full bg-slate-950/60 border ${fieldBorder} rounded-lg px-3 py-2 text-white focus:outline-none`}
                  placeholder="Familiya"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Email yoki username</label>
              <input
                type="text"
                value={registerForm.email}
                onChange={onRegisterChange('email')}
                className={`mt-1 w-full bg-slate-950/60 border ${fieldBorder} rounded-lg px-3 py-2 text-white focus:outline-none`}
                placeholder="example@mail.com yoki username"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Parol</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={onRegisterChange('password')}
                className={`mt-1 w-full bg-slate-950/60 border ${fieldBorder} rounded-lg px-3 py-2 text-white focus:outline-none`}
                placeholder="Kamida 6 belgi"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Parolni tasdiqlash</label>
              <input
                type="password"
                value={registerForm.confirm}
                onChange={onRegisterChange('confirm')}
                className="mt-1 w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ion-500"
                placeholder="Parolni qayta kiriting"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ion-600 hover:bg-ion-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Kuting...' : 'Ro‘yxatdan o‘tish'}
            </button>
          </form>
        )}

        <p className="text-xs text-slate-500 mt-6">{mvpNote}</p>
      </div>
    </div>
  );
};
