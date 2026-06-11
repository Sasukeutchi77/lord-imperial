import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { searchAllConversations } from '../services/chat';
import { formatTime } from '../utils/helpers';

export default function GlobalSearchScreen({ navigation }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = String(query || '').trim();
    if (trimmed.length < 2) return;

    try {
      setLoading(true);
      setSearched(true);
      const data = await searchAllConversations({ uid: profile.uid, keyword: trimmed });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [profile.uid, query]);

  const openResult = useCallback(
    (item) => {
      navigation.navigate('Chat', {
        chatId: item.chatId,
        initialTitle: item.chatTitle || null,
        highlightMessageId: item.messageId || null,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable style={styles.resultItem} onPress={() => openResult(item)}>
        <Avatar uri={item.avatar} name={item.chatTitle || '?'} size={46} />
        <View style={styles.resultBody}>
          <View style={styles.resultTop}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {item.chatTitle || 'Conversation'}
            </Text>
            {item.time ? (
              <Text style={styles.resultTime}>{formatTime(item.time)}</Text>
            ) : null}
          </View>
          {item.snippet ? (
            <Text style={styles.resultSnippet} numberOfLines={2}>
              {item.snippet}
            </Text>
          ) : null}
          {item.type === 'message' ? (
            <View style={styles.resultTag}>
              <Ionicons name="chatbubble-outline" size={11} color={theme.colors.primary} />
              <Text style={styles.resultTagText}>Message</Text>
            </View>
          ) : (
            <View style={styles.resultTag}>
              <Ionicons name="people-outline" size={11} color={theme.colors.accent} />
              <Text style={[styles.resultTagText, { color: theme.colors.accent }]}>Conversation</Text>
            </View>
          )}
        </View>
      </Pressable>
    ),
    [openResult, styles, theme.colors.accent, theme.colors.primary]
  );

  const keyExtractor = useCallback(
    (item, index) => `${item.chatId}_${item.messageId || index}`,
    []
  );

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Recherche globale</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Chercher dans toutes les conversations…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoFocus
        />
        {query.length > 0 ? (
          <Pressable onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        style={[styles.searchBtn, query.length < 2 && styles.searchBtnDisabled]}
        onPress={handleSearch}
        disabled={query.length < 2}
      >
        <Text style={styles.searchBtnText}>Rechercher</Text>
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>Aucun résultat</Text>
          <Text style={styles.emptySubtext}>Essayez un autre mot-clé.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    heading: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 50,
      marginBottom: 10,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    searchBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginBottom: 18,
    },
    searchBtnDisabled: {
      opacity: 0.45,
    },
    searchBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    emptyText: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    emptySubtext: {
      color: theme.colors.textMuted,
    },
    list: {
      paddingBottom: 40,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    resultBody: {
      flex: 1,
      gap: 3,
    },
    resultTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultTitle: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 15,
      flex: 1,
    },
    resultTime: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    resultSnippet: {
      color: theme.colors.textSoft,
      fontSize: 13,
      lineHeight: 18,
    },
    resultTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    resultTagText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: '700',
    },
  });
