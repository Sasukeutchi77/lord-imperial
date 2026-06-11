import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../utils/theme';

export default function ScreenContainer({ children, withKeyboard = false, style, contentStyle }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const content = (
    <View style={[styles.container, style]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    </View>
  );

  if (!withKeyboard) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    keyboard: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing(2),
      paddingVertical: theme.spacing(1.25),
    },
  });
