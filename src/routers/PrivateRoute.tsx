import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PATH } from '../types/paths';
import { useAuthStore } from '../stores/auths';

export default function PrivateRoute() {
  const loc = useLocation();
  const {user, isAuthChecked} = useAuthStore();

  if(!isAuthChecked){
    return null;
  }

  if (!user) {
    return <Navigate to={PATH.ROOT} replace state={{ from: loc.pathname }} />;
  }

  return <Outlet/>;
}