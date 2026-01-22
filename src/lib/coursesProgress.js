const STORAGE_KEY = 'bn_course_progress';
// Auth bo'lsa server-side progress, MVP'da localStorage ishlatiladi.

const defaultState = {
  lastOpenedCourseId: null,
  perCourse: {},
  perLesson: {},
  bookmarks: {},
  quizAnswers: {},
  dailyUsage: {},
};

const loadState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultState };
  try {
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
};

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getProgressState = () => loadState();

export const setLastOpenedCourse = (courseId) => {
  const state = loadState();
  state.lastOpenedCourseId = courseId;
  saveState(state);
};

export const setLastLesson = (courseId, lessonId) => {
  const state = loadState();
  state.perCourse[courseId] = { ...(state.perCourse[courseId] || {}), lastLessonId: lessonId };
  saveState(state);
};

export const getLastLesson = (courseId) => {
  const state = loadState();
  return state.perCourse[courseId]?.lastLessonId || null;
};

export const getLessonStatus = (courseId, lessonId) => {
  const state = loadState();
  return state.perLesson[`${courseId}:${lessonId}`]?.status || 'not_started';
};

export const setLessonStatus = (courseId, lessonId, status) => {
  const state = loadState();
  state.perLesson[`${courseId}:${lessonId}`] = {
    status,
    updatedAt: Date.now(),
  };
  saveState(state);
};

export const toggleBookmark = (courseId, lessonId) => {
  const state = loadState();
  const key = `${courseId}:${lessonId}`;
  state.bookmarks[key] = !state.bookmarks[key];
  saveState(state);
  return state.bookmarks[key];
};

export const isBookmarked = (courseId, lessonId) => {
  const state = loadState();
  return !!state.bookmarks[`${courseId}:${lessonId}`];
};

export const setQuizAnswer = (courseId, lessonId, questionIndex, answerIndex) => {
  const state = loadState();
  const key = `${courseId}:${lessonId}:${questionIndex}`;
  state.quizAnswers[key] = {
    answerIndex,
    updatedAt: Date.now(),
  };
  saveState(state);
};

export const getQuizAnswer = (courseId, lessonId, questionIndex) => {
  const state = loadState();
  return state.quizAnswers[`${courseId}:${lessonId}:${questionIndex}`]?.answerIndex ?? null;
};

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDailyUsageSeconds = (seconds) => {
  const state = loadState();
  const key = getDateKey();
  state.dailyUsage[key] = (state.dailyUsage[key] || 0) + seconds;
  saveState(state);
};

export const getDailyUsageSeconds = (dateKey) => {
  const state = loadState();
  return state.dailyUsage[dateKey] || 0;
};

export const getLastDaysUsage = (days = 7) => {
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
