import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { CoursesPage } from './pages/CoursesPage';
import { NewsPage } from './pages/NewsPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { SourcesPage } from './pages/SourcesPage';
import { Sidebar } from './components/Sidebar';
import { Menu, Monitor, Sun, Moon } from 'lucide-react';
import { applyTheme, getStoredTheme, initTheme, setStoredTheme } from './services/theme';
import type { Theme } from './types';

// Shell Component for Authenticated Routes
const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const [theme, setTheme] = React.useState<Theme>(getStoredTheme());

  const user = localStorage.getItem('user_profile');
  if (!user) return <Navigate to="/login" />;

  const pageTitles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/chat': 'AI Assistant',
    '/app/news': 'Official News',
    '/app/benefits': 'Benefits Catalog',
    '/app/courses': 'Courses',
    '/app/sources': 'Data Sources',
    '/app/settings': 'Settings'
  };

  const currentTitle = pageTitles[location.pathname] || 'Benefit Navigator';
  const handleThemeChange = (value: Theme) => {
    setTheme(value);
    setStoredTheme(value);
    applyTheme(value);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (Mobile) */}
        <header className="lg:hidden h-16 border-b border-white/5 flex items-center px-4 bg-slate-950/80 backdrop-blur-md z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-white">{currentTitle}</span>
          <div className="ml-auto">
            <ThemeToggle value={theme} onChange={handleThemeChange} />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin relative">
           <div className="hidden lg:block fixed top-4 right-4 z-40">
             <ThemeToggle value={theme} onChange={handleThemeChange} />
           </div>
           {/* Background Decoration */}
           <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-ion-900/10 rounded-full blur-[100px] pointer-events-none" />
           
           <div className="max-w-6xl mx-auto relative z-10">
             <Outlet />
           </div>
        </main>
      </div>
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

// Placeholder for Settings
const SettingsPage = () => (
    <SettingsPanel />
);

const SettingsPanel: React.FC = () => {
  return (
    <div className="glass-panel p-8 rounded-xl max-w-lg mx-auto mt-10 text-center animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
      >
        Reset App Data (Log out)
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
        <Route path="/app" element={<AppShell />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="benefits" element={<BenefitsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </Router>
  );
}

export default App;
