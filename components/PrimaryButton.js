import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../utils/theme';

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, ghost = false, icon = null, danger = false }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const inactive = disabled || loading;

  const dangerColors = danger && !inactive
    ? [theme.colors.danger, '#DC2626']
    : null;

  return (
    <Pressable onPress={onPress} disabled={inactive} style={({ pressed }) => [styles.wrapper, pressed && !inactive && styles.pressed]}>
      {ghost ? (
        <View style={[styles.ghostButton, inactive && styles.ghostButtonDisabled]}>
          <Text style={[styles.ghostText, inactive && styles.disabledText]}>{title}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={inactive ? [theme.colors.surfaceAlt, theme.colors.surfaceAlt] : (dangerColors || [theme.colors.primary, theme.colors.primaryStrong])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.innerRow}>
              {icon}
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    wrapper: { width: '100%' },
    pressed: { opacity: 0.95, transform: [{ scale: 0.992 }] },
    button: {
      minHeight: 56,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      ...theme.shadow.glow,
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    ghostButton: {
      minHeight: 52,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
    },
    ghostButtonDisabled: {
      opacity: 0.55,
    },
    ghostText: {
      color: theme.colors.accent,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '700',
      paddingVertical: 12,
    },
    disabledText: { opacity: 0.5 },
  });
