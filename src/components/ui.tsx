import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

// ---------- Button ----------
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, compact }: ButtonProps) {
  const inactive = disabled || loading;
  const textColor = variant === 'primary' ? '#fff' : variant === 'danger' ? colors.danger : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        pressed && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

// ---------- TextField ----------
interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...inputProps}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        style={[styles.input, inputProps.multiline && styles.inputMultiline, focused && styles.inputFocused, style]}
      />
    </View>
  );
}

// ---------- États de chargement / erreur / vide ----------
export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Chargement impossible</Text>
      <Text style={styles.centerText}>{message}</Text>
      {onRetry ? (
        <View style={styles.retry}>
          <Button title="Réessayer" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyView({ text }: { text: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.centerText}>{text}</Text>
    </View>
  );
}

export function Banner({ message }: { message: string }) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

// ---------- Avatar ----------
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.trim().slice(0, 2).toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonCompact: { minHeight: 38, paddingHorizontal: spacing.md },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  buttonDanger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonTextCompact: { fontSize: 14 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },

  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.ink,
  },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top', paddingTop: spacing.md },
  inputFocused: { borderColor: colors.primary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centerText: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  retry: { marginTop: spacing.lg, alignSelf: 'stretch' },

  banner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { color: colors.danger, fontSize: 14, lineHeight: 20 },

  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
});
