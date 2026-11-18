import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { PagedState } from '../hooks/usePaged';
import { EmptyView, ErrorView, LoadingView } from './ui';
import { colors, spacing } from '../theme';

interface Props<T> {
  state: PagedState<T>;
  renderItem: (item: T) => React.ReactElement;
  emptyText: string;
  header?: React.ReactElement | null;
}

// Liste avec chargement, erreur, état vide, tirer-pour-rafraîchir et défilement infini.
export function PagedList<T extends { id: number }>({ state, renderItem, emptyText, header }: Props<T>) {
  if (state.loading) {
    return <LoadingView />;
  }
  if (state.error && state.items.length === 0 && !header) {
    return <ErrorView message={state.error} onRetry={state.reload} />;
  }

  let footer: React.ReactElement | undefined;
  if (state.loadingMore) {
    footer = <ActivityIndicator style={styles.footer} color={colors.primary} />;
  } else if (state.error && state.items.length > 0) {
    footer = <Text style={styles.footerError}>{state.error}</Text>;
  }

  return (
    <FlatList
      data={state.items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => renderItem(item)}
      onEndReached={state.loadMore}
      onEndReachedThreshold={0.4}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={header ?? undefined}
      ListEmptyComponent={
        state.error ? <ErrorView message={state.error} onRetry={state.reload} /> : <EmptyView text={emptyText} />
      }
      ListFooterComponent={footer}
    />
  );
}

function Separator() {
  return <View style={{ height: spacing.md }} />;
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, flexGrow: 1 },
  footer: { marginVertical: spacing.lg },
  footerError: { textAlign: 'center', color: colors.danger, marginVertical: spacing.lg },
});
