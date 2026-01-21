import React, { useState, useEffect } from 'react';
import { getNews, filterNews } from '../services/newsService';
import { NewsItem } from '../types';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Search, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const allNews = getNews();
    setNews(filterNews(allNews, query, selectedTag));
  }, [query, selectedTag]);

  // Extract unique tags
  const allTags = Array.from(new Set(getNews().flatMap(n => n.tags)));

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Official Updates</h1>
        <p className="text-slate-400 flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-400" />
          Aggregated from whitelisted government sources
        </p>
      </header>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search news & decrees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-ion-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition-all ${
              !selectedTag 
                ? 'bg-ion-600 border-ion-500 text-white' 
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            All Updates
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border transition-all ${
                selectedTag === tag
                  ? 'bg-ion-600 border-ion-500 text-white' 
                  : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map(item => (
          <Card 
            key={item.id} 
            onClick={() => setSelectedNews(item)}
            className="flex flex-col h-full hover:border-ion-500/50"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-ion-400 bg-ion-500/10 px-2 py-1 rounded border border-ion-500/20">
                {item.sourceName}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(item.publishedAt).toLocaleDateString()}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
            <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">{item.summary}</p>
            
            <div className="mt-auto pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {item.docRefs.length > 0 && (
                <div className="w-full flex gap-2 mb-2">
                  {item.docRefs.map(ref => (
                    <span key={ref} className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                      {ref}
                    </span>
                  ))}
                </div>
              )}
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-slate-500">#{tag}</span>
              ))}
            </div>
          </Card>
        ))}
        {news.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500">
            No updates found matching your criteria.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title={selectedNews?.title || ''}
      >
        {selectedNews && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2 text-ion-400 font-medium">
                 <ShieldCheck size={16} /> {selectedNews.sourceName}
              </span>
              <span>|</span>
              <span>{new Date(selectedNews.publishedAt).toLocaleDateString()}</span>
            </div>

            {selectedNews.docRefs.length > 0 && (
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <p className="text-xs text-yellow-500 font-bold uppercase mb-2">Related Legal Documents</p>
                <div className="flex gap-2">
                  {selectedNews.docRefs.map(ref => (
                    <span key={ref} className="font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-white mb-2">Summary</h4>
              <p className="leading-relaxed">{selectedNews.summary}</p>
            </div>

            <div className="flex flex-col gap-2">
               <h4 className="font-medium text-white mb-2">Tags</h4>
               <div className="flex flex-wrap gap-2">
                 {selectedNews.tags.map(tag => (
                   <span key={tag} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm">#{tag}</span>
                 ))}
               </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <a 
                href={selectedNews.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-ion-600 hover:bg-ion-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Read Original Source <ExternalLink size={18} />
              </a>
              <p className="text-center text-xs text-slate-500 mt-2">
                You will be redirected to {selectedNews.sourceName}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
