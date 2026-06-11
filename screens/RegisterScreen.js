import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { registerWithEmail } from '../services/auth';
import { useAppTheme } from '../utils/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailError = normalizedEmail && !EMAIL_REGEX.test(normalizedEmail) ? 'Adresse email invalide.' : '';
  const passwordError = password && password.length < 6 ? 'Minimum 6 caractères.' : '';
  const confirmError =
    confirmPassword && password !== confirmPassword ? 'Les mots de passe ne correspondent pas.' : '';

  const canSubmit =
    Boolean(normalizedEmail && password && confirmPassword) &&
    !emailError && !passwordError && !confirmError && !loading;

  const handleRegister = async () => {
    if (!normalizedEmail) { Alert.alert('Email requis', 'Saisissez votre adresse email.'); return; }
    if (emailError) { Alert.alert('Email invalide', emailError); return; }
    if (password.length < 6) { Alert.alert('Mot de passe trop court', 'Utilisez au moins 6 caractères.'); return; }
    if (password !== confirmPassword) { Alert.alert('Vérification', 'Les mots de passe ne correspondent pas.'); return; }

    try {
      setLoading(true);
      await registerWithEmail(normalizedEmail, password);
      // Navigation to UsernameSetup is handled automatically by AppNavigator (hasUsername = false)
    } catch (error) {
      Alert.alert('Inscription impossible', error.message || 'Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <LinearGradient
        colors={['rgba(201,149,107,0.10)', 'transparent']}
        style={styles.topGlow}
        pointerEvents="none"
      />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>L</Text>
        </View>
        <Text style={styles.kicker}>LORD IMPERIAL</Text>
        <Text style={styles.tagline}>Créez votre accès impérial</Text>
        <View style={styles.stepRow}>
          {['Compte', 'Pseudo'].map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{step}</Text>
              {i < 1 ? <View style={styles.stepLine} /> : null}
            </View>
          ))}
        </View>
      </View>

      {/* Form card */}
      <View style={styles.card}>
        <ThemedTextInput
          label="Adresse email"
          placeholder="vous@empire.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <View style={styles.passwordRow}>
          <View style={{ flex: 1 }}>
            <ThemedTextInput
              ref={passwordRef}
              label="Mot de passe"
              placeholder="Au moins 6 caractères"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
          </View>
          <Pressable onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.passwordRow}>
          <View style={{ flex: 1 }}>
            <ThemedTextInput
              ref={confirmRef}
              label="Confirmer le mot de passe"
              placeholder="Retapez votre mot de passe"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={confirmError}
              returnKeyType="done"
              onSubmitEditing={canSubmit ? handleRegister : undefined}
            />
          </View>
          <Pressable onPress={() => setShowConfirm((p) => !p)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons
              name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.requirements}>
          <PasswordRule met={password.length >= 6} text="Au moins 6 caractères" />
          <PasswordRule met={Boolean(password && password === confirmPassword)} text="Mots de passe identiques" />
          <PasswordRule met={Boolean(normalizedEmail && !emailError)} text="Email valide" />
        </View>

        <PrimaryButton
          title="Créer mon compte"
          onPress={handleRegister}
          loading={loading}
          disabled={!canSubmit}
        />
      </View>

      {/* Footer: back to login */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Déjà membre ?</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.footerLink}>Se connecter</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function PasswordRule({ met, text }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createRuleStyles(theme), [theme]);
  return (
    <View style={styles.rule}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? theme.colors.success || '#4CAF50' : theme.colors.textMuted}
      />
      <Text style={[styles.ruleText, met && styles.ruleTextMet]}>{text}</Text>
    </View>
  );
}

const createRuleStyles = (theme) =>
  StyleSheet.create({
    rule: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
    ruleText: { fontSize: 12, color: theme.colors.textMuted },
    ruleTextMet: { color: theme.colors.success || '#4CAF50' },
  });

const createStyles = (theme) =>
  StyleSheet.create({
    topGlow: {
      position: 'absolute',
      top: -80,
      left: -60,
      right: -60,
      height: 280,
      borderRadius: 999,
    },
    hero: {
      marginTop: 48,
      alignItems: 'center',
      marginBottom: 28,
    },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
    logoLetter: {
      color: theme.colors.primary,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 1,
    },
    kicker: {
      color: theme.colors.text,
      fontWeight: '900',
      fontSize: 20,
      letterSpacing: 4,
      textAlign: 'center',
    },
    tagline: {
      color: theme.colors.textMuted,
      fontSize: 13,
      marginTop: 6,
      marginBottom: 18,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    stepDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepDotActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    stepNum: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textMuted,
    },
    stepNumActive: {
      color: theme.colors.background,
    },
    stepLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    stepLabelActive: {
      color: theme.colors.text,
      fontWeight: '800',
    },
    stepLine: {
      width: 20,
      height: 1.5,
      backgroundColor: theme.colors.border,
      marginHorizontal: 2,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 4,
      ...theme.shadow.soft,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    eyeBtn: {
      position: 'absolute',
      right: 0,
      bottom: 14,
      paddingHorizontal: 12,
      paddingBottom: 2,
    },
    requirements: {
      paddingHorizontal: 4,
      paddingBottom: 8,
      paddingTop: 4,
      gap: 2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 24,
      marginBottom: 12,
    },
    footerText: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    footerLink: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
  });
