import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Question } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  question: Question;
  onPress: () => void;
  onAuthorPress?: () => void;
  footer?: React.ReactNode;
}

export function QuestionCard({ question, onPress, onAuthorPress, footer }: Props) {
  const count = question.answers_count;
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
        <Text style={styles.title} numberOfLines={2}>
          {question.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {question.description}
        </Text>
      </Pressable>

      <View style={styles.meta}>
        <Pressable onPress={onAuthorPress} disabled={!onAuthorPress} hitSlop={8}>
          <Text style={[styles.metaText, onAuthorPress && styles.author]}>{question.author_pseudo}</Text>
        </Pressable>
        <Text style={styles.metaText}>{question.date}</Text>
          <View style={styles.stats}>
            <View style={styles.count}>
              <Ionicons
                name={question.liked_by_me ? 'heart' : 'heart-outline'}
                size={14}
                color={question.liked_by_me ? colors.danger : colors.muted}
              />
              <Text style={styles.metaText}>{question.likes_count}</Text>
            </View>
            <View style={styles.count}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
              <Text style={styles.metaText}>
                {count} {count > 1 ? 'réponses' : 'réponse'}
              </Text>
            </View>
        </View>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: { opacity: 0.75 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: spacing.xs },
  description: { fontSize: 15, color: colors.muted, lineHeight: 21 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginTop: spacing.md,
  },
  metaText: { fontSize: 13, color: colors.muted },
  author: { color: colors.primary, fontWeight: '600' },

  stats: { flexDirection: 'row', alignItems: 'center', columnGap: spacing.md, marginLeft: 'auto' },
  count: { flexDirection: 'row', alignItems: 'center', columnGap: 4 },
  
  footer: {
    flexDirection: 'row',
    columnGap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
