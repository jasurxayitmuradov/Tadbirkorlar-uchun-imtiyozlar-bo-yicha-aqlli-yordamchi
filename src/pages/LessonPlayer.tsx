import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesMock, type Course, type Lesson, type LessonQuiz } from '../data/coursesMock';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  getLessonStatus,
  setLessonStatus,
  setLastLesson,
  setLastOpenedCourse,
  getQuizAnswer,
  setQuizAnswer,
  addDailyUsageSeconds,
} from '../lib/coursesProgress';

const tabs = [
  { key: 'notes', label: 'Konspekt' },
  { key: 'materials', label: 'Materiallar' },
  { key: 'faq', label: 'Savol-javob' },
  { key: 'quiz', label: 'Interaktiv' },
];

export const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const course: Course | undefined = useMemo(
    () => coursesMock.find((item: Course) => item.id === courseId),
    [courseId]
  );
  const lessonIndex = course?.lessons.findIndex((item: Lesson) => item.id === lessonId) ?? -1;
  const lesson: Lesson | null = lessonIndex >= 0 && course ? course.lessons[lessonIndex] : null;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (course && lesson) {
      setLastOpenedCourse(course.id);
      setLastLesson(course.id, lesson.id);
      if (getLessonStatus(course.id, lesson.id) === 'not_started') {
        setLessonStatus(course.id, lesson.id, 'in_progress');
      }
    }
  }, [course, lesson]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 5);
      addDailyUsageSeconds(5);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  if (!course || !lesson) {
    return <div className="text-slate-400">Dars topilmadi.</div>;
  }

  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="text-sm text-slate-500">
        Kurslar &gt; {course.title} &gt; <span className="text-slate-200">{lesson.title}</span>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="h-72 bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse" />
          <div className="h-72 bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-4">
          <VideoPlayer lesson={lesson} />
          <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <div className="flex gap-2 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 text-xs rounded-lg border ${
                      activeTab === tab.key
                        ? 'bg-ion-600/30 border-ion-500/40 text-ion-200'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'notes' && (
                <ul className="list-disc pl-5 text-sm text-slate-300 space-y-2">
                  {lesson.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-3 text-sm text-slate-300">
                  {lesson.materials.map((mat) => (
                    <div key={mat.label} className="flex items-center justify-between bg-slate-950/70 border border-white/10 rounded-lg p-3">
                      <span>{mat.label}</span>
                      <span className="text-xs text-slate-500">{mat.isDemo ? 'Demo' : 'Link'}</span>
                    </div>
                  ))}
                </div>
              )}

            {activeTab === 'faq' && (
              <div className="space-y-3 text-sm text-slate-300">
                {lesson.faq.map((item) => (
                  <div key={item.q} className="bg-slate-950/70 border border-white/10 rounded-lg p-3">
                    <p className="font-medium text-slate-200">{item.q}</p>
                    <p className="text-slate-400 mt-1">{item.a}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {(lesson.quiz || []).map((qItem: LessonQuiz, qIndex: number) => {
                  const selected = getQuizAnswer(course.id, lesson.id, qIndex);
                  const isCorrect = selected === qItem.correctIndex;
                  return (
                    <div key={`${qItem.q}-${qIndex}`} className="bg-slate-950/70 border border-white/10 rounded-lg p-3">
                      <p className="text-sm text-slate-200 font-medium mb-3">{qItem.q}</p>
                      <div className="space-y-2">
                        {qItem.options.map((opt, optIndex) => {
                          const active = selected === optIndex;
                          return (
                            <button
                              key={`${opt}-${optIndex}`}
                              onClick={() => setQuizAnswer(course.id, lesson.id, qIndex, optIndex)}
                              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                                active
                                  ? 'bg-ion-600/20 border-ion-500/40 text-ion-100'
                                  : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {selected !== null && (
                        <p className={`text-xs mt-2 ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {isCorrect ? "To‘g‘ri!" : "Noto‘g‘ri."} {qItem.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
                {(!lesson.quiz || lesson.quiz.length === 0) && (
                  <p className="text-sm text-slate-400">Hozircha interaktiv savollar yo‘q.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{lesson.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{lesson.summary}</p>
            <p className="text-xs text-slate-500 mt-2">
              Bugun ushbu darsda: {Math.floor(sessionSeconds / 60)} daqiqa
            </p>
          </div>
            <button
              onClick={() => setLessonStatus(course.id, lesson.id, 'completed')}
              className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 py-2 rounded-lg border border-emerald-400/30"
            >
              Tugatildi deb belgilash
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => prevLesson && navigate(`/app/courses/${course.id}/lessons/${prevLesson.id}`)}
                disabled={!prevLesson}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg disabled:opacity-50"
              >
                Oldingi dars
              </button>
              <button
                onClick={() => nextLesson && navigate(`/app/courses/${course.id}/lessons/${nextLesson.id}`)}
                disabled={!nextLesson}
                className="flex-1 bg-ion-600 hover:bg-ion-500 text-white py-2 rounded-lg disabled:opacity-50"
              >
                Keyingi dars
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
