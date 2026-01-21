import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewsItem, UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { getNews } from '../services/newsService';
import { getCourses } from '../services/coursesService';
import { MessageSquareText, Zap, ChevronRight, GraduationCap } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const profile: UserProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const recommendedCourses = getCourses().slice(0, 3); // Mock recommendation

  useEffect(() => {
    let isMounted = true;
    getNews().then((items) => {
      if (isMounted) setRecentNews(items.slice(0, 3));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('dashboard.welcome')}, {profile.name || profile.firstName || 'Foydalanuvchi'}!</h1>
          <p className="text-slate-400">{t('dashboard.happening')} <span className="text-ion-400">{profile.region}</span> {t('dashboard.region')}.</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">{t('dashboard.system.operational')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/app/benefits">
            <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-ion-500">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{t('dashboard.active.benefits')}</p>
                <h3 className="text-3xl font-bold text-white">142</h3>
                </div>
                <div className="p-2 bg-ion-500/10 rounded-lg text-ion-400">
                <Zap size={24} />
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">{t('dashboard.available.region')}</div>
            </Card>
        </Link>

        <Link to="/app/courses">
            <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-900 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{t('dashboard.new.courses')}</p>
                <h3 className="text-3xl font-bold text-white">12</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <GraduationCap size={24} />
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">{t('dashboard.added.month')}</div>
            </Card>
        </Link>

        <Link to="/app/chat">
            <Card className="h-full bg-gradient-to-br from-ion-900/40 to-slate-900 border border-ion-500/30 shadow-[0_0_20px_rgba(14,165,233,0.1)] group">
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
        {/* Latest News */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{t('dashboard.latest.news')}</h2>
            <Link to="/app/news" className="text-sm text-ion-400 hover:text-ion-300 flex items-center">{t('dashboard.view.all')} <ChevronRight size={16}/></Link>
          </div>
          <div className="space-y-4">
            {recentNews.map(news => (
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

        {/* Recommended Courses */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{t('dashboard.recommended')}</h2>
            <Link to="/app/courses" className="text-sm text-purple-400 hover:text-purple-300 flex items-center">{t('dashboard.browse')} <ChevronRight size={16}/></Link>
          </div>
          <div className="space-y-4">
            {recommendedCourses.map(course => (
              <Card key={course.id} className="p-4 border-l-2 border-l-purple-500">
                <h4 className="font-bold text-white text-sm line-clamp-1">{course.title}</h4>
                <p className="text-xs text-slate-400 mt-1 mb-2">{course.provider}</p>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{course.level}</span>
                    <span className="text-[10px] uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{course.format}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
