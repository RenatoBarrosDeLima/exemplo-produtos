import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getToken, getSavedUser, setAuth, clearAuth, login as apiLogin } from '../api/auth';
import type { AuthUser } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Restore from localStorage on mount
    if (getToken()) return getSavedUser();
    return null;
  });

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    const { access_token, user: authUser } = await apiLogin(email, password);
    setAuth(access_token, authUser);
    setUser(authUser);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
