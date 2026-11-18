import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import * as api from '../api';
import { useAuth } from '../auth/AuthContext';

// Intervalle de vérification des nouvelles notifications (appli ouverte au premier plan).
const POLL_MS = 10000;

interface NotificationsValue {
  unread: number;
  refreshUnread: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsValue>({
  unread: 0,
  refreshUnread: async () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      setUnread(await api.getUnreadCount());
    } catch {
      // Réseau coupé ou session expirée (gérée ailleurs) : on garde la valeur précédente.
    }
  }, []);

  // Tant qu'un utilisateur est connecté et que l'appli est au premier plan, on interroge le serveur.
  useEffect(() => {
    if (userId === undefined) {
      setUnread(0);
      return;
    }

    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const start = () => {
      stop();
      void refreshUnread();
      timer = setInterval(() => void refreshUnread(), POLL_MS);
    };

    start();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      subscription.remove();
    };
  }, [userId, refreshUnread]);

  const value = useMemo(() => ({ unread, refreshUnread }), [unread, refreshUnread]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsValue {
  return useContext(NotificationsContext);
}
