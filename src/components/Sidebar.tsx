import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Newspaper, MessageSquareText, 
  Gift, GraduationCap, Database, Settings, ShieldCheck, Languages, ChevronDown 
} from 'lucide-react';
import { Language } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/app/dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { path: '/app/news', labelKey: 'sidebar.news', icon: Newspaper },
  { path: '/app/chat', labelKey: 'sidebar.chat', icon: MessageSquareText },
  { path: '/app/benefits', labelKey: 'sidebar.benefits', icon: Gift },
  { path: '/app/courses', labelKey: 'sidebar.courses', icon: GraduationCap },
  { path: '/app/sources', labelKey: 'sidebar.sources', icon: Database },
  { path: '/app/settings', labelKey: 'sidebar.settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Default til o'zbekcha bo'lishi
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (!savedLang) {
      i18n.changeLanguage('uz');
      localStorage.setItem('i18nextLng', 'uz');
    }
  }, [i18n]);

  const currentLanguage = (i18n.language || 'uz') as Language;

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setLanguageDropdownOpen(false);
  };

  // Dropdown tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-950 border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ion-500 shadow-[0_0_15px_#0ea5e9] flex items-center justify-center text-white font-bold">
              B
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-lg tracking-tight text-white">Benefit Nav</span>
              <span className="text-xs text-ion-400">Uzbekistan</span>
            </div>
          </div>

          {/* Til tanlash bo'limi - Tepada */}
          <div className="px-4 pb-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 hover:bg-slate-900 hover:border-ion-500/30 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Languages size={18} className="text-ion-400" />
                  <span className="text-slate-300 font-medium">{t('sidebar.language')}</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                  <button
                    onClick={() => changeLanguage('uz')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      currentLanguage === 'uz'
                        ? 'bg-ion-600/20 text-ion-400 border-l-2 border-ion-500'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium">O'Z</span>
                    <span className="text-xs text-slate-500 ml-auto">O'zbek</span>
                  </button>
                  <button
                    onClick={() => changeLanguage('ru')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      currentLanguage === 'ru'
                        ? 'bg-ion-600/20 text-ion-400 border-l-2 border-ion-500'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium">RU</span>
                    <span className="text-xs text-slate-500 ml-auto">Русский</span>
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      currentLanguage === 'en'
                        ? 'bg-ion-600/20 text-ion-400 border-l-2 border-ion-500'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium">EN</span>
                    <span className="text-xs text-slate-500 ml-auto">English</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app/dashboard'}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => {
                  // Faqat aniq path mos kelganda aktiv bo'ladi
                  // HashRouter uchun location.pathname bilan ham tekshiramiz
                  const currentPath = location.pathname;
                  const exactMatch = currentPath === item.path || 
                    (item.path === '/app/dashboard' && (currentPath === '/app' || currentPath === '/app/'));
                  
                  const active = isActive || exactMatch;
                  
                  return `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active 
                      ? 'bg-ion-500/10 text-ion-400 border border-ion-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                  `;
                }}
              >
                <item.icon size={20} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </nav>

          {/* Trusted Sources */}
          <div className="p-4 border-t border-white/5">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-center gap-3">
              <ShieldCheck className="text-green-400" size={20} />
              <div>
                <p className="text-xs text-slate-400">Trusted Sources</p>
                <p className="text-xs font-semibold text-slate-200">100% Official</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
