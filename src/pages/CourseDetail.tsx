import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursesMock, type Course } from '../data/coursesMock';
import { LessonListItem } from '../components/LessonListItem';
import { ProgressBar } from '../components/ProgressBar';
import {
  getCourseProgress,
  getLessonStatus,
  getLastLesson,
  setLastOpenedCourse,
  setLastLesson,
} from '../lib/coursesProgress';

export const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const course: Course | undefined = useMemo(
    () => coursesMock.find((item: Course) => item.id === courseId),
    [courseId]
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  if (!course) {
    return <div className="text-slate-400">Kurs topilmadi.</div>;
  }

  const progress = getCourseProgress(course);
  const lastLessonId = getLastLesson(course.id) || course.lessons[0]?.id;
  const nextLesson =
    course.lessons.find((lesson) => getLessonStatus(course.id, lesson.id) !== 'completed') ||
    course.lessons[0];

  const goToLesson = (lessonId: string) => {
    setLastOpenedCourse(course.id);
    setLastLesson(course.id, lessonId);
    navigate(`/app/courses/${course.id}/lessons/${lessonId}`);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="text-sm text-slate-500">
        Kurslar &gt; <span className="text-slate-200">{course.title}</span>
      </div>

      {loading ? (
        <div className="h-24 bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse" />
      ) : (
        <header className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-slate-400">{course.description}</p>
        </header>
      )}

      {loading ? (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="h-72 bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse" />
          <div className="h-72 bg-slate-900/60 border border-white/5 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Darslar</h2>
            {course.lessons.map((lesson) => (
              <LessonListItem
                key={lesson.id}
                lesson={lesson}
                status={getLessonStatus(course.id, lesson.id)}
                onOpen={() => goToLesson(lesson.id)}
              />
            ))}
          </div>

          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-sm text-slate-400">Kurs progressi</p>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{progress.completed}/{progress.total} dars</span>
                <span>{progress.percent}%</span>
              </div>
              <ProgressBar value={progress.percent} />
            </div>
            <button
              onClick={() => goToLesson(nextLesson.id)}
              className="w-full bg-ion-600 hover:bg-ion-500 text-white py-2 rounded-lg"
            >
              Keyingi dars
            </button>
            <button
              onClick={() => goToLesson(lastLessonId)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg"
            >
              Davom ettirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
