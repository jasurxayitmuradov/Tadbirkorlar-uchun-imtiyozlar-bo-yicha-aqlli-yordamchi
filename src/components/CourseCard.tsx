import React from 'react';
import type { Course } from '../data/coursesMock';
import { ProgressBar } from './ProgressBar';

const difficultyMap = {
  beginner: "Boshlang‘ich",
  intermediate: "O‘rta",
  advanced: "Yuqori",
};

type CourseCardProps = {
  course: Course;
  progress: { total: number; completed: number; percent: number };
  onOpen: () => void;
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, progress, onOpen }) => {
  const coverClass =
    course.coverType === 'gradient'
      ? 'bg-gradient-to-br from-ion-600/60 via-slate-900 to-emerald-500/30'
      : 'bg-slate-800';

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-lg overflow-hidden flex flex-col">
      <div className={`h-32 ${coverClass} relative`}>
        {course.isDemo && (
          <span className="absolute top-3 left-3 text-[10px] uppercase bg-amber-500/20 text-amber-200 px-2 py-1 rounded-full border border-amber-500/30">
            Demo
          </span>
        )}
        {course.isPremium && (
          <span className="absolute top-3 right-3 text-[10px] uppercase bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded-full border border-emerald-500/30">
            Premium
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300">
            {difficultyMap[course.difficulty]}
          </span>
          <span>{course.totalDurationMin} daqiqa</span>
        </div>
        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>
        {progress.percent > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{progress.percent}%</span>
            </div>
            <ProgressBar value={progress.percent} />
          </div>
        )}
        <button
          onClick={onOpen}
          className="mt-auto w-full bg-ion-600 hover:bg-ion-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Kursni ochish
        </button>
      </div>
    </div>
  );
};
