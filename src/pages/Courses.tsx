import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesMock, type Course } from '../data/coursesMock';
import { CourseCard } from '../components/CourseCard';
import { getCourseProgress, setLastOpenedCourse } from '../lib/coursesProgress';

const difficultyOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'beginner', label: "Boshlang‘ich" },
  { value: 'intermediate', label: "O‘rta" },
  { value: 'advanced', label: "Yuqori" },
];

export const Courses = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [onlyReal, setOnlyReal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const filtered: Course[] = useMemo(() => {
    return coursesMock.filter((course: Course) => {
      if (onlyReal && course.isDemo) return false;
      if (difficulty !== 'all' && course.difficulty !== difficulty) return false;
      if (query) {
        const q = query.toLowerCase();
        const inTitle = course.title.toLowerCase().includes(q);
        const inDesc = course.description.toLowerCase().includes(q);
        return inTitle || inDesc;
      }
      return true;
    });
  }, [query, difficulty, onlyReal]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Kurslar</h1>
        <p className="text-slate-400">Tadbirkorlik bo‘yicha qisqa va amaliy darslar.</p>
      </header>

      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row gap-4">
        <input
          type="text"
          placeholder="Kurs nomi yoki tavsif bo‘yicha qidirish..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="flex-1 bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ion-500"
        />
        <select
          value={difficulty}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficulty(e.target.value)}
          className="bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-white"
        >
          {difficultyOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={onlyReal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOnlyReal(e.target.checked)}
            className="accent-ion-500"
          />
          Faqat real kontent
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="h-60 bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const progress = getCourseProgress(course);
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress}
                onOpen={() => {
                  setLastOpenedCourse(course.id);
                  navigate(`/app/courses/${course.id}`);
                }}
              />
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-slate-500 py-10">
          Hech qanday kurs topilmadi. Filtrlarni o‘zgartiring.
        </div>
      )}
    </div>
  );
};
