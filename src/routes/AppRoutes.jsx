import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '../pages/Auth';
import { Profile } from '../pages/Profile';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardPage } from '../pages/DashboardPage';
import { ChatPage } from '../pages/ChatPage';
import { CoursesPage } from '../pages/CoursesPage';
import { Courses } from '../pages/Courses';
import { CourseDetail } from '../pages/CourseDetail';
import { LessonPlayer } from '../pages/LessonPlayer';
import { NewsPage } from '../pages/NewsPage';
import { BenefitsPage } from '../pages/BenefitsPage';
import { SourcesPage } from '../pages/SourcesPage';

export const AppRoutes = ({ AppShell, SettingsPage }) => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route path="/courses" element={<Courses />} />
    <Route path="/courses/:courseId" element={<CourseDetail />} />
    <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPlayer />} />
    <Route path="/app" element={<AppShell />}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="courses" element={<Courses />} />
      <Route path="courses/:courseId" element={<CourseDetail />} />
      <Route path="courses/:courseId/lessons/:lessonId" element={<LessonPlayer />} />
      <Route path="courses-legacy" element={<CoursesPage />} />
      <Route path="benefits" element={<BenefitsPage />} />
      <Route path="news" element={<NewsPage />} />
      <Route path="sources" element={<SourcesPage />} />
      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="settings" element={<SettingsPage />} />
      <Route index element={<Navigate to="dashboard" />} />
    </Route>
    <Route path="*" element={<Navigate to="/app" />} />
  </Routes>
);
