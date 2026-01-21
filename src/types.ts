export interface UserProfile {
  name: string;
  region: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  phone: string;
  region: string;
  createdAt: number;
}

export type Language = 'uz' | 'ru' | 'en';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'html' | 'api' | 'static';
  url: string;
  enabled: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: number;
  tags: string[];
  docRefs: string[]; // PF-\d+, etc.
}

export interface BenefitItem {
  id: string;
  soha: string;
  hudud: string;
  faoliyat: string;
  title: string;
  benefit: string;
  eligibility: string;
  how_to_apply: string;
  legal_basis: string;
  tags: string[];
}

export interface CourseSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  sourceId: string;
  sourceName: string;
  url: string;
  language: 'uz' | 'ru' | 'en';
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'video' | 'article' | 'program' | 'webinar';
  durationHours?: number;
  price: 'free' | 'paid' | 'mixed';
  topics: string[];
  summary: string;
  publishedAt?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  courseIds: string[];
}

export type Theme = 'system' | 'light' | 'dark';

export interface LearningProgress {
  pathId: string;
  completedCourseIds: string[];
}
