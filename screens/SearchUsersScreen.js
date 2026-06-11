import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';
import { ensurePrivateChat, searchUserByUsername, searchUsersByUsernamePrefix } from '../services/chat';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';

export default function SearchUsersScreen({ navigation }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingChatUid, setStartingChatUid] = useState(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const nextResults = await searchUsersByUsernamePrefix(trimmed);
        if (active) {
          setResults(nextResults);
        }
      } catch (error) {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleExactSearch = useCallback(async () => {
    try {
      setLoading(true);
      const user = await searchUserByUsername(query);
      setResults(user ? [user] : []);

      if (!user) {
        Alert.alert('Aucun résultat', 'Aucun utilisateur trouvé pour ce pseudo.');
      }
    } catch (error) {
      setResults([]);
      Alert.alert('Recherche impossible', error.message || 'Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleStartChat = useCallback(
    async (user) => {
      if (!user) return;

      if (user.uid === profile.uid) {
        Alert.alert('Info', 'Vous ne pouvez pas démarrer une discussion avec vous-même.');
        return;
      }

      try {
        setStartingChatUid(user.uid);
        const chatId = await ensurePrivateChat(profile, user);
        navigation.navigate('Chat', {
          chatId,
          initialTitle: user.displayName || user.username,
        });
      } catch (error) {
        Alert.alert('Conversation impossible', error.message || 'Impossible d’ouvrir cette discussion.');
      } finally {
        setStartingChatUid(null);
      }
    },
    [navigation, profile]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const isSelf = item.uid === profile.uid;
      const openProfile = () => navigation.navigate('UserProfile', { userId: item.uid, initialProfile: item });
      return (
        <View style={styles.resultCard}>
          <Avatar uri={item.avatar} label={item.displayName || item.username} size={64} showOnline={item.isOnline} onPress={openProfile} />
          <Pressable style={styles.resultBody} onPress={openProfile}>
            <Text style={styles.resultName} numberOfLines={1}>{item.displayName || item.username}</Text>
            <Text style={styles.resultUsername} numberOfLines={1}>{item.username}</Text>
            {!!item.bio ? <Text style={styles.resultBio} numberOfLines={2}>{item.bio}</Text> : null}
          </Pressable>
          {isSelf ? (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>Vous</Text>
            </View>
          ) : (
            <Pressable onPress={() => handleStartChat(item)} style={styles.chatAction}>
              {startingChatUid === item.uid ? <ActivityIndicator color="#fff" /> : <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />}
            </Pressable>
          )}
        </View>
      );
    },
    [handleStartChat, profile.uid, startingChatUid, styles]
  );

  return (
    <ScreenContainer withKeyboard>
      <Text style={styles.title}>Trouver un utilisateur</Text>
      <Text style={styles.subtitle}>
        Recherchez par pseudo exact ou par préfixe. L’unicité du username reste garantie côté Firestore.
      </Text>

      <View style={styles.card}>
        <ThemedTextInput
          label="Pseudo"
          placeholder="@username"
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
          helperText="Exemple : @dark_mikey"
        />
        <PrimaryButton title="Recherche exacte" onPress={handleExactSearch} loading={loading} />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Résultats</Text>
        {loading ? <ActivityIndicator size="small" color={theme.colors.accent} /> : <Text style={styles.resultsMeta}>{results.length}</Text>}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={6}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={28} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Commencez à saisir un pseudo pour voir les profils correspondants.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '900',
      marginTop: 8,
    },
    subtitle: {
      color: theme.colors.textMuted,
      lineHeight: 22,
      marginTop: 12,
    },
    card: {
      marginTop: 24,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: 20,
      ...theme.shadow.soft,
    },
    resultsHeader: {
      marginTop: 24,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultsTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    resultsMeta: {
      color: theme.colors.textMuted,
      fontWeight: '700',
    },
    listContent: {
      paddingBottom: 24,
      flexGrow: 1,
    },
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginBottom: 12,
    },
    resultBody: {
      flex: 1,
    },
    resultName: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    resultUsername: {
      color: theme.colors.accent,
      fontWeight: '700',
      marginTop: 2,
    },
    resultBio: {
      color: theme.colors.textMuted,
      marginTop: 6,
      lineHeight: 19,
    },
    chatAction: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    youBadge: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAlt,
    },
    youBadgeText: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 22,
      gap: 10,
    },
    emptyText: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 21,
    },
  });
