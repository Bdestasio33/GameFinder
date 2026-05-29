import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { hasPermission, isRoleAllowedForClient, PERMISSIONS, type Permission, type RoleSlug } from "@gamefinder/shared";
import { api, setAuthToken, type SessionUser } from "../api.js";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(({ user: currentUser }) => {
        if (!isRoleAllowedForClient(currentUser.role as RoleSlug, "web")) {
          setAuthToken(null);
          setUser(null);
          return;
        }

        setUser(currentUser);
      })
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const result = await api.login(email, password);
        setAuthToken(result.token);
        setUser(result.user);
        return result.user;
      },
      async logout() {
        try {
          await api.logout();
        } finally {
          setAuthToken(null);
          setUser(null);
        }
      },
      can(permission) {
        if (!user) {
          return hasPermission("guest", permission);
        }
        return hasPermission(user.role as RoleSlug, permission);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { PERMISSIONS };
