import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/client';
import type { Paged } from '../types';

export interface PagedState<T> {
  items: T[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  reload: () => void;
  refresh: () => void;
  loadMore: () => void;
}

// Charge une liste page par page (défilement infini + tirer pour rafraîchir).
// `deps` : quand l'une de ces valeurs change (ex. le texte recherché), la liste repart de la page 1.
export function usePaged<T>(fetchPage: (page: number) => Promise<Paged<T>>, deps: unknown[]): PagedState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const requestId = useRef(0);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    const id = ++requestId.current;
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetchRef.current(1);
      if (id !== requestId.current) {
        return; // une requête plus récente a pris le relais
      }
      setItems(res.items);
      setPage(1);
      setHasMore(res.has_more);
      setError(null);
    } catch (e) {
      if (id === requestId.current) {
        setError(errorMessage(e));
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading || refreshing) {
      return;
    }
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const res = await fetchRef.current(page + 1);
      if (id !== requestId.current) {
        return;
      }
      setItems((current) => [...current, ...res.items]);
      setPage(page + 1);
      setHasMore(res.has_more);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, loading, refreshing, page]);

  return {
    items,
    loading,
    refreshing,
    loadingMore,
    error,
    reload: () => void load('initial'),
    refresh: () => void load('refresh'),
    loadMore: () => void loadMore(),
  };
}
