import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Newspaper, MessageSquareText, 
  Gift, GraduationCap, Database, Settings, ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/news', label: 'News', icon: Newspaper },
  { path: '/app/chat', label: 'AI Assistant', icon: MessageSquareText },
  { path: '/app/benefits', label: 'Benefits', icon: Gift },
  { path: '/app/courses', label: 'Courses', icon: GraduationCap },
  { path: '/app/sources', label: 'Sources', icon: Database },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">Benefit Nav</span>
              <span className="text-xs text-ion-400">Uzbekistan</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-ion-500/10 text-ion-400 border border-ion-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

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
