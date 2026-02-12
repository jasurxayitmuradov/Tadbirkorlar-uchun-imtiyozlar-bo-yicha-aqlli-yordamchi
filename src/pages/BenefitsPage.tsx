import React, { useState, useEffect } from 'react';
import { getBenefits } from '../services/benefitsService';
import { sendMessageToAI } from '../services/aiService';
import { BenefitRoadmap, ContextPayload, UserProfile } from '../types';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AlertTriangle, ListChecks, FileText, Route, Sparkles } from 'lucide-react';

export const BenefitsPage: React.FC = () => {
  const [roadmap, setRoadmap] = useState<BenefitRoadmap | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<BenefitRoadmap | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  useEffect(() => {
    setRoadmap(getBenefits());
  }, []);

  const buildRoadmapContext = (data: BenefitRoadmap): ContextPayload => {
    const steps = data.process_steps
      .map(step => `${step.id}. ${step.title} — ${step.description}`)
      .join('\n');
    const snippet = [
      data.benefit_title,
      data.benefit_summary,
      `Auditoriya: ${data.target_audience.join(', ')}`,
      `Bosqichlar:\n${steps}`,
    ].join('\n');

    return {
      items: [
        {
          id: data.benefit_id,
          doc_title: data.benefit_title,
          doc_type: 'Boshqa',
          source: 'other',
          url: 'DEMO',
          status_hint: 'unknown',
          published_date: '',
          effective_date: '',
          last_updated: '',
          article_or_clause: "Band/Bo'lim topilmadi",
          snippet_text: snippet,
          snippet_language: 'uz',
          confidence: 0.4,
        },
      ],
    };
  };

  const handleStartChat = (data: BenefitRoadmap) => {
    const context = buildRoadmapContext(data);
    localStorage.setItem('legal_context', JSON.stringify(context));
    localStorage.setItem(
      'chat_prefill',
      `${data.benefit_title} bo'yicha yo'l xaritani amaliy tilda tushuntirib bering.`
    );
    window.location.hash = '#/app/chat';
  };

  const handleAiAdvice = async (data: BenefitRoadmap) => {
    const profile: UserProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const context = buildRoadmapContext(data);
    setAiLoading(true);
    setAiError('');
    const response = await sendMessageToAI(
      "Roadmap bo'yicha qisqa tavsiya, xatoliklardan saqlanish va keyingi qadamlar ro'yxatini bering.",
      profile,
      [],
      context
    );
    setAiAdvice(response);
    setAiLoading(false);
  };

  const renderGraph = (data: BenefitRoadmap) => {
    const nodeWidth = 240;
    const nodeHeight = 56;
    const verticalGap = 28;
    const leftPadding = 24;
    const topPadding = 24;
    const height =
      topPadding * 2 + data.process_steps.length * (nodeHeight + verticalGap) - verticalGap;

    const nodes = data.process_steps.map((step, index) => {
      const y = topPadding + index * (nodeHeight + verticalGap);
      return {
        id: step.id,
        title: step.title,
        owner: step.owner,
        x: leftPadding,
        y,
        cx: leftPadding + nodeWidth / 2,
        cy: y + nodeHeight / 2,
      };
    });

    const nodeById = new Map(nodes.map(node => [node.id, node]));

    return (
      <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4 overflow-x-auto">
        <svg
          width={nodeWidth + leftPadding * 2}
          height={height}
          viewBox={`0 0 ${nodeWidth + leftPadding * 2} ${height}`}
        >
          {data.edges.map(edge => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const startX = from.cx;
            const startY = from.y + nodeHeight;
            const endX = to.cx;
            const endY = to.y;
            const midY = (startY + endY) / 2;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={`M ${startX} ${startY} C ${startX} ${midY} ${endX} ${midY} ${endX} ${endY}`}
                  stroke="rgba(148, 163, 184, 0.7)"
                  strokeWidth="2"
                  fill="none"
                />
                {edge.label && (
                  <text
                    x={startX + 8}
                    y={midY - 6}
                    fill="rgba(148, 163, 184, 0.9)"
                    fontSize="10"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map(node => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={nodeWidth}
                height={nodeHeight}
                rx="12"
                fill="rgba(15, 23, 42, 0.9)"
                stroke="rgba(56, 189, 248, 0.5)"
                strokeWidth="1.2"
              />
              <text
                x={node.x + 12}
                y={node.y + 22}
                fill="rgba(226, 232, 240, 0.95)"
                fontSize="12"
                fontWeight="600"
              >
                {node.id}. {node.title}
              </text>
              <text
                x={node.x + 12}
                y={node.y + 40}
                fill="rgba(148, 163, 184, 0.9)"
                fontSize="10"
              >
                {node.owner}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header className="glass-panel ai-panel scanline rounded-2xl p-5">
        <h1 className="text-3xl ai-title mb-2">Imtiyozlar yo‘l xaritasi (demo)</h1>
        <p className="text-slate-400">Hackaton MVP uchun demo “roadmap” — amaliy jarayon namoyishi.</p>
      </header>

      {roadmap?.status_warning && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-200 px-4 py-3 rounded-xl">
          <AlertTriangle size={18} />
          <span className="text-sm">Demo ma’lumot. Aniq hujjatga bog‘lanmagan.</span>
        </div>
      )}

      {roadmap && (
        <Card
          onClick={() => setSelectedRoadmap(roadmap)}
          className="group hover:border-l-4 hover:border-l-ion-500 transition-all"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-ion-400 uppercase tracking-wider">Roadmap</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{roadmap.status}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-ion-300 transition-colors">
                {roadmap.benefit_title}
              </h3>
              <p className="text-slate-300 text-sm line-clamp-2">{roadmap.benefit_summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roadmap.target_audience.map(tag => (
                  <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 min-w-[140px]">
              <span className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <ListChecks size={12} /> {roadmap.process_steps.length} bosqich
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Route size={12} /> demo ko‘rinish
              </span>
            </div>
          </div>
        </Card>
      )}

      {roadmap && (
        <div className="glass-panel ai-panel rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-slate-300">
                Roadmap bo‘yicha AI maslahat va tavsiyalarni oling.
              </p>
              <p className="text-xs text-slate-500">
                Demo ma’lumot, aniq hujjatga bog‘lanmagan.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAiAdvice(roadmap)}
                disabled={aiLoading}
                className="ai-button text-xs disabled:opacity-60"
              >
                <Sparkles size={14} /> {aiLoading ? 'AI tahlil qilmoqda...' : 'AI tavsiya'}
              </button>
              <button
                onClick={() => handleStartChat(roadmap)}
                className="ai-button-ghost text-xs"
              >
                <Sparkles size={14} /> AI bilan suhbat
              </button>
            </div>
          </div>

          {aiError && <p className="text-xs text-red-400 mt-3">{aiError}</p>}
          {aiAdvice && (
            <div className="mt-4 bg-slate-950/70 border border-white/10 rounded-lg p-3 text-sm text-slate-200 whitespace-pre-wrap">
              {aiAdvice}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRoadmap}
        onClose={() => setSelectedRoadmap(null)}
        title={selectedRoadmap?.benefit_title || ''}
      >
        {selectedRoadmap && (
          <div className="space-y-6">
            <div className="p-4 bg-ion-500/10 border border-ion-500/20 rounded-xl">
              <h4 className="text-sm font-bold text-ion-400 uppercase mb-2">Roadmap qisqacha</h4>
              <p className="text-white text-lg font-medium">{selectedRoadmap.benefit_summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Kimlar uchun</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRoadmap.target_audience.map(tag => (
                  <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">#{tag}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Bosqichlar</h4>
              {renderGraph(selectedRoadmap)}
              <div className="space-y-3">
                {selectedRoadmap.process_steps.map(step => (
                  <div key={step.id} className="bg-slate-900/70 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{step.id}</span>
                      <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {step.owner}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium mt-2">{step.title}</p>
                    <p className="text-slate-400 text-sm mt-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Zarur hujjatlar</h4>
                <div className="space-y-2">
                  {selectedRoadmap.required_documents.map(doc => (
                    <div key={doc.doc} className="flex items-center gap-2 text-slate-300 text-sm">
                      <FileText size={14} className="text-ion-400" />
                      <span>{doc.doc}</span>
                      <span className="text-xs text-slate-500">({doc.required ? 'majburiy' : 'ixtiyoriy'})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Qayerga topshiriladi</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  {selectedRoadmap.where_to_apply.map(item => (
                    <div key={item.channel} className="bg-slate-900/70 border border-white/10 rounded-lg p-3">
                      <p className="text-slate-200 font-medium">{item.channel}</p>
                      <p className="text-slate-400 text-sm mt-1">{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Muddat va to‘lovlar</h4>
              <div className="space-y-2 text-sm text-slate-300">
                {selectedRoadmap.fees_and_deadlines.map(item => (
                  <div key={item.item} className="flex items-center gap-2">
                    <span className="text-slate-500">{item.item}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
