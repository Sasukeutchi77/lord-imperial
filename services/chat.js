import {
  arrayUnion,
  collection,
  deleteField,
  doc,
  endAt,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadAudioToCloudinary, uploadImageToCloudinary, uploadVideoToCloudinary } from './cloudinary';
import {
  getMessagePreviewLabel,
  getMessageSearchText,
  getUserLabel,
  normalizeUsername,
  privateChatId,
  validateUsername,
} from '../utils/helpers';
import {
  getCachedChats,
  getCachedMessages,
  getMemoryChats,
  getMemoryMessages,
  mergeCachedChats,
  mergeCachedMessages,
  patchCachedMessage,
  saveCachedChats,
  saveCachedMessages,
} from './offlineStore';
import { compressImageBeforeUpload } from './media';
import { getLastKnownNetworkStatus, getNetworkStatus } from './network';
import { logger } from './logger';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';
const DEFAULT_PAGE_SIZE = 20;

const createClientId = () => {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  let cursor = Date.now();

  return template.replace(/[xy]/g, (character) => {
    const random = (cursor + Math.random() * 16) % 16 | 0;
    cursor = Math.floor(cursor / 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const getTimestampValue = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
  }

  const date = value instanceof Date ? value : new Date(value);
  const result = date.getTime();
  return Number.isNaN(result) ? 0 : result;
};

const sortMessagesChronologically = (messages = []) =>
  [...messages].sort((a, b) => {
    const timeA = a.createdAtMs || getTimestampValue(a.timestamp) || 0;
    const timeB = b.createdAtMs || getTimestampValue(b.timestamp) || 0;

    if (timeA === timeB) {
      return String(a.id || a.clientId || '').localeCompare(String(b.id || b.clientId || ''));
    }

    return timeA - timeB;
  });

const normalizePoll = (poll = null) => {
  if (!poll?.question) return null;

  const question = String(poll.question || '').trim();
  const options = Array.isArray(poll.options)
    ? poll.options
        .map((option, index) => ({
          id: String(option?.id || `poll_option_${index}`),
          text: String(option?.text || '').trim(),
          voterIds: Array.from(new Set(Array.isArray(option?.voterIds) ? option.voterIds.filter(Boolean) : [])),
        }))
        .filter((option) => option.text)
    : [];

  if (!question || options.length < 2) return null;

  return {
    question,
    options,
  };
};

const mergeDeliveryState = (previous = {}, next = {}) => ({
  deliveredTo: Array.from(new Set([...(previous.deliveredTo || []), ...(next.deliveredTo || [])])),
  seenBy: Array.from(new Set([...(previous.seenBy || []), ...(next.seenBy || [])])),
});

const mergeMessage = (previous = {}, next = {}) => {
  const previousIsRemote = previous.localOnly === false || previous.status === 'sent';
  const nextIsRemote = next.localOnly === false || next.status === 'sent';
  const preferNext = nextIsRemote || !previousIsRemote;
  const base = preferNext ? { ...previous, ...next } : { ...next, ...previous };

  return {
    ...base,
    id: next.id || previous.id || next.clientId || previous.clientId || null,
    clientId: next.clientId || previous.clientId || next.id || previous.id || null,
    status: next.status || previous.status || (nextIsRemote ? 'sent' : 'sending'),
    localOnly: nextIsRemote ? false : Boolean(base.localOnly),
    errorMessage: nextIsRemote ? null : next.errorMessage || previous.errorMessage || null,
    localUri: next.localUri || previous.localUri || null,
    audioUrl: next.audioUrl || previous.audioUrl || null,
    mediaUrl: next.mediaUrl || previous.mediaUrl || previous.audioUrl || next.audioUrl || null,
    replyTo: next.replyTo || previous.replyTo || null,
    sticker: next.sticker || previous.sticker || null,
    poll: normalizePoll(next.poll || previous.poll || null),
    reactions: next.reactions || previous.reactions || {},
    delivery: mergeDeliveryState(previous.delivery, next.delivery),
  };
};

const dedupeMessages = (messages = []) => {
  const merged = new Map();

  messages.filter(Boolean).forEach((message) => {
    const lookupKeys = [message.id, message.clientId].filter(Boolean);
    const existingKey = lookupKeys.find((candidateKey) => merged.has(candidateKey));
    const selectedKey = existingKey || message.clientId || message.id || `${message.senderId || 'unknown'}_${message.createdAtMs || 0}`;
    const next = mergeMessage(merged.get(selectedKey), message);

    merged.set(selectedKey, next);
    lookupKeys.forEach((candidateKey) => merged.set(candidateKey, next));
  });

  return sortMessagesChronologically(Array.from(new Set(Array.from(merged.values()))));
};

const buildMemberSnippet = (profile = {}) => ({
  uid: profile.uid,
  username: profile.username || null,
  displayName: profile.displayName || null,
  email: profile.email || null,
  avatar: profile.avatar || null,
  bio: profile.bio || '',
  isOnline: typeof profile.isOnline === 'boolean' ? profile.isOnline : false,
  lastSeen: profile.lastSeen || null,
});

const buildMessagePreview = (message) => {
  if (!message) {
    return {
      lastMessage: '',
      lastMessageType: 'text',
    };
  }

  switch (message.type) {
    case 'audio':
      return { lastMessage: '🎤 Message vocal', lastMessageType: 'audio' };
    case 'image':
      return { lastMessage: '🖼️ Image', lastMessageType: 'image' };
    case 'video':
      return { lastMessage: '🎬 Vidéo', lastMessageType: 'video' };
    case 'sticker':
      return { lastMessage: `🏷️ ${message.sticker?.name || message.text || 'Sticker'}`, lastMessageType: 'sticker' };
    case 'poll':
      return { lastMessage: `📊 ${message.poll?.question || 'Sondage'}`, lastMessageType: 'poll' };
    case 'system':
      return { lastMessage: message.text || 'Mise à jour du groupe', lastMessageType: 'system' };
    case 'deleted':
      return { lastMessage: 'Message supprimé', lastMessageType: 'deleted' };
    default:
      return { lastMessage: message.text || 'Conversation mise à jour', lastMessageType: 'text' };
  }
};

const buildConversationSummaryPatch = (message) => {
  const preview = buildMessagePreview(message);
  return {
    lastActivityAt: serverTimestamp(),
    lastActivityAtMs: message?.createdAtMs || Date.now(),
    lastMessage: preview.lastMessage,
    lastMessageType: preview.lastMessageType,
    lastMessageSenderId: message?.senderId || null,
  };
};

const hydrateConversation = (conversation) => ({
  ...conversation,
  lastActivityAtMs:
    conversation?.lastActivityAtMs || getTimestampValue(conversation?.lastActivityAt || conversation?.updatedAt || conversation?.createdAt),
});

const sortConversationsByActivity = (conversations = []) =>
  [...conversations].sort((a, b) => {
    const timeA = Number(a?.lastActivityAtMs || a?.updatedAtMs || a?.createdAtMs || 0);
    const timeB = Number(b?.lastActivityAtMs || b?.updatedAtMs || b?.createdAtMs || 0);

    if (timeA === timeB) {
      return String(a?.title || a?.id || '').localeCompare(String(b?.title || b?.id || ''));
    }

    return timeB - timeA;
  });

const toCachedConversation = (conversation, uid) => {
  const hydrated = hydrateConversation(conversation);
  const now = Date.now();
  const createdAtMs = hydrated.createdAtMs || now;
  const updatedAtMs = hydrated.updatedAtMs || createdAtMs;
  const lastActivityAtMs = hydrated.lastActivityAtMs || updatedAtMs;

  return {
    ...hydrated,
    createdAt: new Date(createdAtMs).toISOString(),
    updatedAt: new Date(updatedAtMs).toISOString(),
    lastActivityAt: new Date(lastActivityAtMs).toISOString(),
    createdAtMs,
    updatedAtMs,
    lastActivityAtMs,
    unreadCount: Number(hydrated?.unreadCountByUser?.[uid] || hydrated?.unreadCount || 0),
  };
};

const toCachedMessage = (message) => {
  const createdAtMs = message?.createdAtMs || Date.now();
  return {
    ...message,
    timestamp: new Date(createdAtMs).toISOString(),
    createdAtMs,
    status: 'sent',
    localOnly: false,
  };
};

const cacheConversationSnapshot = async ({ uid, conversation, messages = [] }) => {
  if (!uid || !conversation?.id) return null;

  const cachedConversation = toCachedConversation(conversation, uid);
  await mergeCachedChats(uid, [cachedConversation]);

  if (messages.length) {
    await mergeCachedMessages(conversation.id, messages.map(toCachedMessage));
  }

  return cachedConversation;
};

const patchCachedConversationSummary = async ({ uid, chatId, message }) => {
  if (!uid || !chatId || !message) return null;

  const cached = await getCachedChats(uid);
  const existing = cached.find((chat) => chat.id === chatId);
  if (!existing) return null;

  const preview = buildMessagePreview(message);
  const patched = {
    ...existing,
    lastActivityAt: new Date(message.createdAtMs || Date.now()).toISOString(),
    lastActivityAtMs: message.createdAtMs || Date.now(),
    updatedAt: new Date().toISOString(),
    updatedAtMs: Date.now(),
    lastMessage: preview.lastMessage,
    lastMessageType: preview.lastMessageType,
    lastMessageSenderId: message.senderId || null,
  };

  await mergeCachedChats(uid, [patched]);
  return patched;
};

const buildMemberDetails = (profiles = []) =>
  profiles.reduce((accumulator, profile) => {
    if (!profile?.uid) return accumulator;
    accumulator[profile.uid] = buildMemberSnippet(profile);
    return accumulator;
  }, {});

const buildPermissions = (type, permissions = {}) => ({
  sendMessages: permissions.sendMessages || (type === 'channel' ? 'admins' : 'members'),
  manageMembers: permissions.manageMembers || 'admins',
  manageRoles: permissions.manageRoles || 'admins',
  editInfo: permissions.editInfo || 'admins',
});

const buildUnreadCountByUser = (members = []) =>
  members.reduce((accumulator, item) => {
    accumulator[item.uid] = 0;
    return accumulator;
  }, {});

const buildUnreadStatePatch = (chat, senderId) =>
  (chat?.members || []).reduce(
    (accumulator, uid) => {
      accumulator[`unreadCountByUser.${uid}`] = uid === senderId ? 0 : increment(1);
      return accumulator;
    },
    {}
  );

const buildConversationBase = ({ id, type, title, description = '', avatar = null, owner, members, permissions = {} }) => ({
  id,
  type,
  title,
  description,
  members: Array.from(new Set(members.map((item) => item.uid))),
  admins: [owner.uid],
  ownerId: owner.uid,
  avatar,
  createdBy: owner.uid,
  memberRoles: members.reduce((accumulator, item) => {
    accumulator[item.uid] = item.uid === owner.uid ? 'owner' : 'member';
    return accumulator;
  }, {}),
  memberDetails: buildMemberDetails(members),
  permissions: buildPermissions(type, permissions),
  typingState: {},
  invite: null,
  pinnedMessage: null,
  unreadCountByUser: buildUnreadCountByUser(members),
  lastReadAt: {
    [owner.uid]: Date.now(),
  },
  createdAt: serverTimestamp(),
  createdAtMs: Date.now(),
  updatedAt: serverTimestamp(),
  updatedAtMs: Date.now(),
  lastActivityAt: serverTimestamp(),
  lastActivityAtMs: Date.now(),
});

const createRemoteMessagePayload = ({
  text = '',
  audioUrl = null,
  mediaUrl = null,
  sender,
  type = 'text',
  durationMillis = null,
  createdAtMs = Date.now(),
  clientId,
  replyTo = null,
  poll = null,
  sticker = null,
}) => ({
  clientId,
  text,
  audioUrl,
  mediaUrl,
  senderId: sender.uid,
  senderSnapshot: {
    uid: sender.uid,
    username: sender.username || null,
    displayName: sender.displayName || null,
    avatar: sender.avatar || null,
    email: sender.email || null,
  },
  timestamp: serverTimestamp(),
  createdAtMs,
  type,
  durationMillis,
  replyTo,
  sticker,
  poll: normalizePoll(poll),
  reactions: {},
  deletedAt: null,
  deletedBy: null,
  delivery: {
    deliveredTo: [sender.uid],
    seenBy: [sender.uid],
  },
});

const createLocalMessagePayload = ({
  text = '',
  sender,
  type = 'text',
  audioUrl = null,
  mediaUrl = null,
  localUri = null,
  durationMillis = null,
  createdAtMs = Date.now(),
  clientId = createClientId(),
  status = 'sending',
  replyTo = null,
  poll = null,
  sticker = null,
}) => ({
  id: clientId,
  clientId,
  text,
  audioUrl,
  mediaUrl,
  localUri,
  senderId: sender.uid,
  senderSnapshot: {
    uid: sender.uid,
    username: sender.username || null,
    displayName: sender.displayName || null,
    avatar: sender.avatar || null,
    email: sender.email || null,
  },
  timestamp: new Date(createdAtMs).toISOString(),
  createdAtMs,
  type,
  durationMillis,
  replyTo,
  sticker,
  poll: normalizePoll(poll),
  reactions: {},
  status,
  localOnly: true,
  deletedAt: null,
  deletedBy: null,
  delivery: {
    deliveredTo: [sender.uid],
    seenBy: [sender.uid],
  },
});

const ensureOnlineOrThrow = async () => {
  const isOnline = await getNetworkStatus();
  if (!isOnline) {
    throw new Error('Aucune connexion Internet. Réessayez dès que la connexion revient.');
  }
};

const getMessageRef = (chatId, clientId) => doc(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION, clientId);

const getConversationOrThrow = async (chatId) => {
  const snapshot = await getDoc(doc(db, CONVERSATIONS_COLLECTION, chatId));
  if (!snapshot.exists()) {
    throw new Error('Conversation introuvable.');
  }
  return hydrateConversation({ id: snapshot.id, ...snapshot.data() });
};

const getMessageOrThrow = async (chatId, messageId) => {
  const messageRef = doc(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION, messageId);
  const snapshot = await getDoc(messageRef);
  if (!snapshot.exists()) {
    throw new Error('Message introuvable.');
  }
  return {
    ref: messageRef,
    data: snapshot.data(),
  };
};

const isChatAdmin = (chat, uid) => chat?.admins?.includes(uid) || chat?.memberRoles?.[uid] === 'owner';
const canManageMembers = (chat, uid) => chat?.permissions?.manageMembers !== 'admins' || isChatAdmin(chat, uid);
const canManageRoles = (chat, uid) => chat?.permissions?.manageRoles !== 'admins' || isChatAdmin(chat, uid);
const canEditInfo = (chat, uid) => chat?.permissions?.editInfo !== 'admins' || isChatAdmin(chat, uid);

const assertCanPost = async (chatId, senderId) => {
  const chat = await getConversationOrThrow(chatId);

  if (!chat.members?.includes(senderId)) {
    throw new Error('Vous ne faites pas partie de cette conversation.');
  }

  const sendPolicy = chat.permissions?.sendMessages || (chat.type === 'channel' ? 'admins' : 'members');
  const admin = isChatAdmin(chat, senderId);

  if (sendPolicy === 'admins' && !admin) {
    throw new Error('Seuls les administrateurs peuvent publier dans cette conversation.');
  }

  return chat;
};

const assertCanEditConversation = async (chatId, actorId) => {
  const chat = await getConversationOrThrow(chatId);
  if (!canEditInfo(chat, actorId)) {
    throw new Error('Seuls les administrateurs peuvent modifier ces informations.');
  }
  return chat;
};

const uploadVoiceFile = async ({ chatId, senderId, clientId, uri, onProgress }) =>
  uploadAudioToCloudinary(uri, {
    onProgress,
    path: `voiceMessages/${chatId}/${senderId}_${clientId}`,
  });

const uploadImageFile = async ({ chatId, senderId, clientId, uri, onProgress }) => {
  const optimized = await compressImageBeforeUpload(uri, {
    maxWidth: 1440,
    quality: 0.74,
  });

  return uploadImageToCloudinary(optimized.uri, {
    onProgress,
    path: `chatImages/${chatId}/${senderId}_${clientId}`,
  });
};

const uploadVideoFile = async ({ chatId, senderId, clientId, uri, mimeType, onProgress }) =>
  uploadVideoToCloudinary(uri, {
    onProgress,
    mimeType: mimeType || 'video/mp4',
    path: `chatVideos/${chatId}/${senderId}_${clientId}`,
    timeout: 180000,
  });

export const uploadConversationAvatar = async ({ chatId, uri, onProgress }) => {
  if (!chatId || !uri) {
    throw new Error('Image de conversation introuvable.');
  }

  const optimized = await compressImageBeforeUpload(uri, {
    maxWidth: 1080,
    quality: 0.74,
  });

  return uploadImageToCloudinary(optimized.uri, {
    onProgress,
    path: `conversationPhotos/${chatId}/avatar`,
  });
};

const sendSystemMessage = async ({ chatId, sender, text }) => {
  const chat = await getConversationOrThrow(chatId);
  const createdAtMs = Date.now();
  const clientId = createClientId();
  const messageRef = getMessageRef(chatId, clientId);
  const payload = createRemoteMessagePayload({
    text,
    sender,
    type: 'system',
    createdAtMs,
    clientId,
  });
  const batch = writeBatch(db);
  batch.set(messageRef, payload);
  batch.update(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    ...buildConversationSummaryPatch(payload),
    ...buildUnreadStatePatch(chat, sender.uid),
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });
  await batch.commit();
};

const commitRemoteMessage = async (messageInput) => {
  const chat = await assertCanPost(messageInput.chatId, messageInput.sender.uid);

  const messageRef = getMessageRef(messageInput.chatId, messageInput.clientId);
  const existing = await getDoc(messageRef);
  if (existing.exists()) {
    return {
      id: existing.id,
      ...existing.data(),
      status: 'sent',
      localOnly: false,
    };
  }

  const resolvedMediaUrl = messageInput.remoteMediaUrl || messageInput.mediaUrl || messageInput.remoteAudioUrl || messageInput.audioUrl || null;
  const resolvedAudioUrl = messageInput.type === 'audio' ? resolvedMediaUrl : null;

  const payload = createRemoteMessagePayload({
    text: messageInput.text,
    audioUrl: resolvedAudioUrl,
    mediaUrl: resolvedMediaUrl,
    sender: messageInput.sender,
    type: messageInput.type,
    durationMillis: messageInput.durationMillis || null,
    createdAtMs: messageInput.createdAtMs,
    clientId: messageInput.clientId,
    replyTo: messageInput.replyTo || null,
    poll: messageInput.poll || null,
    sticker: messageInput.sticker || null,
  });
  const batch = writeBatch(db);

  batch.set(messageRef, payload);
  batch.set(
    doc(db, CONVERSATIONS_COLLECTION, messageInput.chatId),
    {
      ...buildConversationSummaryPatch(payload),
      ...buildUnreadStatePatch(chat, messageInput.sender.uid),
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now(),
      [`memberDetails.${messageInput.sender.uid}`]: buildMemberSnippet(messageInput.sender),
    },
    { merge: true }
  );
  await batch.commit();

  return {
    id: messageInput.clientId,
    ...payload,
    audioUrl: resolvedAudioUrl,
    mediaUrl: resolvedMediaUrl,
    sticker: payload.sticker || null,
    status: 'sent',
    localOnly: false,
  };
};

const syncRemoteMessagesIntoCache = async (chatId, remoteMessages = []) => {
  const current = await getCachedMessages(chatId);
  const merged = dedupeMessages([...current, ...remoteMessages]);
  await saveCachedMessages(chatId, merged);
  return merged;
};

const sendOnlineMessage = async (messageInput) => {
  const localMessage = createLocalMessagePayload({
    text: messageInput.text,
    sender: messageInput.sender,
    type: messageInput.type,
    audioUrl: messageInput.audioUrl || null,
    mediaUrl: messageInput.mediaUrl || messageInput.audioUrl || null,
    localUri: messageInput.localUri || null,
    durationMillis: messageInput.durationMillis || null,
    createdAtMs: messageInput.createdAtMs,
    clientId: messageInput.clientId,
    status: 'sending',
    replyTo: messageInput.replyTo || null,
    poll: messageInput.poll || null,
    sticker: messageInput.sticker || null,
  });

  await mergeCachedMessages(messageInput.chatId, [localMessage]);

  try {
    await ensureOnlineOrThrow();

    let workingItem = { ...messageInput };
    if (workingItem.type === 'audio' && !workingItem.remoteMediaUrl && !workingItem.remoteAudioUrl && !workingItem.audioUrl) {
      const uploadedUrl = await uploadVoiceFile({
        chatId: workingItem.chatId,
        senderId: workingItem.sender.uid,
        clientId: workingItem.clientId,
        uri: workingItem.localUri,
        onProgress: workingItem.onProgress,
      });
      workingItem = {
        ...workingItem,
        remoteAudioUrl: uploadedUrl,
        remoteMediaUrl: uploadedUrl,
      };
    }

    if (workingItem.type === 'image' && !workingItem.remoteMediaUrl && !workingItem.mediaUrl) {
      workingItem = {
        ...workingItem,
        remoteMediaUrl: await uploadImageFile({
          chatId: workingItem.chatId,
          senderId: workingItem.sender.uid,
          clientId: workingItem.clientId,
          uri: workingItem.localUri,
          onProgress: workingItem.onProgress,
        }),
      };
    }

    if (workingItem.type === 'video' && !workingItem.remoteMediaUrl && !workingItem.mediaUrl) {
      workingItem = {
        ...workingItem,
        remoteMediaUrl: await uploadVideoFile({
          chatId: workingItem.chatId,
          senderId: workingItem.sender.uid,
          clientId: workingItem.clientId,
          uri: workingItem.localUri,
          mimeType: workingItem.mimeType || 'video/mp4',
          onProgress: workingItem.onProgress,
        }),
      };
    }

    const remoteMessage = await commitRemoteMessage(workingItem);
    await patchCachedMessage(messageInput.chatId, messageInput.clientId, {
      ...remoteMessage,
      id: remoteMessage.id,
      status: 'sent',
      localOnly: false,
      errorMessage: null,
      localUri: null,
      mediaUrl: remoteMessage.mediaUrl || remoteMessage.audioUrl || null,
      poll: remoteMessage.poll || null,
    });
    await patchCachedConversationSummary({
      uid: messageInput.sender.uid,
      chatId: messageInput.chatId,
      message: remoteMessage,
    });

    return { queued: false, message: remoteMessage };
  } catch (error) {
    await patchCachedMessage(messageInput.chatId, messageInput.clientId, {
      status: 'failed',
      errorMessage: error?.message || 'Envoi impossible.',
      localOnly: true,
    });
    throw error;
  }
};

export const initializeChatSync = () => () => {};

export { getCachedMessages };

export const searchUserByUsername = async (value) => {
  const validation = validateUsername(value);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const username = normalizeUsername(validation.normalized);
  const usersQuery = query(collection(db, 'users'), where('usernameLower', '==', username.toLowerCase()), limit(1));
  const snapshot = await getDocs(usersQuery);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
};

export const searchUsersByUsernamePrefix = async (value) => {
  const normalized = normalizeUsername(value || '').toLowerCase();
  if (!normalized || normalized.length < 2) {
    return [];
  }

  const usersQuery = query(
    collection(db, 'users'),
    orderBy('usernameLower'),
    startAt(normalized),
    endAt(`${normalized}\uf8ff`),
    limit(12)
  );

  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((docItem) => docItem.data()).filter((item) => Boolean(item?.username));
};

export const ensurePrivateChat = async (currentUser, otherUser) => {
  const chatId = privateChatId(currentUser.uid, otherUser.uid);
  const chatRef = doc(db, CONVERSATIONS_COLLECTION, chatId);
  const chatSnap = await getDoc(chatRef);
  let conversationPayload = null;

  if (!chatSnap.exists()) {
    conversationPayload = {
      ...buildConversationBase({
        id: chatId,
        type: 'private',
        title: null,
        owner: currentUser,
        members: [currentUser, otherUser],
      }),
      title: null,
      description: '',
      lastMessage: '',
      lastMessageType: 'text',
    };
    await setDoc(chatRef, conversationPayload);
  } else {
    const existingData = chatSnap.data();
    conversationPayload = {
      id: chatSnap.id,
      ...existingData,
      memberDetails: {
        ...(existingData?.memberDetails || {}),
        [currentUser.uid]: buildMemberSnippet(currentUser),
        [otherUser.uid]: buildMemberSnippet(otherUser),
      },
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };
    await updateDoc(chatRef, {
      [`memberDetails.${currentUser.uid}`]: buildMemberSnippet(currentUser),
      [`memberDetails.${otherUser.uid}`]: buildMemberSnippet(otherUser),
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now(),
    });
  }

  await cacheConversationSnapshot({
    uid: currentUser.uid,
    conversation: conversationPayload,
  });

  return chatId;
};

export const sendTextMessage = async ({ chatId, sender, text, replyTo = null }) => {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;

  const clientId = createClientId();
  return sendOnlineMessage({
    clientId,
    chatId,
    sender,
    text: trimmed,
    type: 'text',
    createdAtMs: Date.now(),
    replyTo,
  });
};

export const sendPollMessage = async ({ chatId, sender, question, options = [], replyTo = null }) => {
  const trimmedQuestion = String(question || '').trim();
  const normalizedOptions = Array.from(new Set(options.map((option) => String(option || '').trim()).filter(Boolean)));

  if (!trimmedQuestion) {
    throw new Error('La question du sondage est requise.');
  }

  if (normalizedOptions.length < 2) {
    throw new Error('Ajoutez au moins deux options au sondage.');
  }

  const clientId = createClientId();
  return sendOnlineMessage({
    clientId,
    chatId,
    sender,
    text: trimmedQuestion,
    type: 'poll',
    createdAtMs: Date.now(),
    replyTo,
    poll: {
      question: trimmedQuestion,
      options: normalizedOptions.slice(0, 6).map((option, index) => ({
        id: `${clientId}_option_${index + 1}`,
        text: option,
        voterIds: [],
      })),
    },
  });
};

export const uploadVoiceMessage = async ({ chatId, sender, uri, durationMillis = null, onProgress, replyTo = null }) => {
  if (!uri) {
    throw new Error('Aucun fichier vocal à envoyer.');
  }

  const clientId = createClientId();
  return sendOnlineMessage({
    clientId,
    chatId,
    sender,
    text: '',
    type: 'audio',
    localUri: uri,
    durationMillis,
    createdAtMs: Date.now(),
    onProgress,
    replyTo,
  });
};

export const sendImageMessage = async ({ chatId, sender, uri, onProgress, replyTo = null }) => {
  if (!uri) {
    throw new Error('Aucune image à envoyer.');
  }

  const clientId = createClientId();
  return sendOnlineMessage({
    clientId,
    chatId,
    sender,
    text: '',
    type: 'image',
    localUri: uri,
    createdAtMs: Date.now(),
    onProgress,
    replyTo,
  });
};

export const sendStickerMessage = async ({ chatId, sender, sticker, replyTo = null }) => {
  if (!sticker?.mediaUrl) {
    throw new Error('Aucun sticker valide à envoyer.');
  }

  const clientId = createClientId();
  const stickerName = String(sticker?.name || '').trim() || 'Sticker';

  return sendOnlineMessage({
    clientId,
    chatId,
    sender,
    text: stickerName,
    type: 'sticker',
    mediaUrl: sticker.mediaUrl,
    createdAtMs: Date.now(),
    replyTo,
    sticker: {
      id: sticker.id || null,
      name: stickerName,
      mimeType: sticker.mimeType || 'image/jpeg',
      animated: Boolean(sticker.animated || sticker.mimeType === 'image/gif'),
      width: sticker.width || null,
      height: sticker.height || null,
    },
  });
};

export const retryFailedMessage = async ({ chatId, clientId }) => {
  const cached = await getCachedMessages(chatId);
  const cachedItem = cached.find((item) => item.clientId === clientId || item.id === clientId);

  if (!cachedItem) {
    throw new Error('Message introuvable dans la mémoire locale.');
  }

  await patchCachedMessage(chatId, clientId, {
    status: 'sending',
    errorMessage: null,
    localOnly: true,
  });

  return sendOnlineMessage({
    clientId: cachedItem.clientId || cachedItem.id,
    chatId,
    sender: cachedItem.senderSnapshot,
    text: cachedItem.text,
    type: cachedItem.type,
    localUri: cachedItem.localUri || null,
    audioUrl: cachedItem.audioUrl || null,
    mediaUrl: cachedItem.mediaUrl || cachedItem.audioUrl || null,
    remoteAudioUrl: cachedItem.audioUrl || null,
    remoteMediaUrl: cachedItem.mediaUrl || cachedItem.audioUrl || null,
    durationMillis: cachedItem.durationMillis || null,
    createdAtMs: cachedItem.createdAtMs,
    replyTo: cachedItem.replyTo || null,
    poll: cachedItem.poll || null,
    sticker: cachedItem.sticker || null,
  });
};

export const toggleMessageReaction = async ({ chatId, messageId, user, emoji }) => {
  if (!chatId || !messageId || !user?.uid || !emoji) {
    throw new Error('Réaction invalide.');
  }

  const { ref: messageRef, data: message } = await getMessageOrThrow(chatId, messageId);
  if (message.type === 'system' || message.type === 'deleted') {
    throw new Error('Cette réaction n’est pas disponible pour ce message.');
  }

  const nextReactions = { ...(message.reactions || {}) };
  const users = Array.isArray(nextReactions[emoji]) ? [...nextReactions[emoji]] : [];
  const nextUsers = users.includes(user.uid) ? users.filter((uid) => uid !== user.uid) : [...users, user.uid];

  if (nextUsers.length) {
    nextReactions[emoji] = nextUsers;
  } else {
    delete nextReactions[emoji];
  }

  await updateDoc(messageRef, {
    reactions: nextReactions,
  });

  await patchCachedMessage(chatId, messageId, {
    reactions: nextReactions,
  });

  return nextReactions;
};

export const voteInPoll = async ({ chatId, messageId, user, optionId }) => {
  if (!chatId || !messageId || !user?.uid || !optionId) {
    throw new Error('Vote invalide.');
  }

  const chat = await getConversationOrThrow(chatId);
  if (!chat.members?.includes(user.uid)) {
    throw new Error('Vous ne faites plus partie de cette conversation.');
  }

  const { ref: messageRef, data: message } = await getMessageOrThrow(chatId, messageId);
  if (message.type !== 'poll' || !message.poll?.question) {
    throw new Error('Ce message ne contient pas de sondage.');
  }

  const options = getMessageOptionsForUpdate(message.poll);
  const targetExists = options.some((option) => option.id === optionId);
  if (!targetExists) {
    throw new Error('Option de vote introuvable.');
  }

  const nextOptions = options.map((option) => {
    const voters = Array.from(new Set(Array.isArray(option.voterIds) ? option.voterIds.filter(Boolean) : []));
    const alreadyVotedHere = option.id === optionId && voters.includes(user.uid);

    if (option.id === optionId) {
      return {
        ...option,
        voterIds: alreadyVotedHere ? voters.filter((uid) => uid !== user.uid) : Array.from(new Set([...voters, user.uid])),
      };
    }

    return {
      ...option,
      voterIds: voters.filter((uid) => uid !== user.uid),
    };
  });

  const nextPoll = {
    question: message.poll.question,
    options: nextOptions,
  };

  await updateDoc(messageRef, {
    poll: nextPoll,
  });

  await patchCachedMessage(chatId, messageId, {
    poll: nextPoll,
  });

  return nextPoll;
};

const getMessageOptionsForUpdate = (poll = {}) =>
  (Array.isArray(poll?.options) ? poll.options : []).map((option, index) => ({
    id: String(option?.id || `poll_option_${index}`),
    text: String(option?.text || '').trim(),
    voterIds: Array.isArray(option?.voterIds) ? option.voterIds.filter(Boolean) : [],
  }));

export const pinConversationMessage = async ({ chatId, messageId, actor }) => {
  const chat = await getConversationOrThrow(chatId);

  if (chat.type === 'private') {
    throw new Error('Les messages épinglés sont réservés aux groupes et canaux.');
  }

  if (!isChatAdmin(chat, actor.uid)) {
    throw new Error('Seuls les administrateurs peuvent épingler un message.');
  }

  const { data: message } = await getMessageOrThrow(chatId, messageId);
  if (message.type === 'system' || message.type === 'deleted') {
    throw new Error('Ce message ne peut pas être épinglé.');
  }

  const pinnedMessage = {
    messageId,
    senderId: message.senderId || null,
    senderName: getUserLabel(message.senderSnapshot || {}),
    preview: getMessagePreviewLabel(message),
    type: message.type || 'text',
    pinnedBy: actor.uid,
    pinnedByName: getUserLabel(actor),
    pinnedAtMs: Date.now(),
  };

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    pinnedMessage,
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  return pinnedMessage;
};

export const unpinConversationMessage = async ({ chatId, actor }) => {
  const chat = await getConversationOrThrow(chatId);

  if (chat.type === 'private') {
    throw new Error('Les messages épinglés sont réservés aux groupes et canaux.');
  }

  if (!isChatAdmin(chat, actor.uid)) {
    throw new Error('Seuls les administrateurs peuvent retirer un message épinglé.');
  }

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    pinnedMessage: null,
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  return true;
};

export const deleteMessage = async ({ chatId, messageId, actor }) => {
  const chat = await getConversationOrThrow(chatId);

  if (!chat.members?.includes(actor.uid)) {
    throw new Error('Vous ne pouvez pas modifier les messages de cette conversation.');
  }

  const { ref: messageRef, data: message } = await getMessageOrThrow(chatId, messageId);

  if (message.type === 'system') {
    throw new Error('Les messages système ne peuvent pas être supprimés.');
  }

  if (message.type === 'deleted') {
    return false;
  }

  const isAuthor = message.senderId === actor.uid;
  const admin = isChatAdmin(chat, actor.uid);

  if (!isAuthor && !admin) {
    throw new Error('Seul l’auteur du message ou un administrateur peut le supprimer.');
  }

  await updateDoc(messageRef, {
    text: 'Message supprimé',
    audioUrl: null,
    mediaUrl: null,
    sticker: null,
    type: 'deleted',
    durationMillis: null,
    deletedAt: serverTimestamp(),
    deletedBy: actor.uid,
  });

  if (chat?.pinnedMessage?.messageId === messageId) {
    await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
      pinnedMessage: null,
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now(),
    });
  }

  await patchCachedMessage(chatId, messageId, {
    text: 'Message supprimé',
    audioUrl: null,
    mediaUrl: null,
    sticker: null,
    type: 'deleted',
    durationMillis: null,
    deletedBy: actor.uid,
    status: 'sent',
    localOnly: false,
  });

  return true;
};

export const searchMessagesInConversation = async ({ chatId, keyword }) => {
  const normalized = String(keyword || '').trim().toLowerCase();
  const cached = await getCachedMessages(chatId);

  if (!normalized) {
    return {
      allMessages: cached,
      results: cached,
      fromCache: true,
    };
  }

  if (!getLastKnownNetworkStatus()) {
    const results = cached.filter((message) => getMessageSearchText(message).includes(normalized));
    return {
      allMessages: cached,
      results,
      fromCache: true,
    };
  }

  const snapshot = await getDocs(query(collection(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION), orderBy('createdAtMs', 'desc')));
  const remoteMessages = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data(), status: 'sent', localOnly: false }));
  const allMessages = dedupeMessages([...cached, ...remoteMessages]);
  await saveCachedMessages(chatId, allMessages);

  return {
    allMessages,
    results: allMessages.filter((message) => getMessageSearchText(message).includes(normalized)),
    fromCache: false,
  };
};

export const subscribeToMessages = (chatId, callback, options = {}) => {
  const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
  const messagesQuery = query(
    collection(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION),
    orderBy('createdAtMs', 'desc'),
    limit(pageSize)
  );

  // Serve synchronously from in-memory cache first (instant)
  const memoryCached = getMemoryMessages(chatId);
  if (memoryCached.length) {
    callback({ messages: memoryCached, cursor: null, fromCache: true });
  } else {
    // Fall back to disk cache only if memory is empty
    getCachedMessages(chatId)
      .then((cached) => {
        if (cached.length) {
          callback({ messages: cached, cursor: null, fromCache: true });
        } else {
          callback({ messages: [], cursor: null, fromCache: true });
        }
      })
      .catch(() => callback({ messages: [], cursor: null, fromCache: true }));
  }

  return onSnapshot(
    messagesQuery,
    async (snapshot) => {
      const remoteMessages = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data(), status: 'sent', localOnly: false }));
      const merged = await syncRemoteMessagesIntoCache(chatId, remoteMessages);
      callback({
        messages: merged,
        cursor: snapshot.docs[snapshot.docs.length - 1] || null,
        fromCache: snapshot.metadata.fromCache,
      });
    },
    (error) => {
      logger.warn('Échec du listener messages.', { chatId, message: error?.message });
    }
  );
};

export const loadOlderMessages = async ({ chatId, cursor, pageSize = DEFAULT_PAGE_SIZE }) => {
  if (!cursor) {
    return { messages: [], cursor: null, hasMore: false };
  }

  await ensureOnlineOrThrow();

  const olderQuery = query(
    collection(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION),
    orderBy('createdAtMs', 'desc'),
    startAfter(cursor),
    limit(pageSize)
  );

  const snapshot = await getDocs(olderQuery);
  const remoteMessages = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data(), status: 'sent', localOnly: false }));
  const current = await getCachedMessages(chatId);
  const merged = dedupeMessages([...current, ...remoteMessages]);
  await saveCachedMessages(chatId, merged);

  return {
    messages: merged,
    cursor: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
};

export const subscribeToChats = (uid, callback) => {
  let lastCachedChats = [];
  const memoryChats = getMemoryChats(uid);
  if (memoryChats.length) {
    lastCachedChats = sortConversationsByActivity(memoryChats);
    callback(lastCachedChats);
  } else {
    getCachedChats(uid)
      .then((cached) => {
        lastCachedChats = sortConversationsByActivity(cached);
        callback(lastCachedChats);
      })
      .catch(() => callback([]));
  }

  const chatsQuery = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('members', 'array-contains', uid)
  );

  return onSnapshot(
    chatsQuery,
    async (snapshot) => {
      if (snapshot.metadata.fromCache && snapshot.empty && lastCachedChats.length) {
        callback(lastCachedChats);
        return;
      }

      const chats = sortConversationsByActivity(
        snapshot.docs.map((docItem) => toCachedConversation({ id: docItem.id, ...docItem.data() }, uid))
      );
      const nextChats = snapshot.metadata.fromCache ? await mergeCachedChats(uid, chats) : await saveCachedChats(uid, chats);
      lastCachedChats = sortConversationsByActivity(nextChats);
      callback(lastCachedChats);
    },
    (error) => {
      logger.warn('Échec du listener conversations.', { uid, message: error?.message });
      getCachedChats(uid)
        .then((cached) => callback(sortConversationsByActivity(cached)))
        .catch(() => callback([]));
    }
  );
};

export const subscribeToChatMeta = (chatId, callback) =>
  onSnapshot(
    doc(db, CONVERSATIONS_COLLECTION, chatId),
    (snapshot) => {
      callback(snapshot.exists() ? hydrateConversation({ id: snapshot.id, ...snapshot.data() }) : null);
    },
    (error) => {
      logger.warn('Échec du listener meta conversation.', { chatId, message: error?.message });
    }
  );

export const markMessagesAsDelivered = async ({ chatId, userId, messages = [] }) => {
  if (!getLastKnownNetworkStatus()) return false;

  const targets = messages.filter(
    (message) => message?.id && message.senderId !== userId && !message.delivery?.deliveredTo?.includes(userId) && message.type !== 'deleted'
  );

  if (!targets.length) return false;

  const batch = writeBatch(db);
  targets.forEach((message) => {
    batch.update(doc(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION, message.id), {
      'delivery.deliveredTo': arrayUnion(userId),
    });
  });

  await batch.commit();
  return true;
};

export const markMessagesAsSeen = async ({ chatId, userId, messages = [] }) => {
  if (!getLastKnownNetworkStatus()) return false;

  const targets = messages.filter(
    (message) => message?.id && message.senderId !== userId && !message.delivery?.seenBy?.includes(userId) && message.type !== 'deleted'
  );

  if (!targets.length) {
    await setDoc(
      doc(db, CONVERSATIONS_COLLECTION, chatId),
      {
        [`lastReadAt.${userId}`]: Date.now(),
        [`unreadCountByUser.${userId}`]: 0,
      },
      { merge: true }
    );
    return false;
  }

  const batch = writeBatch(db);

  targets.forEach((message) => {
    batch.update(doc(db, CONVERSATIONS_COLLECTION, chatId, MESSAGES_COLLECTION, message.id), {
      'delivery.seenBy': arrayUnion(userId),
      'delivery.deliveredTo': arrayUnion(userId),
    });
  });

  batch.set(
    doc(db, CONVERSATIONS_COLLECTION, chatId),
    {
      [`lastReadAt.${userId}`]: Date.now(),
      [`unreadCountByUser.${userId}`]: 0,
    },
    { merge: true }
  );

  await batch.commit();
  return true;
};

export const updateTypingState = async ({ chatId, userId, isTyping }) => {
  if (!chatId || !userId || !getLastKnownNetworkStatus()) return false;

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    [`typingState.${userId}`]: isTyping ? Date.now() : deleteField(),
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  return true;
};

const ensureTitle = (value, fallbackLabel) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    throw new Error(`Donnez un nom au ${fallbackLabel}.`);
  }
  return trimmed;
};

export const createGroup = async ({ owner, title, members, description = '', avatar = null, avatarUri = null, onProgress }) => {
  const groupRef = doc(collection(db, CONVERSATIONS_COLLECTION));
  const uniqueProfiles = [owner, ...members.filter((item) => item.uid !== owner.uid)];
  const trimmedTitle = ensureTitle(title, 'groupe');
  const trimmedDescription = String(description || '').trim();
  const resolvedAvatar = avatarUri ? await uploadConversationAvatar({ chatId: groupRef.id, uri: avatarUri, onProgress }) : avatar || null;
  const systemText = `${getUserLabel(owner)} a créé le groupe.`;
  const systemClientId = createClientId();
  const systemMessageRef = getMessageRef(groupRef.id, systemClientId);
  const systemMessage = createRemoteMessagePayload({
    text: systemText,
    sender: owner,
    type: 'system',
    createdAtMs: Date.now(),
    clientId: systemClientId,
  });
  const batch = writeBatch(db);
  const conversationPayload = {
    ...buildConversationBase({
      id: groupRef.id,
      type: 'group',
      title: trimmedTitle,
      description: trimmedDescription,
      avatar: resolvedAvatar,
      owner,
      members: uniqueProfiles,
    }),
    title: trimmedTitle,
    description: trimmedDescription,
    avatar: resolvedAvatar,
    lastMessage: systemText,
    lastMessageType: 'system',
    lastMessageSenderId: owner.uid,
    invite: {
      code: createClientId(),
      createdAtMs: Date.now(),
      createdBy: owner.uid,
      url: `lordimperial://invite/${groupRef.id}`,
    },
  };

  batch.set(groupRef, conversationPayload);
  batch.set(systemMessageRef, systemMessage);

  await batch.commit();
  await cacheConversationSnapshot({
    uid: owner.uid,
    conversation: conversationPayload,
    messages: [systemMessage],
  });
  return groupRef.id;
};

export const createChannel = async ({ owner, title, members, description = '', avatar = null, avatarUri = null, onProgress }) => {
  const channelRef = doc(collection(db, CONVERSATIONS_COLLECTION));
  const uniqueProfiles = [owner, ...members.filter((item) => item.uid !== owner.uid)];
  const trimmedTitle = ensureTitle(title, 'canal');
  const trimmedDescription = String(description || '').trim();
  const resolvedAvatar = avatarUri ? await uploadConversationAvatar({ chatId: channelRef.id, uri: avatarUri, onProgress }) : avatar || null;
  const systemText = `${getUserLabel(owner)} a ouvert le canal.`;
  const systemClientId = createClientId();
  const systemMessageRef = getMessageRef(channelRef.id, systemClientId);
  const systemMessage = createRemoteMessagePayload({
    text: systemText,
    sender: owner,
    type: 'system',
    createdAtMs: Date.now(),
    clientId: systemClientId,
  });
  const batch = writeBatch(db);
  const conversationPayload = {
    ...buildConversationBase({
      id: channelRef.id,
      type: 'channel',
      title: trimmedTitle,
      description: trimmedDescription,
      avatar: resolvedAvatar,
      owner,
      members: uniqueProfiles,
    }),
    title: trimmedTitle,
    description: trimmedDescription,
    avatar: resolvedAvatar,
    lastMessage: systemText,
    lastMessageType: 'system',
    lastMessageSenderId: owner.uid,
    invite: {
      code: createClientId(),
      createdAtMs: Date.now(),
      createdBy: owner.uid,
      url: `lordimperial://invite/${channelRef.id}`,
    },
  };

  batch.set(channelRef, conversationPayload);
  batch.set(systemMessageRef, systemMessage);

  await batch.commit();
  await cacheConversationSnapshot({
    uid: owner.uid,
    conversation: conversationPayload,
    messages: [systemMessage],
  });
  return channelRef.id;
};

export const updateConversationDetails = async ({ chatId, actor, title, description = '', avatar, avatarUri, onProgress }) => {
  const chat = await assertCanEditConversation(chatId, actor.uid);
  const trimmedTitle = chat.type === 'private' ? null : ensureTitle(title, chat.type === 'channel' ? 'canal' : 'groupe');
  const trimmedDescription = String(description || '').trim();
  const nextAvatar = avatarUri && avatarUri !== chat.avatar ? await uploadConversationAvatar({ chatId, uri: avatarUri, onProgress }) : avatar !== undefined ? avatar : chat.avatar || null;

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    title: trimmedTitle,
    description: trimmedDescription,
    avatar: nextAvatar,
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  return true;
};

export const updateConversationSettings = async (params) => updateConversationDetails(params);

export const updateConversationPermissions = async ({ chatId, actor, sendMessages }) => {
  const chat = await getConversationOrThrow(chatId);
  if (!canManageRoles(chat, actor.uid)) {
    throw new Error('Seuls les administrateurs peuvent modifier les permissions.');
  }

  const nextSendMessages = sendMessages === 'admins' ? 'admins' : 'members';

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    permissions: {
      ...buildPermissions(chat.type, chat.permissions),
      sendMessages: nextSendMessages,
    },
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  await sendSystemMessage({
    chatId,
    sender: actor,
    text:
      nextSendMessages === 'admins'
        ? 'Les permissions ont été mises à jour : seuls les administrateurs peuvent envoyer des messages.'
        : 'Les permissions ont été mises à jour : tous les membres peuvent envoyer des messages.',
  });

  return true;
};

export const addMemberToChat = async ({ chatId, member, actor }) => {
  const chat = await getConversationOrThrow(chatId);

  if (!canManageMembers(chat, actor.uid)) {
    throw new Error('Seuls les administrateurs peuvent ajouter des membres.');
  }

  if (chat.members?.includes(member.uid)) {
    return false;
  }

  const systemText = `${getUserLabel(actor)} a ajouté ${getUserLabel(member)}.`;
  const clientId = createClientId();
  const messageRef = getMessageRef(chatId, clientId);
  const payload = createRemoteMessagePayload({
    text: systemText,
    sender: actor,
    type: 'system',
    createdAtMs: Date.now(),
    clientId,
  });
  const batch = writeBatch(db);

  batch.update(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    members: arrayUnion(member.uid),
    [`memberRoles.${member.uid}`]: 'member',
    [`memberDetails.${member.uid}`]: buildMemberSnippet(member),
    [`unreadCountByUser.${member.uid}`]: 0,
    ...buildConversationSummaryPatch(payload),
    ...buildUnreadStatePatch(chat, actor.uid),
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });
  batch.set(messageRef, payload);

  await batch.commit();
  return true;
};

export const updateMemberRole = async ({ chatId, memberId, role, actor }) => {
  const chat = await getConversationOrThrow(chatId);
  if (!canManageRoles(chat, actor.uid) && chat.ownerId !== actor.uid) {
    throw new Error('Seuls les administrateurs peuvent modifier les rôles.');
  }

  if (!chat.members?.includes(memberId)) {
    throw new Error('Ce membre n’appartient pas à la conversation.');
  }

  const nextRole = role === 'admin' ? 'admin' : 'member';
  const nextAdmins =
    nextRole === 'admin'
      ? Array.from(new Set([...(chat.admins || []), memberId]))
      : (chat.admins || []).filter((uid) => uid !== memberId || uid === chat.ownerId);

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    admins: nextAdmins,
    [`memberRoles.${memberId}`]: memberId === chat.ownerId ? 'owner' : nextRole,
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  return true;
};

export const generateInviteLink = async ({ chatId, actor }) => {
  const chat = await getConversationOrThrow(chatId);
  if (!canManageMembers(chat, actor.uid) && chat.ownerId !== actor.uid) {
    throw new Error('Seuls les administrateurs peuvent générer un lien d’invitation.');
  }

  const invite = {
    code: createClientId(),
    createdAtMs: Date.now(),
    createdBy: actor.uid,
    url: `lordimperial://invite/${chatId}`,
  };

  await updateDoc(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    invite,
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  return invite;
};

export const leaveChat = async ({ chatId, member }) => {
  const chat = await getConversationOrThrow(chatId);

  if (chat.type === 'private') {
    throw new Error('Vous ne pouvez pas quitter une conversation privée.');
  }

  if (!chat.members?.includes(member.uid)) {
    throw new Error('Vous ne faites plus partie de cette conversation.');
  }

  const memberLabel = getUserLabel(member);
  const leaveText = `${memberLabel} a quitté ${chat.type === 'channel' ? 'le canal' : 'le groupe'}.`;
  const remainingMembers = (chat.members || []).filter((uid) => uid !== member.uid);
  const currentAdmins = chat.admins || [];
  const remainingAdmins = currentAdmins.filter((uid) => uid !== member.uid);
  const nextOwnerId = chat.ownerId === member.uid ? remainingAdmins[0] || remainingMembers[0] || null : chat.ownerId || null;
  const nextAdmins = remainingAdmins.length ? remainingAdmins : nextOwnerId ? [nextOwnerId] : [];
  const nextRoles = { ...(chat.memberRoles || {}) };
  const nextMemberDetails = { ...(chat.memberDetails || {}) };
  const nextUnreadCountByUser = { ...(chat.unreadCountByUser || {}) };

  delete nextRoles[member.uid];
  delete nextMemberDetails[member.uid];
  delete nextUnreadCountByUser[member.uid];

  if (nextOwnerId) {
    nextRoles[nextOwnerId] = nextOwnerId === chat.ownerId && chat.ownerId !== member.uid ? nextRoles[nextOwnerId] || 'owner' : 'owner';
  }
  nextAdmins.forEach((uid) => {
    if (uid !== nextOwnerId) {
      nextRoles[uid] = 'admin';
    }
  });

  const clientId = createClientId();
  const messageRef = getMessageRef(chatId, clientId);
  const payload = createRemoteMessagePayload({
    text: leaveText,
    sender: member,
    type: 'system',
    createdAtMs: Date.now(),
    clientId,
  });
  const batch = writeBatch(db);

  batch.set(messageRef, payload);
  batch.update(doc(db, CONVERSATIONS_COLLECTION, chatId), {
    members: remainingMembers,
    admins: nextAdmins,
    ownerId: nextOwnerId,
    memberRoles: nextRoles,
    memberDetails: nextMemberDetails,
    unreadCountByUser: nextUnreadCountByUser,
    pinnedMessage: chat?.pinnedMessage?.senderId === member.uid ? null : chat?.pinnedMessage || null,
    [`typingState.${member.uid}`]: deleteField(),
    [`lastReadAt.${member.uid}`]: deleteField(),
    ...buildConversationSummaryPatch(payload),
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  });

  await batch.commit();

  return {
    nextOwnerId,
    ownershipTransferred: Boolean(chat.ownerId === member.uid && nextOwnerId && nextOwnerId !== member.uid),
  };
};

export const getConversationCollectionName = () => CONVERSATIONS_COLLECTION;

export const sendVideoMessage = async ({ chatId, sender, localUri, mimeType = 'video/mp4', replyTo = null, disappearAfterMs = null }) => {
  if (!localUri) throw new Error('URI vidéo manquant.');
  return sendMessage({
    chatId,
    sender,
    type: 'video',
    localUri,
    mimeType,
    replyTo,
    ...(disappearAfterMs ? { disappearAfterMs } : {}),
  });
};

export const setDisappearingMessages = async ({ chatId, actor, disappearAfterMs }) => {
  if (!chatId || !actor) throw new Error('Paramètres manquants pour les messages éphémères.');
  const { getDoc, updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
  const ref = firestoreDoc(db, CONVERSATIONS_COLLECTION, chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Conversation introuvable.');
  const chat = snap.data();
  const admins = chat.admins || [];
  if (!admins.includes(actor.uid) && chat.ownerId !== actor.uid && chat.type === 'group') {
    throw new Error('Seuls les administrateurs peuvent modifier ce paramètre.');
  }
  await updateDoc(ref, { disappearAfterMs: disappearAfterMs || null, updatedAtMs: Date.now() });
};

export const joinChatByInviteCode = async ({ code, actor }) => {
  if (!code || !actor) throw new Error('Code ou utilisateur manquant.');
  const { collection, getDocs, query, where, doc: firestoreDoc, getDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
  const q = query(collection(db, CONVERSATIONS_COLLECTION), where('invite.code', '==', code));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Aucune conversation trouvée avec ce code d\'invitation.');
  const chatDoc = snap.docs[0];
  const chat = chatDoc.data();
  if ((chat.members || []).includes(actor.uid)) return chatDoc.id;
  await updateDoc(firestoreDoc(db, CONVERSATIONS_COLLECTION, chatDoc.id), {
    members: arrayUnion(actor.uid),
    [`memberDetails.${actor.uid}`]: {
      uid: actor.uid,
      displayName: actor.displayName || '',
      username: actor.username || '',
      email: actor.email || '',
      avatar: actor.avatar || null,
    },
    updatedAtMs: Date.now(),
  });
  return chatDoc.id;
};

export const getInviteCodeInfo = async ({ code }) => {
  if (!code) throw new Error('Code manquant.');
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const q = query(collection(db, CONVERSATIONS_COLLECTION), where('invite.code', '==', code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const chat = snap.docs[0].data();
  return {
    chatId: snap.docs[0].id,
    title: chat.title || 'Groupe sans nom',
    avatar: chat.avatar || null,
    memberCount: (chat.members || []).length,
    type: chat.type,
  };
};

export const getConversationMediaMessages = async ({ chatId, limitCount = 60 }) => {
  if (!chatId) throw new Error('chatId manquant.');
  const { collection, getDocs, orderBy, query, where, limit } = await import('firebase/firestore');
  const messagesRef = collection(db, CONVERSATIONS_COLLECTION, chatId, 'messages');
  const q = query(
    messagesRef,
    where('type', 'in', ['image', 'video']),
    orderBy('createdAtMs', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const flushOfflineQueue = async ({ userId, onMessageSent }) => {
  const { getQueuedMessages, removeQueuedMessage } = await import('./offlineStore');
  const queued = await getQueuedMessages(userId);
  for (const item of queued) {
    try {
      await sendMessage(item);
      await removeQueuedMessage(userId, item.clientId);
      onMessageSent?.(item);
    } catch (_err) {
      // keep it in queue for the next flush
    }
  }
};

export const searchAllConversations = async ({ userId, keyword, chats = [] }) => {
  if (!keyword || !keyword.trim()) return [];
  const { getMemoryMessages } = await import('./offlineStore');
  const normalized = keyword.trim().toLowerCase();

  const results = [];

  for (const chat of chats) {
    const titleMatch = (chat.title || '').toLowerCase().includes(normalized);
    const messages = getMemoryMessages(chat.id);
    const matchingMessages = messages.filter((msg) =>
      (msg.text || '').toLowerCase().includes(normalized)
    );

    if (titleMatch || matchingMessages.length > 0) {
      results.push({
        chat,
        matchingMessages: matchingMessages.slice(0, 3),
        titleMatch,
      });
    }
  }

  return results;
};
