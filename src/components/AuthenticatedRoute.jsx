import React from 'react';
import { Navigate, useLocation, useHistory, Link } from 'react-router-dom';
import { useAppContext } from '../lib/contextLib';

export default function AuthenticatedRoute({ children }) {
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAppContext();
  const history = useHistory();

  if (!isAuthenticated) {
    history.push(`/loginpage?redirect=${pathname}${search}`);
    return null; // or a loading indicator if needed
  }
  
  return children;
}
