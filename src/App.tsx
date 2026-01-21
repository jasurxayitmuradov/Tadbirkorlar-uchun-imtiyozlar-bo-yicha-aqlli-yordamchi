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
import { Menu } from 'lucide-react';

// Shell Component for Authenticated Routes
const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

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
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin relative">
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

// Placeholder for Settings
const SettingsPage = () => (
    <div className="glass-panel p-8 rounded-xl max-w-lg mx-auto mt-10 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
        <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
        >
            Reset App Data (Log out)
        </button>
        <p className="mt-4 text-xs text-slate-500">Version 1.0.0 • React 19 • Gemini 3</p>
    </div>
);

function App() {
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
