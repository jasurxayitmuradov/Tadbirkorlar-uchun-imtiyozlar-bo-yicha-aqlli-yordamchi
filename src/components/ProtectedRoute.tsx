import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthed } from '../lib/auth';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthed()) return <Navigate to="/auth" replace />;
  return children;
};
