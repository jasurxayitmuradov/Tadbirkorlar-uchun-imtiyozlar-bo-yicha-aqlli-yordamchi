import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewsItem, UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { getNews } from '../services/newsService';
import { MessageSquareText, Zap, ChevronRight, FilePenLine } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const profile: UserProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [benefitsCount, setBenefitsCount] = useState(0);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getNews().then((items) => {
      if (isMounted) {
        setRecentNews(items.slice(0, 3));
        setNewsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const target = 142;
    const timer = setInterval(() => {
      setBenefitsCount((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }
        return Math.min(prev + 4, target);
      });
    }, 22);

    return () => clearInterval(timer);
  }, []);

  const insights = [
    `${profile.region || 'Hududingiz'} bo‘yicha faol yangiliklar soni: ${recentNews.length || 3}.`,
    `AI chat orqali hujjatlarni izohlash tezligi: odatda 5-15 soniya.`,
    `Avto ariza monitoring doimiy ishlayapti, mos arizalar chiqqanda darhol ko‘rasiz.`,
  ];

  const weeklySignals = [38, 52, 47, 64, 58, 71, 66];
  const chartMax = Math.max(...weeklySignals);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 glass-panel ai-panel scanline rounded-2xl p-5">
        <div>
          <h1 className="text-3xl ai-title mb-1">{t('dashboard.welcome')}, {profile.name || profile.firstName || 'Foydalanuvchi'}!</h1>
          <p className="text-slate-400">{t('dashboard.happening')} <span className="text-ion-400">{profile.region}</span> {t('dashboard.region')}.</p>
        </div>
        <div className="flex gap-2">
           <span className="ai-chip"><span className="ai-dot" />{t('dashboard.system.operational')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/app/benefits">
            <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-ion-500">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{t('dashboard.active.benefits')}</p>
                <h3 className="text-3xl font-bold text-white tabular-nums">{benefitsCount}</h3>
                </div>
                <div className="p-2 bg-ion-500/10 rounded-lg text-ion-400">
                <Zap size={24} />
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">{t('dashboard.available.region')}</div>
            </Card>
        </Link>

        <Link to="/app/auto-application">
            <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Avto ariza monitoring</p>
                <h3 className="text-3xl font-bold text-white flex items-center gap-2">24/7 <span className="ai-dot" /></h3>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <FilePenLine size={24} />
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Yangi arizalarni avtomatik tekshiradi</div>
            </Card>
        </Link>

        <Link to="/app/chat">
            <Card className="h-full bg-gradient-to-br from-ion-900/40 to-slate-900 border border-ion-500/30 shadow-[0_0_20px_rgba(14,165,233,0.1)] group scanline">
            <div className="flex flex-col h-full justify-center items-center text-center">
                <div className="p-3 bg-ion-500 rounded-full text-white mb-3 shadow-[0_0_15px_#0ea5e9] group-hover:scale-110 transition-transform">
                <MessageSquareText size={24} />
                </div>
                <h3 className="font-bold text-white">{t('dashboard.ask.ai')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('dashboard.legal.help')}</p>
            </div>
            </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl ai-title">AI siz uchun bugun</h2>
            <span className="ai-chip"><span className="ai-dot" /> Live insight</span>
          </div>
          <div className="space-y-2">
            {insights.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">7 kunlik AI signal trendi</h3>
          <div className="h-36">
            <div className="flex h-full items-end gap-2">
              {weeklySignals.map((value, idx) => (
                <div key={`${value}-${idx}`} className="flex-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-cyan-500/80 to-emerald-400/70 shadow-[0_0_12px_rgba(45,212,191,0.35)] transition-all duration-500"
                    style={{ height: `${(value / chartMax) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">AI faoliyati: trend yuqori bo‘lsa tavsiya oqimi ko‘proq.</p>
        </Card>

        {/* Latest News */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{t('dashboard.latest.news')}</h2>
            <Link to="/app/news" className="text-sm text-ion-400 hover:text-ion-300 flex items-center">{t('dashboard.view.all')} <ChevronRight size={16}/></Link>
          </div>
          <div className="space-y-4">
            {newsLoading && (
              <>
                <div className="skeleton-card h-28 rounded-2xl" />
                <div className="skeleton-card h-28 rounded-2xl" />
              </>
            )}
            {!newsLoading && recentNews.map(news => (
              <Card key={news.id} className="flex flex-col md:flex-row gap-4 hover:scale-[1.01] transition-transform">
                 <div className="flex-1">
                   <div className="flex gap-2 mb-2">
                     <span className="text-xs font-bold text-ion-400 bg-ion-500/10 px-2 py-0.5 rounded">{news.sourceName}</span>
                     {news.docRefs.map(ref => <span key={ref} className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">{ref}</span>)}
                   </div>
                   <h3 className="font-bold text-white mb-1">{news.title}</h3>
                   <p className="text-sm text-slate-400 line-clamp-2">{news.summary}</p>
                 </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
