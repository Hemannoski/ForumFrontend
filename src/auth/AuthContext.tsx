import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as api from '../api';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import type { RegisterInput, User } from '../types';

const SESSION_KEY = 'forum.session';

interface StoredSession {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (pseudo: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch {
      // Le stockage sécurisé peut être indisponible (ex. navigateur) : on ignore.
    }
  }, []);

  const saveSession = useCallback(async (token: string, sessionUser: User) => {
    setAuthToken(token);
    setUser(sessionUser);
    try {
      const session: StoredSession = { token, user: sessionUser };
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Sans stockage, l'utilisateur devra se reconnecter au prochain lancement.
    }
  }, []);

  // Session expirée côté serveur : on déconnecte proprement.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Au lancement : on restaure la session enregistrée, puis on la vérifie auprès du serveur.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (!raw) {
          return;
        }
        const session = JSON.parse(raw) as StoredSession;
        setAuthToken(session.token);
        if (!cancelled) {
          setUser(session.user);
        }
        try {
          const fresh = await api.me();
          if (!cancelled) {
            setUser(fresh);
          }
        } catch {
          // 401 : géré par le handler global. Réseau coupé : on garde la session enregistrée.
        }
      } catch {
        // Session illisible : on repart de zéro.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (pseudo: string, password: string) => {
      const res = await api.login(pseudo, password);
      await saveSession(res.token, res.user);
    },
    [saveSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await api.register(input);
      await saveSession(res.token, res.user);
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Même si le serveur est injoignable, on termine la session sur le téléphone.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return ctx;
}

// Pour les écrans réservés aux utilisateurs connectés.
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) {
    throw new Error('Aucun utilisateur connecté');
  }
  return user;
}
