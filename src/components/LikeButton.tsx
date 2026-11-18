import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface Props {
  liked: boolean;
  count: number;
  // Sans onPress, le bouton est en lecture seule (ex. l'auteur ne peut pas aimer sa propre question).
  onPress?: () => void;
  disabled?: boolean;
}

export function LikeButton({ liked, count, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={liked ? "Retirer mon j'aime" : "J'aime"}
      hitSlop={8}
      style={({ pressed }) => [styles.button, liked && styles.buttonLiked, pressed && styles.pressed]}
    >
      <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.danger : colors.muted} />
      <Text style={[styles.text, liked && styles.textLiked]}>
        {count} j'aime
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    columnGap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  buttonLiked: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
  pressed: { opacity: 0.75 },
  text: { fontSize: 14, fontWeight: '600', color: colors.muted },
  textLiked: { color: colors.danger },
});
