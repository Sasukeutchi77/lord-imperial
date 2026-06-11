import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { reserveUsername } from '../services/auth';
import { validateUsername } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';

export default function UsernameSetupScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { firebaseUser } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const validation = useMemo(() => validateUsername(username), [username]);

  const handleReserve = async () => {
    if (!validation.valid) {
      Alert.alert('Pseudo invalide', validation.message);
      return;
    }

    try {
      setLoading(true);
      await reserveUsername(firebaseUser.uid, validation.normalized);
      Alert.alert('Pseudo réservé', `${validation.normalized} est maintenant à vous.`);
    } catch (error) {
      Alert.alert('Pseudo indisponible', error.message || 'Essayez une autre variante.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <Text style={styles.title}>Choisissez votre identifiant</Text>
      <Text style={styles.subtitle}>
        Votre pseudo doit être unique. Les autres utilisateurs vous trouveront via ce nom exact.
      </Text>
      <View style={styles.card}>
        <ThemedTextInput
          label="Pseudo unique"
          placeholder="@dark_mikey"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          error={username ? (validation.valid ? '' : validation.message) : ''}
          helperText="3 à 24 caractères, lettres minuscules, chiffres, point ou underscore."
        />
        <PrimaryButton title="Réserver mon pseudo" onPress={handleReserve} loading={loading} disabled={!validation.valid || loading} />
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
      marginTop: 12,
      lineHeight: 22,
    },
    card: {
      marginTop: 28,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      ...theme.shadow.soft,
    },
  });
