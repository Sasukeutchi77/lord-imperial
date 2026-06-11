import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../utils/theme';

export default function SplashScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>L</Text>
      </View>
      <Text style={styles.title}>Lord Imperial</Text>
      <Text style={styles.subtitle}>Le cercle privé</Text>
      <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 24,
    },
    logoCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.30,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 12,
    },
    logoLetter: {
      color: theme.colors.primary,
      fontSize: 38,
      fontWeight: '900',
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '900',
      marginTop: 20,
      letterSpacing: 2,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
      letterSpacing: 3,
      textTransform: 'uppercase',
    },
    loader: {
      marginTop: 28,
    },
  });
