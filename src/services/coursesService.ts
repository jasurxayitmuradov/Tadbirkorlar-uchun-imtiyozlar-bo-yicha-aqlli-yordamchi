import coursesData from '../data/courses.json';
import pathsData from '../data/learning_paths.json';
import { Course, LearningPath } from '../types';

// Load initial data
export const getCourses = (): Course[] => {
  return coursesData as Course[];
};

export const getLearningPaths = (): LearningPath[] => {
  return pathsData as LearningPath[];
};

export const getCourseById = (id: string): Course | undefined => {
  return (coursesData as Course[]).find(c => c.id === id);
};

export const getPathCourses = (pathId: string): Course[] => {
  const path = (pathsData as LearningPath[]).find(p => p.id === pathId);
  if (!path) return [];
  return (coursesData as Course[]).filter(c => path.courseIds.includes(c.id));
};

// Filter Logic
export interface CourseFilters {
  query?: string;
  topic?: string;
  level?: string;
  format?: string;
  language?: string;
  price?: string;
  sourceId?: string;
  onlyFavorites?: boolean;
}

export const filterCourses = (allCourses: Course[], filters: CourseFilters, favorites: string[]): Course[] => {
  return allCourses.filter(course => {
    if (filters.onlyFavorites && !favorites.includes(course.id)) return false;
    if (filters.query && !course.title.toLowerCase().includes(filters.query.toLowerCase()) && !course.summary.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters.topic && !course.topics.includes(filters.topic)) return false;
    if (filters.level && course.level !== filters.level) return false;
    if (filters.format && course.format !== filters.format) return false;
    if (filters.language && course.language !== filters.language) return false;
    if (filters.price && course.price !== filters.price) return false;
    if (filters.sourceId && course.sourceId !== filters.sourceId) return false;
    return true;
  });
};

// Favorites Logic (LocalStorage)
const FAV_KEY = 'course_favorites';

export const getFavorites = (): string[] => {
  const stored = localStorage.getItem(FAV_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const toggleFavorite = (courseId: string): string[] => {
  const current = getFavorites();
  let updated;
  if (current.includes(courseId)) {
    updated = current.filter(id => id !== courseId);
  } else {
    updated = [...current, courseId];
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(updated));
  return updated;
};

// Learning Progress Logic
const PROGRESS_KEY = 'learning_progress';

export const getProgress = (pathId: string): string[] => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return [];
  const allProgress = JSON.parse(stored);
  return allProgress[pathId] || [];
};

export const markCourseComplete = (pathId: string, courseId: string) => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  const allProgress = stored ? JSON.parse(stored) : {};
  const pathProgress = allProgress[pathId] || [];
  
  if (!pathProgress.includes(courseId)) {
    allProgress[pathId] = [...pathProgress, courseId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  }
  return allProgress[pathId];
};
