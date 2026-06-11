import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../utils/theme';

export default function ThemedTextInput({ label, error, style, helperText, multiline = false, ...props }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, multiline && styles.multiline, style, focused && styles.inputFocused, error && styles.inputError]}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginBottom: 16,
    },
    label: {
      color: theme.colors.textSoft,
      marginBottom: 8,
      fontSize: 13,
      fontWeight: '700',
    },
    input: {
      minHeight: 56,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    multiline: {
      minHeight: 110,
      paddingTop: 14,
      paddingBottom: 14,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    error: {
      color: theme.colors.danger,
      fontSize: 12,
      marginTop: 8,
    },
    helper: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 8,
    },
  });
