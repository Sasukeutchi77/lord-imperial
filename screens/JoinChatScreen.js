import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Avatar from '../components/Avatar';
import { useAppTheme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { joinChatByInviteCode, getInviteCodeInfo } from '../services/chat';

export default function JoinChatScreen({ route, navigation }) {
  const { code } = route.params || {};
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();

  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    let active = true;
    if (!code) {
      setLoadingInfo(false);
      return undefined;
    }

    getInviteCodeInfo({ code })
      .then((data) => {
        if (active) {
          setInfo(data);
          setLoadingInfo(false);
        }
      })
      .catch(() => {
        if (active) setLoadingInfo(false);
      });

    return () => { active = false; };
  }, [code]);

  const handleJoin = async () => {
    if (!code || !profile) return;
    try {
      setJoining(true);
      const chatId = await joinChatByInviteCode({ code, user: profile });
      setJoined(true);
      navigation.replace('Chat', { chatId, initialTitle: info?.title || null });
    } catch (error) {
      Alert.alert('Impossible de rejoindre', error.message || 'Le lien d'invitation est invalide ou expiré.');
    } finally {
      setJoining(false);
    }
  };

  if (!code) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Ionicons name="link-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.title}>Lien invalide</Text>
          <Text style={styles.subtitle}>Ce lien d'invitation n'est pas reconnu.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {loadingInfo ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.subtitle}>Vérification du lien…</Text>
        </View>
      ) : !info ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.danger} />
          <Text style={styles.title}>Lien expiré</Text>
          <Text style={styles.subtitle}>Ce lien d'invitation est invalide ou a expiré.</Text>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Retour</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.groupInfo}>
            <Avatar uri={info.avatar} name={info.title || '?'} size={72} />
            <Text style={styles.groupName}>{info.title || 'Groupe privé'}</Text>
            {info.description ? (
              <Text style={styles.groupDesc}>{info.description}</Text>
            ) : null}
            <View style={styles.memberRow}>
              <Ionicons name="people-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.memberCount}>{info.memberCount || 0} membre{(info.memberCount || 0) > 1 ? 's' : ''}</Text>
            </View>
          </View>

          {joined ? (
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.joinedText}>Vous avez rejoint le groupe !</Text>
            </View>
          ) : (
            <Pressable
              style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
              onPress={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.joinBtnText}>Rejoindre le groupe</Text>
              )}
            </Pressable>
          )}

          <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    title: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    card: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    },
    groupInfo: {
      alignItems: 'center',
      gap: 10,
      padding: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: '100%',
    },
    groupName: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '900',
    },
    groupDesc: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    memberCount: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    joinBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 48,
      borderRadius: 14,
      alignItems: 'center',
      width: '100%',
    },
    joinBtnDisabled: {
      opacity: 0.6,
    },
    joinBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 16,
    },
    joinedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    joinedText: {
      color: theme.colors.text,
      fontWeight: '700',
    },
    cancelBtn: {
      paddingVertical: 12,
    },
    cancelText: {
      color: theme.colors.textMuted,
      fontSize: 15,
    },
    backBtn: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backBtnText: {
      color: theme.colors.text,
      fontWeight: '700',
    },
  });
