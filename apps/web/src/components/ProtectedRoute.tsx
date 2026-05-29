import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthProvider.js";
import {
  canAccessRoute,
  canUseWebClient,
  getRoleHome,
  type AppRoute,
} from "../auth/role-access.js";

type ProtectedRouteProps = {
  route: AppRoute;
  children: ReactNode;
};

export function ProtectedRoute({ route, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (route === "login") {
    if (user && canUseWebClient(user.role)) {
      return <Navigate to={getRoleHome(user.role)} replace />;
    }

    return children;
  }

  if (!user || !canUseWebClient(user.role)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!canAccessRoute(user.role, route)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}
