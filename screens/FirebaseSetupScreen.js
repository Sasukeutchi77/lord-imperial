import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { firebaseConfigError } from '../services/firebase';
import { appTheme } from '../utils/theme';

export default function FirebaseSetupScreen() {
  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Firebase doit être configuré</Text>
        <Text style={styles.subtitle}>
          Ajoutez vos variables EXPO_PUBLIC_FIREBASE_* dans un fichier .env à la racine, puis relancez Expo.
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeTitle}>Variables requises</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_FIREBASE_API_KEY</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_FIREBASE_PROJECT_ID</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_FIREBASE_APP_ID</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME</Text>
          <Text style={styles.codeLine}>EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET</Text>
        </View>

        <Text style={styles.errorText}>{firebaseConfigError}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 40,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 24,
  },
  title: {
    color: appTheme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    lineHeight: 22,
    marginTop: 12,
  },
  codeBox: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  codeTitle: {
    color: appTheme.colors.accent,
    fontWeight: '800',
    marginBottom: 10,
  },
  codeLine: {
    color: appTheme.colors.text,
    fontSize: 13,
    marginBottom: 8,
  },
  errorText: {
    color: appTheme.colors.danger,
    marginTop: 20,
    lineHeight: 22,
  },
});
