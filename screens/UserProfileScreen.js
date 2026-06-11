import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { ensurePrivateChat } from '../services/chat';
import { formatLastSeen, getUserLabel } from '../utils/helpers';
import { useAppTheme } from '../utils/theme';

export default function UserProfileScreen({ navigation, route }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();
  const { userId, initialProfile = null } = route.params || {};
  const [user, setUser] = useState(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [openingChat, setOpeningChat] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;

    return onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        setUser(snapshot.exists() ? snapshot.data() : initialProfile);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [initialProfile, userId]);

  const isSelf = userId === profile.uid;
  const label = getUserLabel(user || initialProfile || {});

  const handleOpenPrivateChat = async () => {
    if (!user || isSelf) return;

    try {
      setOpeningChat(true);
      const chatId = await ensurePrivateChat(profile, user);
      navigation.navigate('Chat', {
        chatId,
        initialTitle: getUserLabel(user),
      });
    } catch (error) {
      Alert.alert('Conversation impossible', error.message || 'Impossible de démarrer une discussion privée.');
    } finally {
      setOpeningChat(false);
    }
  };

  const cardEffect = user?.profileCard || null;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar
            uri={user?.avatar}
            label={label}
            size={112}
            showOnline={Boolean(user?.isOnline)}
            cardEffect={cardEffect}
          />
          <Text style={styles.name}>{label}</Text>
          <Text style={styles.username}>{user?.username || user?.email || 'Utilisateur'}</Text>

          {/* Show card badge if user has an active card */}
          {cardEffect ? (
            <View style={styles.cardBadge}>
              <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
              <Text style={styles.cardBadgeText}>
                {cardEffect === 'fire' ? '🔥 Feu' :
                 cardEffect === 'neon' ? '⚡ Néon' :
                 cardEffect === 'galaxy' ? '🌌 Galaxy' :
                 cardEffect === 'demonic' ? '😈 Démoniaque' : cardEffect}
              </Text>
            </View>
          ) : null}

          <View style={styles.statusPill}>
            <Ionicons
              name={user?.isOnline ? 'ellipse' : 'time-outline'}
              size={12}
              color={user?.isOnline ? theme.colors.success : theme.colors.textMuted}
            />
            <Text style={styles.statusText}>{formatLastSeen(user?.lastSeen, user?.isOnline)}</Text>
          </View>
        </View>

        {loading ? <ActivityIndicator color={theme.colors.accent} style={styles.loader} /> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bio}>{user?.bio || 'Aucune bio renseignée.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations publiques</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pseudo</Text>
            <Text style={styles.infoValue}>{user?.username || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom affiché</Text>
            <Text style={styles.infoValue}>{user?.displayName || '—'}</Text>
          </View>
        </View>

        {isSelf ? (
          <Pressable style={styles.selfPill} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={18} color={theme.colors.text} />
            <Text style={styles.selfPillText}>C'est votre profil</Text>
          </Pressable>
        ) : (
          <PrimaryButton title="Envoyer un message privé" onPress={handleOpenPrivateChat} loading={openingChat} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    content: {
      paddingBottom: 36,
      gap: 16,
    },
    hero: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: 18,
    },
    name: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '900',
      textAlign: 'center',
    },
    username: {
      color: theme.colors.primary,
      fontWeight: '800',
    },
    cardBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(201,149,107,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(201,149,107,0.3)',
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    cardBadgeText: {
      color: theme.colors.primary,
      fontWeight: '800',
      fontSize: 13,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusText: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    loader: {
      marginTop: 10,
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      gap: 12,
      ...theme.shadow.soft,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '900',
    },
    bio: {
      color: theme.colors.textSoft,
      lineHeight: 21,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    infoLabel: {
      color: theme.colors.textMuted,
      fontWeight: '700',
    },
    infoValue: {
      color: theme.colors.text,
      flex: 1,
      textAlign: 'right',
      fontWeight: '700',
    },
    selfPill: {
      minHeight: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexDirection: 'row',
    },
    selfPillText: {
      color: theme.colors.text,
      fontWeight: '700',
    },
  });
