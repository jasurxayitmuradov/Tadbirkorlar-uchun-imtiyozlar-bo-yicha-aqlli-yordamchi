import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Auth } from './pages/Auth.tsx';
import { Profile } from './pages/Profile.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { isAuthed } from './lib/auth.ts';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { NewsPage } from './pages/NewsPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { SourcesPage } from './pages/SourcesPage';
import { PricingPage } from './pages/PricingPage';
import { AutoApplicationPage } from './pages/AutoApplicationPage';
import { Sidebar } from './components/Sidebar';
import { Menu, Monitor, Sun, Moon, Command, House, MessageSquareText, Newspaper, FilePenLine } from 'lucide-react';
import { applyTheme, getStoredTheme, initTheme, setStoredTheme } from './services/theme';
import type { Theme } from './types';
import './i18n/config';

// Shell Component for Authenticated Routes
const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [paletteQuery, setPaletteQuery] = React.useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState<Theme>(getStoredTheme());

  if (!isAuthed()) return <Navigate to="/auth" />;

  const pageTitles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/chat': 'AI Assistant',
    '/app/news': 'Official News',
    '/app/benefits': 'Benefits Catalog',
    '/app/auto-application': 'Auto Application',
    '/app/sources': 'Data Sources',
    '/app/settings': 'Settings'
  };

  const currentTitle = pageTitles[location.pathname] || 'Benefit Navigator';
  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    setStoredTheme(value);
    applyTheme(value);
  };

  const quickActions = React.useMemo(
    () => [
      { id: 'go-dashboard', label: 'Dashboard', hint: 'Bosh sahifaga o‘tish', run: () => navigate('/app/dashboard') },
      { id: 'go-chat', label: 'AI Chat', hint: 'Yuridik AI copilotni ochish', run: () => navigate('/app/chat') },
      { id: 'go-news', label: 'News', hint: 'Rasmiy yangiliklar', run: () => navigate('/app/news') },
      { id: 'go-auto', label: 'Auto Application', hint: 'Avto ariza paneli', run: () => navigate('/app/auto-application') },
      { id: 'go-benefits', label: 'Benefits', hint: 'Imtiyozlar katalogi', run: () => navigate('/app/benefits') },
      { id: 'theme-light', label: 'Theme: Light', hint: 'Yorug‘ rejim', run: () => handleThemeChange('light') },
      { id: 'theme-dark', label: 'Theme: Dark', hint: 'Qorong‘i rejim', run: () => handleThemeChange('dark') },
      { id: 'theme-system', label: 'Theme: System', hint: 'Sistemaga mos', run: () => handleThemeChange('system') },
      {
        id: 'logout',
        label: 'Chiqish',
        hint: 'Sessiyani tozalash',
        run: () => {
          localStorage.clear();
          navigate('/auth');
        },
      },
    ],
    [navigate, handleThemeChange]
  );

  const filteredActions = React.useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return quickActions;
    return quickActions.filter(
      (item) => item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
    );
  }, [quickActions, paletteQuery]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
        return;
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    setPaletteOpen(false);
    setPaletteQuery('');
  }, [location.pathname]);

  return (
    <div className="app-shell flex h-screen text-slate-200 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (Mobile) */}
        <header className="app-topbar lg:hidden h-16 border-b border-white/10 flex items-center px-4 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-white">{currentTitle}</span>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto mr-2 p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300"
            aria-label="Open quick actions"
          >
            <Command size={16} />
          </button>
          <div>
            <ThemeToggle value={theme} onChange={handleThemeChange} />
          </div>
        </header>

        {/* Content Area */}
        <main className="app-main flex-1 overflow-y-auto p-4 pb-24 lg:pb-8 lg:p-8 scrollbar-thin relative">
           <div className="hidden lg:block fixed top-4 right-4 z-40">
             <ThemeToggle value={theme} onChange={handleThemeChange} />
           </div>
           <button
             type="button"
             onClick={() => setPaletteOpen(true)}
             className="hidden lg:flex fixed top-4 right-48 z-40 items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-300 backdrop-blur hover:border-ion-500/40"
           >
             <Command size={14} />
             Quick Actions
             <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Ctrl+K</span>
           </button>
           {/* Background Decoration */}
           <div className="app-orb app-orb--one pointer-events-none" />
           <div className="app-orb app-orb--two pointer-events-none" />
           
           <div className="max-w-6xl mx-auto relative z-10 app-content-frame">
             <div key={location.pathname} className="route-stage">
               <Outlet />
             </div>
           </div>
        </main>
        <nav className="mobile-quickbar lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1 p-2">
            <button onClick={() => navigate('/app/dashboard')} className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] text-slate-300 hover:bg-white/10">
              <House size={16} />
              Home
            </button>
            <button onClick={() => navigate('/app/chat')} className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] text-slate-300 hover:bg-white/10">
              <MessageSquareText size={16} />
              AI Chat
            </button>
            <button onClick={() => navigate('/app/auto-application')} className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] text-slate-300 hover:bg-white/10">
              <FilePenLine size={16} />
              Ariza
            </button>
            <button onClick={() => navigate('/app/news')} className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] text-slate-300 hover:bg-white/10">
              <Newspaper size={16} />
              News
            </button>
          </div>
        </nav>
      </div>
      <CommandPalette
        isOpen={paletteOpen}
        query={paletteQuery}
        actions={filteredActions}
        onChangeQuery={setPaletteQuery}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
};

const ThemeToggle: React.FC<{ value: Theme; onChange: (value: Theme) => void }> = ({ value, onChange }) => {
  const base =
    'relative inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs text-slate-300 shadow-lg backdrop-blur';
  const buttonBase =
    'relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300';

  const indicator =
    value === 'system' ? 'translate-x-0' : value === 'light' ? 'translate-x-9' : 'translate-x-[72px]';

  return (
    <div className={base} role="group" aria-label="Theme">
      <div
        className={`absolute left-1 top-1 h-8 w-8 rounded-full bg-ion-600/40 shadow-[0_0_12px_rgba(14,165,233,0.4)] transition-transform duration-300 ${indicator}`}
      />
      <button
        type="button"
        onClick={() => onChange('system')}
        className={`${buttonBase} ${value === 'system' ? 'text-ion-200 scale-105' : 'hover:text-white'}`}
        title="System"
      >
        <Monitor size={16} className={value === 'system' ? 'animate-pulse' : ''} />
      </button>
      <button
        type="button"
        onClick={() => onChange('light')}
        className={`${buttonBase} ${value === 'light' ? 'text-yellow-200 scale-105' : 'hover:text-white'}`}
        title="Light"
      >
        <Sun size={16} className={value === 'light' ? 'animate-spin-slow' : ''} />
      </button>
      <button
        type="button"
        onClick={() => onChange('dark')}
        className={`${buttonBase} ${value === 'dark' ? 'text-indigo-200 scale-105' : 'hover:text-white'}`}
        title="Dark"
      >
        <Moon size={16} className={value === 'dark' ? 'animate-pulse' : ''} />
      </button>
    </div>
  );
};

interface QuickAction {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

const CommandPalette: React.FC<{
  isOpen: boolean;
  query: string;
  actions: QuickAction[];
  onClose: () => void;
  onChangeQuery: (value: string) => void;
}> = ({ isOpen, query, actions, onClose, onChangeQuery }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-24">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close command palette"
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <Command size={16} className="text-ion-300" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Quick action qidiring..."
            className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin p-1">
          {actions.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
              Hech narsa topilmadi.
            </div>
          )}
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.run();
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-lg border border-transparent bg-white/5 px-3 py-2 text-left transition-colors hover:border-ion-500/30 hover:bg-white/10"
            >
              <span className="text-sm text-slate-100">{action.label}</span>
              <span className="text-xs text-slate-400">{action.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Placeholder for Settings
const SettingsPage = () => (
    <SettingsPanel />
);

const SettingsPanel: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="glass-panel p-8 rounded-xl max-w-lg mx-auto mt-10 text-center animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-6">{t('settings.title')}</h2>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
      >
        {t('settings.reset')}
      </button>
      <p className="mt-4 text-xs text-slate-500">Version 1.0.0 • React 19</p>
    </div>
  );
};

function App() {
  React.useEffect(() => initTheme(), []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app" element={<AppShell />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="benefits" element={<BenefitsPage />} />
          <Route path="auto-application" element={<AutoApplicationPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </Router>
  );
}

export default App;
