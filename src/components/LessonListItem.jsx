import React from 'react';

const statusMap = {
  not_started: { label: 'Ko‘rilmagan', color: 'text-slate-500' },
  in_progress: { label: 'Ko‘rilmoqda', color: 'text-amber-300' },
  completed: { label: 'Tugatildi', color: 'text-emerald-300' },
};

export const LessonListItem = ({ lesson, status, onOpen }) => {
  const statusInfo = statusMap[status] || statusMap.not_started;
  return (
    <div className="flex items-center justify-between gap-4 bg-slate-900/60 border border-white/10 rounded-xl p-3">
      <div className="flex items-start gap-3">
        <div className={`text-xs font-semibold ${statusInfo.color}`}>{statusInfo.label}</div>
        <div>
          <p className="text-white font-medium">{lesson.title}</p>
          <p className="text-sm text-slate-400">{lesson.summary}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{lesson.durationMin} daqiqa</span>
            {lesson.isDemo && (
              <span className="bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/30">
                Demo
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onOpen}
        className="text-xs bg-ion-600/20 hover:bg-ion-600/30 text-ion-200 px-3 py-2 rounded-lg border border-ion-500/30"
      >
        {status === 'completed' ? 'Qayta ko‘rish' : status === 'in_progress' ? 'Davom ettirish' : 'Boshlash'}
      </button>
    </div>
  );
};
