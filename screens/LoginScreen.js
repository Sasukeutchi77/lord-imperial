import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { loginWithEmail } from '../services/auth';
import { useAppTheme } from '../utils/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailError = normalizedEmail && !EMAIL_REGEX.test(normalizedEmail) ? 'Adresse email invalide.' : '';
  const passwordError = password && password.length < 6 ? 'Minimum 6 caractères.' : '';
  const canSubmit = Boolean(normalizedEmail && password) && !emailError && !passwordError && !loading;

  const handleLogin = async () => {
    if (!normalizedEmail) {
      Alert.alert('Email requis', 'Saisissez votre adresse email.');
      return;
    }
    if (emailError) {
      Alert.alert('Email invalide', emailError);
      return;
    }
    if (!password) {
      Alert.alert('Mot de passe requis', 'Saisissez votre mot de passe.');
      return;
    }
    try {
      setLoading(true);
      await loginWithEmail(normalizedEmail, password);
    } catch (error) {
      Alert.alert('Connexion impossible', error.message || 'Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <LinearGradient
        colors={['rgba(201,149,107,0.08)', 'transparent']}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>L</Text>
        </View>
        <Text style={styles.kicker}>LORD IMPERIAL</Text>
        <Text style={styles.subtitle}>Le cercle privé</Text>
      </View>

      <View style={styles.card}>
        <ThemedTextInput
          label="Identifiant"
          placeholder="Votre adresse courriel"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />
        <ThemedTextInput
          label="Mot de passe"
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          error={password ? passwordError : ''}
        />
        <PrimaryButton title="Se connecter" onPress={handleLogin} loading={loading} disabled={!canSubmit} />
        <View style={styles.divider} />
        <PrimaryButton title="Créer un compte" onPress={() => navigation.navigate('Register')} ghost />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    topGlow: {
      position: 'absolute',
      top: -80,
      left: -60,
      right: -60,
      height: 320,
      borderRadius: 999,
    },
    hero: {
      marginTop: 56,
      alignItems: 'center',
      marginBottom: 40,
    },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    logoLetter: {
      color: theme.colors.primary,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: 1,
    },
    kicker: {
      color: theme.colors.text,
      fontWeight: '900',
      fontSize: 22,
      letterSpacing: 4,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginTop: 6,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      ...theme.shadow.soft,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 12,
    },
  });
