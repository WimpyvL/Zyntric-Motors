import React, { createContext, useContext, useEffect, useState } from 'react';

const ADMIN_SESSION_KEY = 'zyntric-admin-session';
const DEFAULT_ADMIN_PASSWORD = 'admin';

interface AdminUser {
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  authMode: 'local_password_gate';
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getConfiguredAdminPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasActiveSession = window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

    if (hasActiveSession) {
      setUser({ email: 'admin@local' });
    }

    setLoading(false);
  }, []);

  const login = async (password: string) => {
    if (password !== getConfiguredAdminPassword()) {
      return false;
    }

    window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setUser({ email: 'admin@local' });
    return true;
  };

  const logout = async () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: !!user, loading, authMode: 'local_password_gate', login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
