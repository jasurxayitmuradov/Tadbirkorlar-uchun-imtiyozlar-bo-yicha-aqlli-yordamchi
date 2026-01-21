import React, { useState, useEffect } from 'react';
import { getBenefits, filterBenefits } from '../services/benefitsService';
import { BenefitItem, UserProfile } from '../types';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Search, MapPin, FileText } from 'lucide-react';

export const BenefitsPage: React.FC = () => {
  const profile: UserProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState(profile.region || 'Toshkent shahri');
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitItem | null>(null);

  useEffect(() => {
    const allBenefits = getBenefits();
    setBenefits(filterBenefits(allBenefits, region, query));
  }, [region, query]);

  const regions = [
    "Barcha hududlar", "Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", 
    "Farg'ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", 
    "Qashqadaryo", "Qoraqalpog'iston", "Samarqand", "Sirdaryo", "Surxondaryo"
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Benefits Catalog</h1>
        <p className="text-slate-400">Subsidies, tax breaks, and grants available in your region.</p>
      </header>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search benefits (e.g., IT, tax, export)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-ion-500 outline-none"
          />
        </div>
        <div className="relative md:w-64">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-ion-500 outline-none appearance-none"
          >
            {regions.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {benefits.map(item => (
          <Card 
            key={item.id} 
            onClick={() => setSelectedBenefit(item)}
            className="group hover:border-l-4 hover:border-l-ion-500 transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xs font-bold text-ion-400 uppercase tracking-wider">{item.soha}</span>
                   <span className="text-slate-600">•</span>
                   <span className="text-xs text-slate-400">{item.faoliyat}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-ion-300 transition-colors">{item.title}</h3>
                <p className="text-slate-300 text-sm line-clamp-2">{item.benefit}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-2 min-w-[120px]">
                <span className="flex items-center gap-1 text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                  <FileText size={12} /> {item.legal_basis}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                   <MapPin size={12} /> {item.hudud === "Barcha hududlar" ? "All Regions" : item.hudud}
                </span>
              </div>
            </div>
          </Card>
        ))}
        {benefits.length === 0 && (
          <div className="py-12 text-center">
            <div className="bg-slate-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Search size={32} />
            </div>
            <p className="text-slate-400">No benefits found for this region/query.</p>
            <p className="text-sm text-slate-600 mt-2">Try selecting "Barcha hududlar" or changing your search.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedBenefit}
        onClose={() => setSelectedBenefit(null)}
        title={selectedBenefit?.title || ''}
      >
        {selectedBenefit && (
          <div className="space-y-6">
            <div className="p-4 bg-ion-500/10 border border-ion-500/20 rounded-xl">
              <h4 className="text-sm font-bold text-ion-400 uppercase mb-2">The Benefit</h4>
              <p className="text-white text-lg font-medium">{selectedBenefit.benefit}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Eligibility</h4>
                <p className="text-slate-200">{selectedBenefit.eligibility}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Legal Basis</h4>
                <p className="text-yellow-400 font-mono flex items-center gap-2">
                  <FileText size={16} /> {selectedBenefit.legal_basis}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">How to Apply</h4>
              <p className="text-slate-200 bg-slate-900 p-4 rounded-lg border border-white/5">
                {selectedBenefit.how_to_apply}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
