import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Petit compteur partagé : quand on publie, modifie ou supprime quelque chose,
// on appelle bump() et toutes les listes se rechargent.
interface RefreshValue {
  version: number;
  bump: () => void;
}

const RefreshContext = createContext<RefreshValue>({ version: 0, bump: () => {} });

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(() => ({ version, bump }), [version, bump]);
  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
}

export function useRefresh(): RefreshValue {
  return useContext(RefreshContext);
}
