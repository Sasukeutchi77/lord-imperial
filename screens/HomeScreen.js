import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ChatListItem from '../components/ChatListItem';
import { subscribeToChats } from '../services/chat';
import { subscribeToStories, groupStoriesByAuthor } from '../services/stories';
import { subscribeToNetworkStatus } from '../services/network';
import { getNotificationPermissionStatus, registerForPushNotifications } from '../services/notifications';
import { getMemoryChats } from '../services/offlineStore';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const matchesConversation = (chat, currentUser, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const otherUid = (chat.members || []).find((uid) => uid !== currentUser.uid);
  const otherMember = otherUid ? chat.memberDetails?.[otherUid] : null;
  const haystack = [
    chat.title,
    chat.description,
    chat.lastMessage,
    otherMember?.displayName,
    otherMember?.username,
    otherMember?.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
};

const getModeConfig = (mode) => {
  switch (mode) {
    case 'groups':
      return {
        title: 'Groupes',
        subtitle: 'Vos conversations de groupe',
        icon: 'people',
        filterType: 'group',
        searchPlaceholder: 'Rechercher un groupe',
        emptyIcon: 'people-outline',
        emptyTitle: 'Aucun groupe',
        emptySubtitle: 'Cr\u00e9ez un groupe pour commencer vos \u00e9changes collectifs.',
        fabIcon: 'people',
        fabNav: 'Group',
        showCreateFab: true,
      };
    case 'channels':
      return {
        title: 'Cha\u00eenes',
        subtitle: 'Vos cha\u00eenes de diffusion',
        icon: 'megaphone',
        filterType: 'channel',
        searchPlaceholder: 'Rechercher une cha\u00eene',
        emptyIcon: 'megaphone-outline',
        emptyTitle: 'Aucune cha\u00eene',
        emptySubtitle: 'Cr\u00e9ez une cha\u00eene pour diffuser vos annonces.',
        fabIcon: 'megaphone',
        fabNav: 'Channel',
        showCreateFab: true,
      };
    case 'contacts':
    default:
      return {
        title: 'Contact',
        subtitle: 'Messages priv\u00e9s entre deux personnes',
        icon: 'person',
        filterType: 'private',
        searchPlaceholder: 'Rechercher un DM',
        emptyIcon: 'person-outline',
        emptyTitle: 'Aucun contact',
        emptySubtitle: 'Trouvez un utilisateur pour d\u00e9marrer un message priv\u00e9.',
        fabIcon: 'person-add',
        fabNav: 'SearchUsers',
        showCreateFab: true,
      };
  }
};

export default function HomeScreen({ navigation, mode = 'groups' }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();
  const [chats, setChats] = useState(() => getMemoryChats(profile.uid));
  const [loading, setLoading] = useState(() => getMemoryChats(profile.uid).length === 0);
  const [online, setOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationState, setNotificationState] = useState({ granted: false, canAskAgain: true, status: 'undetermined' });
  const [requestingNotifications, setRequestingNotifications] = useState(false);

  const config = useMemo(() => getModeConfig(mode), [mode]);

  useEffect(() => {
    const unsubscribeChats = subscribeToChats(profile.uid, (items) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setChats(items);
      setLoading(false);
    });
    const unsubscribeNetwork = subscribeToNetworkStatus((isConnected) => setOnline(isConnected));

    return () => {
      unsubscribeChats();
      unsubscribeNetwork();
    };
  }, [profile.uid]);

  useEffect(() => {
    if (mode !== 'contacts') return undefined;
    const unsub = subscribeToStories((stories) => {
      const mine = stories.filter((s) => s.authorId === profile.uid || true);
      setStoryGroups(groupStoriesByAuthor(mine));
    });
    return () => unsub?.();
  }, [mode, profile.uid]);

  useEffect(() => {
    let active = true;

    getNotificationPermissionStatus()
      .then((status) => {
        if (active) {
          setNotificationState(status);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const sourceChats = useMemo(
    () => chats.filter((chat) => chat.type === config.filterType),
    [chats, config.filterType]
  );

  const itemCount = sourceChats.length;

  const filteredChats = useMemo(
    () => sourceChats.filter((chat) => matchesConversation(chat, profile, searchQuery)),
    [sourceChats, profile, searchQuery]
  );

  const openChat = useCallback(
    (item) => {
      navigation.navigate('Chat', {
        chatId: item.id,
        initialTitle: item.title || null,
      });
    },
    [navigation]
  );

  const handleEnableNotifications = useCallback(async () => {
    try {
      setRequestingNotifications(true);
      const token = await registerForPushNotifications(profile.uid);
      const refreshedStatus = await getNotificationPermissionStatus();
      setNotificationState(refreshedStatus);

      if (!token) {
        Alert.alert(
          'Notifications non activ\u00e9es',
          refreshedStatus.canAskAgain
            ? 'Autorisez les notifications pour recevoir les nouveaux messages m\u00eame lorsque l\u2019application est ferm\u00e9e.'
            : 'Les notifications sont d\u00e9sactiv\u00e9es au niveau du syst\u00e8me. Activez-les dans les r\u00e9glages de votre appareil.'
        );
        return;
      }

      Alert.alert('Notifications activ\u00e9es', 'Les nouveaux messages ouvriront d\u00e9sormais directement la bonne conversation.');
    } catch (error) {
      Alert.alert('Activation impossible', error.message || 'Impossible d\u2019activer les notifications pour le moment.');
    } finally {
      setRequestingNotifications(false);
    }
  }, [profile.uid]);

  const renderChatItem = useCallback(
    ({ item }) => (
      <ChatListItem
        chat={item}
        currentUser={profile}
        online={online}
        onPress={() => openChat(item)}
      />
    ),
    [online, openChat, profile]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name={searchQuery ? 'search-outline' : config.emptyIcon} size={36} color={theme.colors.textMuted} />
        <Text style={styles.emptyTitle}>{searchQuery ? 'Aucun r\u00e9sultat' : config.emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? 'Essayez un autre mot-cl\u00e9 pour retrouver une conversation.'
            : config.emptySubtitle}
        </Text>
      </View>
    ),
    [searchQuery, styles, theme.colors.textMuted, config]
  );

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, index) => (
        <View key={`skeleton_${index}`} style={styles.skeletonRow}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonBody}>
            <View style={[styles.skeletonLine, { width: '60%' }]} />
            <View style={[styles.skeletonLine, { width: '82%' }]} />
          </View>
        </View>
      )),
    [styles]
  );

  const showNotificationBanner = !notificationState.granted && mode !== 'contacts';

  const [storyGroups, setStoryGroups] = useState([]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.telegramIcon}>
            <Ionicons name={config.icon} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.headerSub}>{config.subtitle}</Text>
          </View>
        </View>
        <View style={[styles.onlinePill, !online && styles.offlinePill]}>
          <View style={[styles.dot, !online && styles.offlineDot]} />
          <Text style={[styles.onlineText, !online && styles.offlineText]}>{online ? 'En ligne' : 'Hors ligne'}</Text>
        </View>
      </View>

      {!online ? (
        <View style={styles.banner}>
          <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.danger} />
          <Text style={styles.bannerText}>Aucune connexion Internet. La consultation reste possible, mais l'envoi est bloqu\u00e9.</Text>
        </View>
      ) : null}

      {showNotificationBanner ? (
        <View style={styles.notificationBanner}>
          <View style={styles.notificationCopy}>
            <Ionicons name="notifications-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.notificationText}>Activez les notifications pour recevoir les nouveaux messages.</Text>
          </View>
          <Pressable onPress={handleEnableNotifications} style={styles.notificationAction} disabled={requestingNotifications}>
            {requestingNotifications ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.notificationActionText}>Activer</Text>}
          </Pressable>
        </View>
      ) : null}

      {mode === 'contacts' && storyGroups.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesStrip}
          contentContainerStyle={styles.storiesContent}
        >
          {storyGroups.map((group) => {
            const hasUnseen = group.stories.some((s) => !s.seenBy?.[profile.uid]);
            const avatar = group.authorAvatar || null;
            const initials = (group.authorName || '?').charAt(0).toUpperCase();
            return (
              <Pressable
                key={group.authorId}
                style={styles.storyBubble}
                onPress={() => navigation.navigate('Stories', { authorId: group.authorId })}
              >
                <View style={[styles.storyRing, hasUnseen && styles.storyRingUnseen]}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.storyAvatar} />
                  ) : (
                    <View style={styles.storyAvatarPlaceholder}>
                      <Text style={styles.storyInitials}>{initials}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storyName} numberOfLines={1}>{group.authorName || '…'}</Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.storyBubble} onPress={() => navigation.navigate('Stories', { mode: 'add' })}>
            <View style={[styles.storyRing, styles.storyRingAdd]}>
              <View style={styles.storyAvatarPlaceholder}>
                <Ionicons name="add" size={22} color={theme.colors.primary} />
              </View>
            </View>
            <Text style={styles.storyName}>Mon statut</Text>
          </Pressable>
        </ScrollView>
      ) : null}

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={19} color={theme.colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={config.searchPlaceholder}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close" size={16} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.countRow}>
        <View style={styles.countChip}>
          <Ionicons name={config.icon} size={14} color={theme.colors.primary} />
          <Text style={styles.countText}>{itemCount} {config.title.toLowerCase()}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <View style={styles.skeletonList}>{skeletons}</View>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={keyExtractor}
          renderItem={renderChatItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={emptyComponent}
        />
      )}

      {config.showCreateFab ? (
        <Pressable style={styles.messageFab} onPress={() => navigation.navigate(config.fabNav)}>
          <Ionicons name={mode === 'contacts' ? 'person-add' : 'add'} size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    storiesStrip: {
      marginBottom: 10,
    },
    storiesContent: {
      paddingHorizontal: 12,
      gap: 14,
    },
    storyBubble: {
      alignItems: 'center',
      width: 68,
      gap: 5,
    },
    storyRing: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    storyRingUnseen: {
      borderColor: theme.colors.primary,
    },
    storyRingAdd: {
      borderColor: theme.colors.surfaceMuted,
      borderStyle: 'dashed',
    },
    storyAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    storyAvatarPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    storyInitials: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
    storyName: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
      maxWidth: 66,
    },
    header: {
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
    },
    brandRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },
    telegramIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    headerCopy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      color: theme.colors.text,
      fontSize: 29,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    headerSub: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 1,
    },
    onlinePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    offlinePill: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    dot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: theme.colors.success,
    },
    offlineDot: {
      backgroundColor: theme.colors.textMuted,
    },
    onlineText: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 12,
    },
    offlineText: {
      color: theme.colors.textMuted,
    },
    banner: {
      borderRadius: theme.radius.md,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    bannerText: {
      color: theme.colors.text,
      flex: 1,
      lineHeight: 20,
    },
    notificationBanner: {
      borderRadius: theme.radius.lg,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 10,
      marginBottom: 12,
    },
    notificationCopy: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },
    notificationText: {
      color: theme.colors.textSoft,
      flex: 1,
      lineHeight: 19,
      fontSize: 13,
      fontWeight: '600',
    },
    notificationAction: {
      alignSelf: 'flex-start',
      minWidth: 92,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationActionText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 13,
    },
    searchWrap: {
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.surfaceAlt,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 18,
      marginBottom: 14,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
      paddingVertical: 4,
    },
    clearButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    countChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(201,149,107,0.12)',
    },
    countText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    loadingWrap: {
      flex: 1,
      gap: 14,
      paddingTop: 8,
    },
    skeletonList: {
      gap: 14,
    },
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 9,
    },
    skeletonAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.skeleton,
    },
    skeletonBody: {
      flex: 1,
      gap: 10,
    },
    skeletonLine: {
      height: 11,
      borderRadius: 999,
      backgroundColor: theme.colors.skeleton,
    },
    listContent: {
      paddingBottom: 128,
      flexGrow: 1,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 78,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      color: theme.colors.text,
      marginTop: 14,
      fontWeight: '800',
      fontSize: 18,
    },
    emptySubtitle: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: 10,
    },
    messageFab: {
      position: 'absolute',
      right: 24,
      bottom: 60,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.26,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
  });
