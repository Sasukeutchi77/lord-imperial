import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { registerWithEmail } from '../services/auth';
import { useAppTheme } from '../utils/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailError = normalizedEmail && !EMAIL_REGEX.test(normalizedEmail) ? 'Adresse email invalide.' : '';
  const passwordError = password && password.length < 6 ? 'Utilisez au moins 6 caractères.' : '';
  const confirmPasswordError =
    confirmPassword && password !== confirmPassword ? 'Les mots de passe ne correspondent pas.' : '';
  const canSubmit =
    Boolean(normalizedEmail && password && confirmPassword) &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    !loading;

  const handleRegister = async () => {
    if (!normalizedEmail) {
      Alert.alert('Email requis', 'Saisissez votre adresse email.');
      return;
    }

    if (emailError) {
      Alert.alert('Email invalide', emailError);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Utilisez au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Vérification', 'Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(normalizedEmail, password);
      Alert.alert('Compte créé', 'Votre compte email est prêt. Choisissez maintenant votre pseudo unique.');
    } catch (error) {
      Alert.alert('Inscription impossible', error.message || 'Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <Text style={styles.title}>Créer votre accès impérial</Text>
      <Text style={styles.subtitle}>Après l’inscription, vous devrez réserver un pseudo unique.</Text>

      <View style={styles.card}>
        <ThemedTextInput
          label="Email"
          placeholder="vous@empire.com"
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
          placeholder="Au moins 6 caractères"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />
        <ThemedTextInput
          label="Confirmer le mot de passe"
          placeholder="Retapez votre mot de passe"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmPasswordError}
        />
        <PrimaryButton title="Continuer" onPress={handleRegister} loading={loading} disabled={!canSubmit} />
      </View>
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '900',
      marginTop: 24,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 12,
    },
    card: {
      marginTop: 28,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      ...theme.shadow.soft,
    },
  });
