import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthed } from '../lib/auth';

export const ProtectedRoute = ({ children }) => {
  if (!isAuthed()) return <Navigate to="/auth" replace />;
  return children;
};
