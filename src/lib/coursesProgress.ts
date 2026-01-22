const STORAGE_KEY = 'bn_course_progress';
// Auth bo'lsa server-side progress, MVP'da localStorage ishlatiladi.

type ProgressState = {
  lastOpenedCourseId: string | null;
  perCourse: Record<string, { lastLessonId?: string }>;
  perLesson: Record<string, { status: string; updatedAt: number }>;
  bookmarks: Record<string, boolean>;
  quizAnswers: Record<string, { answerIndex: number; updatedAt: number }>;
  dailyUsage: Record<string, number>;
};

const defaultState: ProgressState = {
  lastOpenedCourseId: null,
  perCourse: {},
  perLesson: {},
  bookmarks: {},
  quizAnswers: {},
  dailyUsage: {},
};

const loadState = (): ProgressState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultState };
  try {
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
};

const saveState = (state: ProgressState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getProgressState = () => loadState();

export const setLastOpenedCourse = (courseId: string) => {
  const state = loadState();
  state.lastOpenedCourseId = courseId;
  saveState(state);
};

export const setLastLesson = (courseId: string, lessonId: string) => {
  const state = loadState();
  state.perCourse[courseId] = { ...(state.perCourse[courseId] || {}), lastLessonId: lessonId };
  saveState(state);
};

export const getLastLesson = (courseId: string) => {
  const state = loadState();
  return state.perCourse[courseId]?.lastLessonId || null;
};

export const getLessonStatus = (courseId: string, lessonId: string): 'not_started' | 'in_progress' | 'completed' => {
  const state = loadState();
  const status = state.perLesson[`${courseId}:${lessonId}`]?.status || 'not_started';
  return status as 'not_started' | 'in_progress' | 'completed';
};

export const setLessonStatus = (
  courseId: string,
  lessonId: string,
  status: 'not_started' | 'in_progress' | 'completed'
) => {
  const state = loadState();
  state.perLesson[`${courseId}:${lessonId}`] = {
    status,
    updatedAt: Date.now(),
  };
  saveState(state);
};

export const toggleBookmark = (courseId: string, lessonId: string) => {
  const state = loadState();
  const key = `${courseId}:${lessonId}`;
  state.bookmarks[key] = !state.bookmarks[key];
  saveState(state);
  return state.bookmarks[key];
};

export const isBookmarked = (courseId: string, lessonId: string) => {
  const state = loadState();
  return !!state.bookmarks[`${courseId}:${lessonId}`];
};

export const setQuizAnswer = (
  courseId: string,
  lessonId: string,
  questionIndex: number,
  answerIndex: number
) => {
  const state = loadState();
  const key = `${courseId}:${lessonId}:${questionIndex}`;
  state.quizAnswers[key] = {
    answerIndex,
    updatedAt: Date.now(),
  };
  saveState(state);
};

export const getQuizAnswer = (courseId: string, lessonId: string, questionIndex: number) => {
  const state = loadState();
  return state.quizAnswers[`${courseId}:${lessonId}:${questionIndex}`]?.answerIndex ?? null;
};

const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDailyUsageSeconds = (seconds: number) => {
  const state = loadState();
  const key = getDateKey();
  state.dailyUsage[key] = (state.dailyUsage[key] || 0) + seconds;
  saveState(state);
};

export const getDailyUsageSeconds = (dateKey: string) => {
  const state = loadState();
  return state.dailyUsage[dateKey] || 0;
};

export const getLastDaysUsage = (days: number = 7) => {
  const result = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = getDateKey(date);
    result.push({ date: key, seconds: getDailyUsageSeconds(key) });
  }
  return result;
};

export const getCourseProgress = (course) => {
  const total = course.lessons.length;
  const completed = course.lessons.filter(
    (lesson) => getLessonStatus(course.id, lesson.id) === 'completed'
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
};
