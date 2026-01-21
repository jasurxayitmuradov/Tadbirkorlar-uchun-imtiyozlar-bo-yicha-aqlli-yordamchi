import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { getCourses, getLearningPaths, filterCourses, toggleFavorite, getFavorites, CourseFilters } from '../services/coursesService';
import { Course, LearningPath } from '../types';
import { BookOpen, ExternalLink, Bookmark, CheckCircle, PlayCircle } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'paths'>('browse');
  
  // Filter States
  const [filters, setFilters] = useState<CourseFilters>({});

  useEffect(() => {
    setPaths(getLearningPaths());
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    const allCourses = getCourses();
    setCourses(filterCourses(allCourses, filters, favorites));
  }, [filters, favorites]);

  const handleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(toggleFavorite(id));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Courses for Entrepreneurs</h1>
          <p className="text-slate-400">Verified educational content to grow your business</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-ion-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Browse Courses
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'paths' ? 'bg-ion-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Learning Paths
          </button>
        </div>
      </header>

      {activeTab === 'browse' && (
        <>
          {/* Filters */}
          <div className="glass-panel p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-ion-500 outline-none"
                onChange={e => setFilters({...filters, query: e.target.value})}
              />
            </div>
            <select 
              className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
              onChange={e => setFilters({...filters, topic: e.target.value || undefined})}
            >
              <option value="">All Topics</option>
              <option value="tax">Tax</option>
              <option value="marketing">Marketing</option>
              <option value="legal basics">Legal Basics</option>
              <option value="export/import">Export/Import</option>
              <option value="grant writing">Grant Writing</option>
            </select>
            <select 
              className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
              onChange={e => setFilters({...filters, level: e.target.value || undefined})}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select 
              className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
              onChange={e => setFilters({...filters, language: e.target.value || undefined})}
            >
              <option value="">All Languages</option>
              <option value="uz">Uzbek</option>
              <option value="ru">Russian</option>
              <option value="en">English</option>
            </select>
            <button 
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${filters.onlyFavorites ? 'bg-ion-500/20 border-ion-500 text-ion-400' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
              onClick={() => setFilters({...filters, onlyFavorites: !filters.onlyFavorites})}
            >
              <Bookmark size={14} /> Favorites
            </button>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Card key={course.id} className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                    course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {course.level}
                  </span>
                  <button onClick={(e) => handleFavorite(course.id, e)} className="text-slate-400 hover:text-ion-400 transition-colors">
                    <Bookmark size={20} fill={favorites.includes(course.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-3">{course.summary}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {course.topics.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-white/5">{t}</span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4 text-xs text-slate-500">
                     <span className="flex items-center gap-1"><CheckCircle size={12} className="text-ion-400"/> {course.sourceName}</span>
                     <span className="uppercase">{course.language} • {course.format}</span>
                  </div>
                  <a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    Open Course <ExternalLink size={14} />
                  </a>
                </div>
              </Card>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No courses found matching your filters.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {paths.map(path => (
            <div key={path.id} className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen size={120} />
              </div>
              <div className="relative z-10">
                <span className="text-ion-400 text-sm font-bold tracking-wider uppercase mb-2 block">{path.level} Path</span>
                <h2 className="text-2xl font-bold text-white mb-3">{path.title}</h2>
                <p className="text-slate-400 mb-6">{path.description}</p>
                
                <div className="space-y-4 mb-8">
                  {path.courseIds.map((cid, idx) => {
                    const course = getCourses().find(c => c.id === cid);
                    return (
                      <div key={cid} className="flex items-center gap-4 p-3 rounded-lg bg-slate-900/50 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{course?.title || 'Unknown Course'}</p>
                          <p className="text-slate-500 text-xs">{course?.durationHours ? `${course.durationHours}h • ` : ''} {course?.provider}</p>
                        </div>
                        <PlayCircle size={18} className="text-slate-500" />
                      </div>
                    );
                  })}
                </div>

                <button className="w-full bg-ion-600 hover:bg-ion-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-ion-500/20 transition-all">
                  Start Learning Path
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
