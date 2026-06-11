import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_MESSAGES_PER_CHAT = 250;
const MAX_CHATS = 100;
const STORAGE_PREFIX = '@lord-imperial/';
const CHATS_KEY = STORAGE_PREFIX + 'chats_';
const MESSAGES_KEY = STORAGE_PREFIX + 'messages_';
const PROFILE_KEY = STORAGE_PREFIX + 'profile_';
const QUEUE_KEY = STORAGE_PREFIX + 'queue_';

const messageStore = new Map();
const chatStore = new Map();
const queueStore = new Map();
const profileStore = new Map();
const hydratedKeys = new Set();

const WRITE_DELAY_MS = 300;
const pendingWrites = new Map();

const schedulePersist = (storageKey, getData) => {
  if (pendingWrites.has(storageKey)) {
    clearTimeout(pendingWrites.get(storageKey));
  }
  pendingWrites.set(
    storageKey,
    setTimeout(async () => {
      pendingWrites.delete(storageKey);
      try {
        const data = getData();
        if (data === null || data === undefined) {
          await AsyncStorage.removeItem(storageKey);
        } else {
          await AsyncStorage.setItem(storageKey, JSON.stringify(data));
        }
      } catch (_error) {}
    }, WRITE_DELAY_MS)
  );
};

const hydrateFromDisk = async (storageKey) => {
  if (hydratedKeys.has(storageKey)) return null;
  hydratedKeys.add(storageKey);
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

const clonePoll = (poll) => {
  if (!poll) return poll;
  return {
    ...poll,
    options: Array.isArray(poll.options)
      ? poll.options.map((option) => ({
          ...option,
          voterIds: [...(option?.voterIds || [])],
        }))
      : [],
  };
};

const cloneMessage = (message) => ({
  ...message,
  senderSnapshot: message?.senderSnapshot ? { ...message.senderSnapshot } : message?.senderSnapshot,
  replyTo: message?.replyTo ? { ...message.replyTo } : message?.replyTo,
  sticker: message?.sticker ? { ...message.sticker } : message?.sticker,
  poll: clonePoll(message?.poll),
  delivery: message?.delivery
    ? {
        deliveredTo: [...(message.delivery.deliveredTo || [])],
        seenBy: [...(message.delivery.seenBy || [])],
      }
    : message?.delivery,
});

const cloneMessages = (messages = []) => messages.filter(Boolean).map(cloneMessage);
const cloneChats = (chats = []) => chats.filter(Boolean).map((chat) => ({ ...chat }));

const getTimestamp = (message) => Number(message?.createdAtMs || 0);

const sortMessages = (messages = []) =>
  [...messages].sort((a, b) => {
    const timeA = getTimestamp(a);
    const timeB = getTimestamp(b);

    if (timeA === timeB) {
      return String(a.id || a.clientId || '').localeCompare(String(b.id || b.clientId || ''));
    }

    return timeA - timeB;
  });

const sortChats = (chats = []) =>
  [...chats]
    .filter((chat) => chat?.id)
    .sort((a, b) => {
      const timeA = Number(a?.lastActivityAtMs || a?.updatedAtMs || a?.createdAtMs || 0);
      const timeB = Number(b?.lastActivityAtMs || b?.updatedAtMs || b?.createdAtMs || 0);

      if (timeA === timeB) {
        return String(a?.title || a?.id || '').localeCompare(String(b?.title || b?.id || ''));
      }

      return timeB - timeA;
    });

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
    mediaUrl: next.mediaUrl || previous.mediaUrl || null,
    replyTo: next.replyTo || previous.replyTo || null,
    sticker: next.sticker || previous.sticker || null,
    poll: next.poll || previous.poll || null,
    delivery: mergeDeliveryState(previous.delivery, next.delivery),
  };
};

const dedupeMessages = (messages = []) => {
  const map = new Map();

  messages.filter(Boolean).forEach((message) => {
    const lookupKeys = [message.id, message.clientId].filter(Boolean);
    const existingKey = lookupKeys.find((candidateKey) => map.has(candidateKey));
    const selectedKey = existingKey || message.clientId || message.id || `${message.senderId || 'unknown'}_${getTimestamp(message)}`;
    const merged = mergeMessage(map.get(selectedKey), message);

    map.set(selectedKey, merged);
    lookupKeys.forEach((candidateKey) => map.set(candidateKey, merged));
  });

  return sortMessages(Array.from(new Set(Array.from(map.values()))).slice(-MAX_MESSAGES_PER_CHAT));
};

const sortQueue = (queue = []) =>
  [...queue]
    .filter((item) => item?.clientId && item?.chatId && item?.sender?.uid)
    .sort((a, b) => Number(a.createdAtMs || 0) - Number(b.createdAtMs || 0));

// ─── Synchronous memory-only getters (no AsyncStorage, instant) ─────────────

export const getMemoryChats = (uid) => cloneChats(chatStore.get(uid) || []);

export const getMemoryMessages = (chatId) => cloneMessages(messageStore.get(chatId) || []);

// ─── Preload: hydrate from disk into memory for a given uid ─────────────────

export const preloadCacheForUser = async (uid) => {
  const chatsKey = CHATS_KEY + uid;
  if (!hydratedKeys.has(chatsKey)) {
    hydratedKeys.add(chatsKey);
    try {
      const raw = await AsyncStorage.getItem(chatsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          chatStore.set(uid, parsed);
        }
      }
    } catch (_error) {}
  }

  const profileKey = PROFILE_KEY + uid;
  if (!hydratedKeys.has(profileKey)) {
    hydratedKeys.add(profileKey);
    try {
      const raw = await AsyncStorage.getItem(profileKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) profileStore.set(uid, parsed);
      }
    } catch (_error) {}
  }
};

// ─── Async getters (hydrate from disk on first access) ───────────────────────

export const getCachedMessages = async (chatId) => {
  if (!messageStore.has(chatId)) {
    const diskData = await hydrateFromDisk(MESSAGES_KEY + chatId);
    if (diskData && Array.isArray(diskData) && diskData.length > 0) {
      messageStore.set(chatId, diskData);
    }
  }
  return cloneMessages(messageStore.get(chatId) || []);
};

export const saveCachedMessages = async (chatId, messages) => {
  const next = dedupeMessages(messages);
  messageStore.set(chatId, next);
  schedulePersist(MESSAGES_KEY + chatId, () => next);
  return cloneMessages(next);
};

export const mergeCachedMessages = async (chatId, messages) => {
  const current = await getCachedMessages(chatId);
  return saveCachedMessages(chatId, [...current, ...messages]);
};

export const patchCachedMessage = async (chatId, matchValue, patch) => {
  const current = await getCachedMessages(chatId);
  const next = current.map((item) => {
    if (item.id === matchValue || item.clientId === matchValue) {
      return mergeMessage(item, patch);
    }
    return item;
  });

  return saveCachedMessages(chatId, next);
};

export const getCachedChats = async (uid) => {
  if (!chatStore.has(uid)) {
    const diskData = await hydrateFromDisk(CHATS_KEY + uid);
    if (diskData && Array.isArray(diskData) && diskData.length > 0) {
      chatStore.set(uid, diskData);
    }
  }
  return cloneChats(chatStore.get(uid) || []);
};

export const saveCachedChats = async (uid, chats = []) => {
  const sorted = sortChats(chats).slice(0, MAX_CHATS);

  chatStore.set(uid, sorted.map((chat) => ({ ...chat })));
  schedulePersist(CHATS_KEY + uid, () => sorted);
  return cloneChats(sorted);
};

export const mergeCachedChats = async (uid, chats = []) => {
  const current = await getCachedChats(uid);
  const merged = new Map();

  [...current, ...chats].filter(Boolean).forEach((chat) => {
    if (!chat.id) return;
    if (Array.isArray(chat.members) && !chat.members.includes(uid)) return;

    merged.set(chat.id, {
      ...(merged.get(chat.id) || {}),
      ...chat,
    });
  });

  return saveCachedChats(uid, Array.from(merged.values()));
};

export const removeCachedChat = async (uid, chatId) => {
  const current = await getCachedChats(uid);
  return saveCachedChats(
    uid,
    current.filter((chat) => chat.id !== chatId)
  );
};

export const getQueuedMessages = async (uid) => {
  if (!queueStore.has(uid)) {
    const diskData = await hydrateFromDisk(QUEUE_KEY + uid);
    if (diskData && Array.isArray(diskData) && diskData.length > 0) {
      queueStore.set(uid, diskData);
    }
  }
  return cloneMessages(sortQueue(queueStore.get(uid) || []));
};

export const saveQueuedMessages = async (uid, queue = []) => {
  const next = sortQueue(queue);
  queueStore.set(uid, next.map((item) => ({ ...item })));
  schedulePersist(QUEUE_KEY + uid, () => next);
  return cloneMessages(next);
};

export const enqueueMessage = async (uid, item) => {
  const current = await getQueuedMessages(uid);
  const next = current.filter((entry) => entry.clientId !== item.clientId);
  next.push({ ...item });
  return saveQueuedMessages(uid, next);
};

export const removeQueuedMessage = async (uid, clientId) => {
  const current = await getQueuedMessages(uid);
  return saveQueuedMessages(
    uid,
    current.filter((item) => item.clientId !== clientId)
  );
};

export const patchQueuedMessage = async (uid, clientId, patch) => {
  const current = await getQueuedMessages(uid);
  const next = current.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item));
  return saveQueuedMessages(uid, next);
};

export const getCachedProfile = async (uid) => {
  if (!profileStore.has(uid)) {
    const diskData = await hydrateFromDisk(PROFILE_KEY + uid);
    if (diskData) {
      profileStore.set(uid, diskData);
    }
  }
  const profile = profileStore.get(uid);
  return profile ? { ...profile } : null;
};

export const saveCachedProfile = async (uid, profile) => {
  if (!profile) {
    profileStore.delete(uid);
    schedulePersist(PROFILE_KEY + uid, () => null);
    return null;
  }

  profileStore.set(uid, { ...profile });
  schedulePersist(PROFILE_KEY + uid, () => profile);
  return { ...profile };
};
