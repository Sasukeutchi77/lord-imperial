import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import ScreenContainer from '../components/ScreenContainer';
import ChatBubble from '../components/ChatBubble';
import ChatInputBar from '../components/ChatInputBar';
import Avatar from '../components/Avatar';
import MessageActionSheet from '../components/MessageActionSheet';
import FullscreenImageViewer from '../components/FullscreenImageViewer';
import { db } from '../services/firebase';
import {
  deleteMessage,
  leaveChat,
  loadOlderMessages,
  markMessagesAsDelivered,
  markMessagesAsSeen,
  pinConversationMessage,
  retryFailedMessage,
  searchMessagesInConversation,
  sendImageMessage,
  sendPollMessage,
  sendStickerMessage,
  sendTextMessage,
  sendVideoMessage,
  setDisappearingMessages,
  subscribeToChatMeta,
  subscribeToMessages,
  toggleMessageReaction,
  unpinConversationMessage,
  updateTypingState,
  uploadVoiceMessage,
  voteInPoll,
} from '../services/chat';
import { getMemoryMessages } from '../services/offlineStore';
import { subscribeToNetworkStatus } from '../services/network';
import { pickChatVideoFromLibrary } from '../services/imagePicker';
import { useAuth } from '../context/AuthContext';
import { buildReplyReference, formatLastSeen, isChatAdmin } from '../utils/helpers';
import { useAppTheme } from '../utils/theme';
import { updateActiveChatId } from '../services/auth';
import { createAndStoreSticker } from '../services/stickers';

const STALE_TYPING_MS = 8000;
const DELIVERY_WINDOW_SIZE = 20;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getMessageKey = (message) => message?.id || message?.clientId || null;

export default function ChatScreen({ navigation, route }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { chatId, initialTitle } = route.params;
  const { profile } = useAuth();
  const [chat, setChat] = useState(null);
  // Initialize synchronously from in-memory cache — skips skeleton if messages are already loaded
  const [messages, setMessages] = useState(() => getMemoryMessages(chatId));
  const [otherProfile, setOtherProfile] = useState(null);
  const [loading, setLoading] = useState(() => getMemoryMessages(chatId).length === 0);
  const [busy, setBusy] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [online, setOnline] = useState(true);
  const [uploadState, setUploadState] = useState({ active: false, progress: 0, label: '' });
  const [nowMs, setNowMs] = useState(Date.now());
  const [replyTarget, setReplyTarget] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewerImageUri, setViewerImageUri] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [searchScopeNotice, setSearchScopeNotice] = useState('');
  const listRef = useRef(null);
  const autoScrollRef = useRef(true);
  const latestMessagesRef = useRef([]);

  useEffect(() => {
    const unsubscribeChat = subscribeToChatMeta(chatId, setChat);
    const unsubscribeMessages = subscribeToMessages(chatId, ({ messages: nextMessages, cursor: nextCursor }) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(nextMessages);
      latestMessagesRef.current = nextMessages;
      setCursor(nextCursor);
      setHasMore(Boolean(nextCursor));
      setLoading(false);
    });
    const unsubscribeNetwork = subscribeToNetworkStatus((isConnected) => setOnline(isConnected));

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
      unsubscribeNetwork();
    };
  }, [chatId]);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chat || chat.type !== 'private') {
      setOtherProfile(null);
      return undefined;
    }

    const otherUid = (chat.members || []).find((uid) => uid !== profile.uid);
    if (!otherUid) {
      setOtherProfile(null);
      return undefined;
    }

    return onSnapshot(doc(db, 'users', otherUid), (snapshot) => {
      const user = snapshot.exists() ? snapshot.data() : null;
      setOtherProfile({
        ...(chat.memberDetails?.[otherUid] || {}),
        ...(user || {}),
      });
    });
  }, [chat, profile.uid]);

  useEffect(() => {
    if (!messages.length || !autoScrollRef.current) return;

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  const recentMessages = useMemo(() => messages.slice(-DELIVERY_WINDOW_SIZE), [messages]);

  useEffect(() => {
    if (!profile?.uid || !recentMessages.length || !online) return undefined;

    markMessagesAsDelivered({ chatId, userId: profile.uid, messages: recentMessages }).catch(() => {});
    return undefined;
  }, [chatId, online, profile?.uid, recentMessages]);

  useFocusEffect(
    useCallback(() => {
      if (!profile?.uid) return () => {};

      updateActiveChatId(profile.uid, chatId).catch(() => {});

      const syncReadState = () => {
        const visibleMessages = latestMessagesRef.current.slice(-DELIVERY_WINDOW_SIZE);
        markMessagesAsSeen({ chatId, userId: profile.uid, messages: visibleMessages }).catch(() => {});
      };

      if (online) {
        syncReadState();
      }

      return () => {
        updateTypingState({ chatId, userId: profile.uid, isTyping: false }).catch(() => {});
        updateActiveChatId(profile.uid, null).catch(() => {});
      };
    }, [chatId, online, profile?.uid])
  );

  const headerTitle = useMemo(() => {
    if (!chat) return initialTitle || 'Conversation';
    if (chat.type === 'private') {
      return otherProfile?.displayName || otherProfile?.username || otherProfile?.email || initialTitle || 'Conversation';
    }
    return chat.title || initialTitle || 'Conversation';
  }, [chat, otherProfile, initialTitle]);

  const admin = isChatAdmin(chat, profile.uid);
  const canLeaveChat = Boolean(chat && chat.type !== 'private');
  const isMember = Boolean(chat?.members?.includes(profile.uid));
  const canPost = isMember && (chat?.permissions?.sendMessages !== 'admins' || admin);
  const composerDisabled = !canPost || busy || !online || !isMember || uploadState.active;

  const disabledReason = useMemo(() => {
    if (!isMember) return 'Vous ne faites plus partie de cette conversation';
    if (!online) return 'Aucune connexion Internet';
    if (chat?.type === 'channel' && !admin) return 'Canal en lecture seule';
    if (!canPost) return 'Vous ne pouvez pas publier ici';
    return '';
  }, [admin, canPost, chat?.type, isMember, online]);

  const pendingMineCount = useMemo(
    () => messages.filter((item) => item.senderId === profile.uid && item.status === 'sending').length,
    [messages, profile.uid]
  );
  const failedMineCount = useMemo(
    () => messages.filter((item) => item.senderId === profile.uid && item.status === 'failed').length,
    [messages, profile.uid]
  );

  const activeTypingUsers = useMemo(() => {
    const members = chat?.memberDetails || {};
    const entries = Object.entries(chat?.typingState || {}).filter(
      ([uid, value]) => uid !== profile.uid && nowMs - Number(value || 0) < STALE_TYPING_MS
    );
    return entries.map(([uid]) => members[uid]?.displayName || members[uid]?.username || members[uid]?.email || 'Quelqu’un');
  }, [chat?.memberDetails, chat?.typingState, nowMs, profile.uid]);

  const subtitle =
    chat?.type === 'private'
      ? formatLastSeen(otherProfile?.lastSeen, otherProfile?.isOnline)
      : chat?.type === 'channel'
        ? `Canal • ${chat?.members?.length || 0} abonnés • ${chat?.admins?.length || 1} admin`
        : `${chat?.members?.length || 0} membres • ${chat?.admins?.length || 1} admin`;

  const openUserProfile = useCallback(
    (userId, initialProfileData = null) => {
      if (!userId) return;
      navigation.navigate('UserProfile', {
        userId,
        initialProfile: initialProfileData,
      });
    },
    [navigation]
  );

  const scrollToMessageId = useCallback(
    (messageId) => {
      if (!messageId) return false;
      const index = latestMessagesRef.current.findIndex((item) => getMessageKey(item) === messageId);
      if (index < 0) {
        return false;
      }

      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      return true;
    },
    []
  );

  const openQuotedMessage = useCallback(
    (messageId) => {
      if (!messageId) return;
      const found = scrollToMessageId(messageId);
      if (!found) {
        Alert.alert('Message indisponible', 'Le message cité n’est pas chargé dans cette portion de l’historique. Utilisez la recherche pour le retrouver.');
      }
    },
    [scrollToMessageId]
  );

  const handleLeave = useCallback(async () => {
    if (!chat || !canLeaveChat) return;

    const confirmText =
      chat.ownerId === profile.uid
        ? 'Vous êtes propriétaire de cette conversation. En quittant, la propriété sera transférée automatiquement si un autre membre est disponible.'
        : 'Vous allez quitter cette conversation.';

    Alert.alert('Quitter la conversation', confirmText, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusy(true);
            const result = await leaveChat({ chatId, member: profile });
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            if (result?.ownershipTransferred) {
              Alert.alert('Transfert effectué', 'Vous avez quitté la conversation et la propriété a été transférée.');
            }
          } catch (error) {
            Alert.alert('Sortie impossible', error.message || 'Impossible de quitter cette conversation.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }, [canLeaveChat, chat, chatId, navigation, profile]);

  const toggleSearch = useCallback(() => {
    setSearchVisible((previous) => {
      if (previous) {
        setSearchQuery('');
        setSearchResults([]);
        setSearchIndex(0);
        setSearchScopeNotice('');
      }
      return !previous;
    });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle,
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={handleOpenGallery} style={styles.headerAction}>
            <Ionicons name="images-outline" size={20} color={theme.colors.text} />
          </Pressable>
          <Pressable onPress={toggleSearch} style={styles.headerAction}>
            <Ionicons name={searchVisible ? 'close-outline' : 'search-outline'} size={20} color={theme.colors.text} />
          </Pressable>
          {chat && chat.type !== 'private' && admin ? (
            <Pressable onPress={() => navigation.navigate('ManageMembers', { chatId })} style={styles.headerAction}>
              <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
            </Pressable>
          ) : null}
          {canLeaveChat ? (
            <Pressable onPress={handleLeave} style={styles.headerAction}>
              <Ionicons name="exit-outline" size={20} color={theme.colors.danger} />
            </Pressable>
          ) : null}
        </View>
      ),
    });
  }, [admin, canLeaveChat, chat, chatId, handleLeave, handleOpenGallery, headerTitle, navigation, searchVisible, styles.headerAction, styles.headerActions, theme.colors.danger, theme.colors.text, toggleSearch]);

  const performSearch = useCallback(
    async (term) => {
      const normalized = String(term || '').trim();
      if (!normalized) {
        setSearchBusy(false);
        setSearchResults([]);
        setSearchIndex(0);
        setSearchScopeNotice('');
        return;
      }

      try {
        setSearchBusy(true);
        const result = await searchMessagesInConversation({ chatId, keyword: normalized });
        setMessages(result.allMessages);
        latestMessagesRef.current = result.allMessages;
        setSearchResults(result.results);
        setSearchIndex(0);
        setSearchScopeNotice(result.fromCache ? 'Recherche locale sur les messages déjà chargés.' : 'Recherche sur l’historique complet de la conversation.');
      } catch (error) {
        const fallbackResults = latestMessagesRef.current.filter((message) => String(message?.text || '').toLowerCase().includes(normalized.toLowerCase()));
        setSearchResults(fallbackResults);
        setSearchIndex(0);
        setSearchScopeNotice('Recherche partielle : historique complet indisponible pour le moment.');
        Alert.alert('Recherche partielle', error.message || 'Impossible de charger tout l’historique.');
      } finally {
        setSearchBusy(false);
      }
    },
    [chatId]
  );

  useEffect(() => {
    if (!searchVisible) return undefined;

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 280);

    return () => clearTimeout(timer);
  }, [performSearch, searchQuery, searchVisible]);

  const activeSearchResult = searchResults[searchIndex] || null;
  const activeSearchResultId = getMessageKey(activeSearchResult);

  useEffect(() => {
    if (!activeSearchResultId) return;

    const timer = setTimeout(() => {
      scrollToMessageId(activeSearchResultId);
    }, 80);

    return () => clearTimeout(timer);
  }, [activeSearchResultId, scrollToMessageId]);

  const jumpToSearchResult = useCallback(
    (direction) => {
      if (!searchResults.length) return;
      setSearchIndex((previous) => {
        const next = direction === 'previous' ? previous - 1 : previous + 1;
        if (next < 0) return searchResults.length - 1;
        if (next >= searchResults.length) return 0;
        return next;
      });
    },
    [searchResults.length]
  );

  const handleTextSend = useCallback(
    async (text, options = {}) => {
      try {
        await sendTextMessage({ chatId, sender: profile, text, replyTo: options.replyTo || null });
        setReplyTarget(null);
      } catch (error) {
        Alert.alert('Envoi impossible', error.message || 'Le message n’a pas pu partir.');
      }
    },
    [chatId, profile]
  );

  const handlePollSend = useCallback(
    async ({ question, options, replyTo = null }) => {
      try {
        await sendPollMessage({ chatId, sender: profile, question, options, replyTo: replyTo || null });
        setReplyTarget(null);
      } catch (error) {
        Alert.alert('Sondage impossible', error.message || 'Le sondage n’a pas pu être envoyé.');
        throw error;
      }
    },
    [chatId, profile]
  );

  const handleVotePoll = useCallback(
    async (message, optionId) => {
      try {
        await voteInPoll({ chatId, messageId: message.id, user: profile, optionId });
      } catch (error) {
        Alert.alert('Vote impossible', error.message || 'Votre vote n’a pas pu être enregistré.');
      }
    },
    [chatId, profile]
  );

  const handleVoiceSend = useCallback(
    async (uri, durationMillis, options = {}) => {
      try {
        setUploadState({ active: true, progress: 0, label: 'Envoi du message vocal' });
        await uploadVoiceMessage({
          chatId,
          sender: profile,
          uri,
          durationMillis,
          replyTo: options.replyTo || null,
          onProgress: (progress) => setUploadState({ active: true, progress, label: 'Envoi du message vocal' }),
        });
        setReplyTarget(null);
      } catch (error) {
        Alert.alert('Vocal impossible', error.message || 'Le vocal n’a pas pu être envoyé.');
      } finally {
        setUploadState({ active: false, progress: 0, label: '' });
      }
    },
    [chatId, profile]
  );

  const handleImageSend = useCallback(
    async (uri, options = {}) => {
      try {
        setUploadState({ active: true, progress: 0, label: 'Envoi de l’image' });
        await sendImageMessage({
          chatId,
          sender: profile,
          uri,
          replyTo: options.replyTo || null,
          onProgress: (progress) => setUploadState({ active: true, progress, label: 'Envoi de l’image' }),
        });
        setReplyTarget(null);
      } catch (error) {
        Alert.alert('Image impossible', error.message || 'L’image n’a pas pu être envoyée.');
      } finally {
        setUploadState({ active: false, progress: 0, label: '' });
      }
    },
    [chatId, profile]
  );

  const handleCreateSticker = useCallback(
    async ({ asset, name, sendToChat = false, replyTo = null }) => {
      try {
        setUploadState({ active: true, progress: 0, label: sendToChat ? 'Création et envoi du sticker' : 'Création du sticker' });
        const sticker = await createAndStoreSticker({
          userId: profile.uid,
          asset,
          name,
          onProgress: (progress) =>
            setUploadState({
              active: true,
              progress,
              label: sendToChat ? 'Création et envoi du sticker' : 'Création du sticker',
            }),
        });

        if (sendToChat) {
          await sendStickerMessage({
            chatId,
            sender: profile,
            sticker,
            replyTo: replyTo || null,
          });
          setReplyTarget(null);
        }

        return sticker;
      } finally {
        setUploadState({ active: false, progress: 0, label: '' });
      }
    },
    [chatId, profile]
  );

  const handleStickerSend = useCallback(
    async (sticker, options = {}) => {
      try {
        setUploadState({ active: true, progress: 0, label: 'Envoi du sticker' });
        await sendStickerMessage({
          chatId,
          sender: profile,
          sticker,
          replyTo: options.replyTo || null,
        });
        setReplyTarget(null);
      } finally {
        setUploadState({ active: false, progress: 0, label: '' });
      }
    },
    [chatId, profile]
  );

  const handleRetry = useCallback(
    async (message) => {
      try {
        setBusy(true);
        await retryFailedMessage({ chatId, clientId: message.clientId || message.id });
      } catch (error) {
        Alert.alert('Relance impossible', error.message || 'Le message n’a pas pu être relancé.');
      } finally {
        setBusy(false);
      }
    },
    [chatId]
  );

  const confirmDeleteMessage = useCallback(
    (message) => {
      const authorLabel = message.senderId === profile.uid ? 'ce message' : 'le message sélectionné';

      Alert.alert('Supprimer le message', `Voulez-vous supprimer ${authorLabel} pour tous les membres ?`, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              await deleteMessage({ chatId, messageId: message.id, actor: profile });
            } catch (error) {
              Alert.alert('Suppression impossible', error.message || 'Le message n’a pas pu être supprimé.');
            } finally {
              setBusy(false);
              setSelectedMessage(null);
            }
          },
        },
      ]);
    },
    [chatId, profile]
  );

  const handleTogglePin = useCallback(
    async (message) => {
      if (!message) return;
      try {
        setBusy(true);
        const isPinned = chat?.pinnedMessage?.messageId === message.id;
        if (isPinned) {
          await unpinConversationMessage({ chatId, actor: profile });
        } else {
          await pinConversationMessage({ chatId, messageId: message.id, actor: profile });
        }
        setSelectedMessage(null);
      } catch (error) {
        Alert.alert('Épinglage impossible', error.message || 'Impossible de modifier le message épinglé.');
      } finally {
        setBusy(false);
      }
    },
    [chat?.pinnedMessage?.messageId, chatId, profile]
  );

  const handleVideoSend = useCallback(
    async (uri, mimeType = 'video/mp4', options = {}) => {
      try {
        setUploadState({ active: true, progress: 0, label: 'Vidéo…' });
        await sendVideoMessage({
          chatId,
          sender: profile,
          localUri: uri,
          mimeType,
          replyTo: options.replyTo || null,
        });
        setReplyTarget(null);
      } catch (error) {
        Alert.alert('Envoi impossible', error.message || 'La vidéo n\'a pas pu être envoyée.');
      } finally {
        setUploadState({ active: false, progress: 0, label: '' });
      }
    },
    [chatId, profile]
  );

  const handleOpenGallery = useCallback(() => {
    navigation.navigate('Gallery', { chatId });
  }, [chatId, navigation]);

  const handleTypingChange = useCallback(
    (isTyping) => {
      updateTypingState({ chatId, userId: profile.uid, isTyping }).catch(() => {});
    },
    [chatId, profile.uid]
  );

  const handleLoadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore || !cursor) return;

    try {
      setLoadingOlder(true);
      const result = await loadOlderMessages({ chatId, cursor });
      setMessages(result.messages);
      latestMessagesRef.current = result.messages;
      setCursor(result.cursor);
      setHasMore(result.hasMore);
    } catch (error) {
      Alert.alert('Historique indisponible', error.message || 'Impossible de charger les messages plus anciens.');
    } finally {
      setLoadingOlder(false);
    }
  }, [chatId, cursor, hasMore, loadingOlder]);

  const handleListScroll = useCallback(
    (event) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      autoScrollRef.current = contentOffset.y + layoutMeasurement.height >= contentSize.height - 120;
      if (contentOffset.y <= 80 && online) {
        handleLoadOlder();
      }
    },
    [handleLoadOlder, online]
  );

  const handleOpenActions = useCallback((message) => setSelectedMessage(message), []);

  const handleReplySelect = useCallback((message) => {
    setReplyTarget(buildReplyReference(message));
    setSelectedMessage(null);
  }, []);

  const handleToggleReaction = useCallback(
    async (message, emoji) => {
      try {
        await toggleMessageReaction({ chatId, messageId: message.id, user: profile, emoji });
        setSelectedMessage(null);
      } catch (error) {
        Alert.alert('Réaction impossible', error.message || 'Impossible d’ajouter cette réaction.');
      }
    },
    [chatId, profile]
  );

  const keyExtractor = useCallback((item) => item.id || item.clientId, []);

  const renderMessageItem = useCallback(
    ({ item, index }) => {
      const previousMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
      const senderProfile = item.senderSnapshot || chat?.memberDetails?.[item.senderId] || null;
      const senderLabel =
        item.senderId !== profile.uid && chat?.type !== 'private'
          ? senderProfile?.displayName || senderProfile?.username || senderProfile?.email || 'Membre'
          : '';

      return (
        <ChatBubble
          message={item}
          previousMessage={previousMessage}
          nextMessage={nextMessage}
          senderLabel={senderLabel}
          senderAvatar={senderProfile?.avatar || null}
          isMine={item.senderId === profile.uid}
          highlighted={activeSearchResultId === getMessageKey(item)}
          canDelete={item.type !== 'system' && item.type !== 'deleted' && (item.senderId === profile.uid || admin)}
          onLongPress={() => handleOpenActions(item)}
          onRetry={handleRetry}
          onSwipeReply={() => handleReplySelect(item)}
          onPressImage={(uri) => setViewerImageUri(uri)}
          onPressQuotedMessage={openQuotedMessage}
          onPressReaction={(emoji) => handleToggleReaction(item, emoji)}
          onVotePoll={handleVotePoll}
          onPressSender={() => openUserProfile(item.senderId, senderProfile)}
          currentUserId={profile.uid}
        />
      );
    },
    [activeSearchResultId, admin, chat?.memberDetails, chat?.type, handleOpenActions, handleReplySelect, handleRetry, handleToggleReaction, handleVotePoll, messages, openQuotedMessage, openUserProfile, profile.uid]
  );

  const emptyComponent = useMemo(() => <Text style={styles.emptyText}>Aucun message pour l’instant.</Text>, [styles.emptyText]);

  const loadingOlderComponent = useMemo(
    () => (loadingOlder ? <ActivityIndicator style={styles.loadingOlder} color={theme.colors.accent} /> : null),
    [loadingOlder, styles.loadingOlder, theme.colors.accent]
  );

  const skeletons = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => (
        <View key={`chat_skeleton_${index}`} style={[styles.skeletonBubble, index % 2 ? styles.skeletonMine : styles.skeletonTheirs]} />
      )),
    [styles]
  );

  const canOpenHeaderProfile = chat?.type === 'private' && otherProfile?.uid;
  const selectedCanDelete = Boolean(
    selectedMessage && selectedMessage.type !== 'system' && selectedMessage.type !== 'deleted' && (selectedMessage.senderId === profile.uid || admin)
  );
  const selectedCanPin = Boolean(selectedMessage && chat?.type !== 'private' && admin && selectedMessage.type !== 'system' && selectedMessage.type !== 'deleted');
  const selectedIsPinned = Boolean(selectedMessage && chat?.pinnedMessage?.messageId === selectedMessage.id);
  const selectedProfile = selectedMessage?.senderSnapshot || chat?.memberDetails?.[selectedMessage?.senderId] || null;
  const canViewSelectedProfile = Boolean(selectedMessage?.senderId);

  if (loading && !chat) {
    return (
      <ScreenContainer>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <View style={styles.skeletonWrap}>{skeletons}</View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withKeyboard>
      <Pressable
        disabled={!canOpenHeaderProfile}
        onPress={() => openUserProfile(otherProfile?.uid, otherProfile)}
        style={styles.topMeta}
      >
        <Avatar
          uri={otherProfile?.avatar || chat?.avatar}
          label={headerTitle}
          size={56}
          showOnline={chat?.type === 'private' && otherProfile?.isOnline}
          onPress={canOpenHeaderProfile ? () => openUserProfile(otherProfile?.uid, otherProfile) : null}
          cardEffect={chat?.type === 'private' ? (otherProfile?.profileCard || null) : null}
        />
        <View style={styles.metaBody}>
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
          {activeTypingUsers.length ? <Text style={styles.typingText}>{activeTypingUsers.join(', ')} écrit…</Text> : null}
        </View>
        {canOpenHeaderProfile ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} /> : null}
      </Pressable>

      {searchVisible ? (
        <View style={styles.searchPanel}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher dans cette conversation"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
            {searchBusy ? <ActivityIndicator size="small" color={theme.colors.accent} /> : null}
          </View>
          <View style={styles.searchMetaRow}>
            <Text style={styles.searchMetaText}>
              {searchQuery.trim()
                ? searchResults.length
                  ? `${searchIndex + 1}/${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''}`
                  : 'Aucun résultat'
                : 'Tapez un mot-clé pour lancer la recherche'}
            </Text>
            <View style={styles.searchNavRow}>
              <Pressable onPress={() => jumpToSearchResult('previous')} style={styles.searchNavButton} disabled={!searchResults.length}>
                <Ionicons name="chevron-up" size={16} color={searchResults.length ? theme.colors.text : theme.colors.textMuted} />
              </Pressable>
              <Pressable onPress={() => jumpToSearchResult('next')} style={styles.searchNavButton} disabled={!searchResults.length}>
                <Ionicons name="chevron-down" size={16} color={searchResults.length ? theme.colors.text : theme.colors.textMuted} />
              </Pressable>
            </View>
          </View>
          {searchScopeNotice ? <Text style={styles.searchScopeText}>{searchScopeNotice}</Text> : null}
        </View>
      ) : null}

      {chat?.pinnedMessage ? (
        <View style={styles.pinBanner}>
          <Pressable style={styles.pinBannerMain} onPress={() => openQuotedMessage(chat?.pinnedMessage?.messageId)}>
            <View style={styles.pinIconWrap}>
              <Ionicons name="pin" size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.pinCopy}>
              <Text style={styles.pinLabel}>Message épinglé</Text>
              <Text style={styles.pinPreview} numberOfLines={2}>{chat.pinnedMessage.preview}</Text>
            </View>
          </Pressable>
          {admin ? (
            <Pressable style={styles.pinDismiss} onPress={() => unpinConversationMessage({ chatId, actor: profile }).catch((error) => Alert.alert('Action impossible', error.message || 'Impossible de retirer ce message épinglé.'))}>
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!online ? (
        <View style={styles.noticeCard}>
          <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.danger} />
          <Text style={styles.noticeText}>Aucune connexion Internet. L’envoi de messages est temporairement désactivé.</Text>
        </View>
      ) : null}

      {!isMember ? (
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.noticeText}>Vous ne faites plus partie de cette conversation. Retournez à l’accueil.</Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={16}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListEmptyComponent={emptyComponent}
        ListHeaderComponent={loadingOlderComponent}
        ListFooterComponent={<View style={styles.footerSpacer} />}
        onContentSizeChange={() => {
          if (autoScrollRef.current) {
            listRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onScroll={handleListScroll}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToOffset({ offset: Math.max(0, info.averageItemLength * info.index - 120), animated: true });
          }, 160);
        }}
        scrollEventThrottle={16}
      />

      {online && pendingMineCount ? (<View style={styles.syncBar}><ActivityIndicator size="small" color={theme.colors.accent} /><Text style={styles.syncText}>Envoi en cours… {pendingMineCount} message(s).</Text></View>) : null}
      {failedMineCount ? <Text style={styles.errorText}>{failedMineCount} message(s) ont échoué. Touchez “Réessayer”.</Text> : null}
      {chat?.type === 'channel' && !admin ? (<View style={styles.readOnlyBar}><Ionicons name="lock-closed-outline" size={13} color={theme.colors.textMuted} /><Text style={styles.readOnlyText}>Lecture seule</Text></View>) : null}
      <ChatInputBar
        onSend={handleTextSend}
        onSendVoice={handleVoiceSend}
        onSendImage={handleImageSend}
        onSendVideo={handleVideoSend}
        onSendPoll={handlePollSend}
        onCreateSticker={handleCreateSticker}
        onSendSticker={handleStickerSend}
        onTypingChange={handleTypingChange}
        disabled={composerDisabled}
        disabledReason={disabledReason}
        uploadingMedia={uploadState.active}
        uploadProgress={uploadState.progress}
        uploadLabel={uploadState.label}
        replyTo={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        stickerOwnerId={profile.uid}
      />

      <MessageActionSheet
        visible={Boolean(selectedMessage)}
        message={selectedMessage}
        canDelete={selectedCanDelete}
        canPin={selectedCanPin}
        isPinned={selectedIsPinned}
        onClose={() => setSelectedMessage(null)}
        onReply={() => handleReplySelect(selectedMessage)}
        onReact={(emoji) => handleToggleReaction(selectedMessage, emoji)}
        onTogglePin={() => handleTogglePin(selectedMessage)}
        onDelete={() => confirmDeleteMessage(selectedMessage)}
        onViewProfile={canViewSelectedProfile ? () => {
          setSelectedMessage(null);
          openUserProfile(selectedMessage?.senderId, selectedProfile);
        } : undefined}
      />

      <FullscreenImageViewer visible={Boolean(viewerImageUri)} imageUri={viewerImageUri} onClose={() => setViewerImageUri(null)} />
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    loadingWrap: {
      flex: 1,
      justifyContent: 'center',
      gap: 18,
    },
    skeletonWrap: {
      gap: 10,
    },
    skeletonBubble: {
      height: 58,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.skeleton,
      maxWidth: '74%',
    },
    skeletonMine: {
      alignSelf: 'flex-end',
      width: '62%',
    },
    skeletonTheirs: {
      alignSelf: 'flex-start',
      width: '74%',
    },
    loadingOlder: {
      marginBottom: 12,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerAction: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
    },
    topMeta: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'center',
      marginBottom: 16,
      padding: 14,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.soft,
    },
    metaBody: {
      flex: 1,
    },
    searchPanel: {
      marginBottom: 12,
      padding: 14,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
    },
    searchInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      paddingVertical: 10,
    },
    searchMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    searchMetaText: {
      flex: 1,
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    searchNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchNavButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchScopeText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    pinBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
    },
    pinBannerMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    pinIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(42,171,238,0.12)',
    },
    pinCopy: {
      flex: 1,
      minWidth: 0,
    },
    pinLabel: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '800',
    },
    pinPreview: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 2,
    },
    pinDismiss: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noticeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
    },
    noticeText: {
      color: theme.colors.text,
      flex: 1,
      lineHeight: 20,
    },
    title: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 18,
    },
    headerSubtitle: {
      color: theme.colors.accent,
      marginTop: 4,
      fontSize: 12,
      fontWeight: '700',
    },
    typingText: {
      color: theme.colors.textMuted,
      marginTop: 4,
      fontSize: 12,
      fontStyle: 'italic',
    },
    messages: {
      flexGrow: 1,
      paddingVertical: 8,
    },
    footerSpacer: {
      height: 4,
    },
    emptyText: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 32,
    },
    syncBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    syncText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    errorText: {
      color: theme.colors.danger,
      marginTop: 4,
      marginHorizontal: 12,
      fontSize: 12,
      fontWeight: '600',
    },
    readOnlyBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 5,
    },
    readOnlyText: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
  });
