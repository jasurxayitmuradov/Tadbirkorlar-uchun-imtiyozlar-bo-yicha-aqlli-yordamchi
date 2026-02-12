import React from 'react';
import newsSources from '../data/sources.json';
import { Card } from '../components/Card';
import { ShieldCheck, Database, ExternalLink, RefreshCw } from 'lucide-react';

export const SourcesPage: React.FC = () => {
  const lastSync = new Date().toLocaleString();

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Whitelisted Sources</h1>
          <p className="text-slate-400 max-w-2xl">
            To ensure accuracy and legal safety, Benefit Navigator strictly aggregates data from these official government and verified organization sources.
          </p>
        </div>
        <div className="text-right">
           <p className="text-xs text-slate-500 flex items-center justify-end gap-2">
             <RefreshCw size={12} /> Last Sync: {lastSync}
           </p>
        </div>
      </header>

      {/* News Sources Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-ion-400" /> 
          Legal & News Databases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsSources.map(source => (
            <Card key={source.id} className="border-l-4 border-l-ion-500 flex flex-col justify-between h-full">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{source.name}</h3>
                  {source.enabled && (
                    <span className="bg-green-500/10 text-green-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-green-500/20">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono truncate">{source.url}</p>
              </div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Visit Source <ExternalLink size={14} />
              </a>
            </Card>
          ))}
        </div>
      </section>

      <div className="p-6 bg-slate-900 rounded-xl border border-white/5 text-center">
         <p className="text-slate-400 text-sm">
           Want to suggest a source? <a href="#" className="text-ion-400 hover:underline">Contact Support</a>
         </p>
      </div>
    </div>
  );
};
