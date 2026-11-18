import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as api from '../api';
import { PagedList } from '../components/PagedList';
import { Button } from '../components/ui';
import { usePaged } from '../hooks/usePaged';
import type { RootStackParamList } from '../navigation/types';
import { useNotifications } from '../state/NotificationsContext';
import { useRefresh } from '../state/RefreshContext';
import { colors, radius, spacing } from '../theme';
import type { AppNotification } from '../types';

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { version } = useRefresh();
  const { unread, refreshUnread } = useNotifications();

  // La liste se recharge quand le compteur de non lues change : une nouvelle notification apparaît toute seule.
  const state = usePaged<AppNotification>((page) => api.listNotifications(page), [version, unread]);

  async function open(item: AppNotification) {
    if (!item.is_read) {
      try {
        await api.markNotificationRead(item.id);
        await refreshUnread();
      } catch {
        // Pas bloquant : on ouvre quand même la question.
      }
    }
    navigation.navigate('QuestionDetail', { id: item.question_id });
  }

  async function markAllRead() {
    try {
      await api.markAllNotificationsRead();
      await refreshUnread();
    } catch {
      // Le compteur se resynchronisera au prochain passage.
    }
  }

  const header =
    unread > 0 ? (
      <View style={styles.header}>
        <Button compact variant="secondary" title="Tout marquer comme lu" onPress={() => void markAllRead()} />
      </View>
    ) : null;

  return (
    <View style={styles.screen}>
      <PagedList
        state={state}
        header={header}
        emptyText="Aucune notification pour l'instant. Vous serez prévenu quand quelqu'un répond ou aime l'une de vos questions."
        renderItem={(n) => (
          <Pressable
            onPress={() => void open(n)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.item, !n.is_read && styles.itemUnread, pressed && styles.pressed]}
          >
            <View style={[styles.icon, n.type === 'like' && styles.iconLike]}>
              <Ionicons
                name={n.type === 'like' ? 'heart' : 'chatbubble'}
                size={18}
                color={n.type === 'like' ? colors.danger : colors.primary}
              />
            </View>
            <View style={styles.texts}>
              <Text style={styles.message}>
                <Text style={styles.actor}>{n.actor_pseudo}</Text>
                {n.type === 'like' ? ' a aimé votre question ' : ' a répondu à votre question '}
                <Text style={styles.questionTitle}>« {n.question_title} »</Text>
              </Text>
              <Text style={styles.date}>{n.date}</Text>
            </View>
            {!n.is_read ? <View style={styles.dot} /> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: { marginBottom: spacing.md, alignItems: 'flex-end' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemUnread: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.8 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  iconLike: { backgroundColor: colors.dangerSoft },
  texts: { flex: 1 },
  message: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  actor: { fontWeight: '700' },
  questionTitle: { fontWeight: '600' },
  date: { fontSize: 12, color: colors.muted, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
