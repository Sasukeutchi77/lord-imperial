import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { arrayRemove, arrayUnion, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger';
import { getActiveChatId, isChatRouteActive, navigateToChat } from './navigationRef';

const MAX_CONSUMED_RESPONSES = 60;
const APPLE_PERMISSION_STATUSES = new Set(['granted', 'provisional', 'ephemeral']);
const QUICK_REPLY_CATEGORY = 'MESSAGE_REPLY';
const QUICK_REPLY_ACTION = 'REPLY_ACTION';

// Canal Android dédié aux @mentions (priorité maximale, contourne DND)
const ANDROID_CHANNEL_MESSAGES = 'messages';
const ANDROID_CHANNEL_MENTIONS = 'mentions';

const extractChatIdFromUrl = (url = '') => {
  const match = String(url).match(/chat\/([^/?#]+)/i);
  return match?.[1] || null;
};

const extractChatPayload = (source) => {
  const data =
    source?.notification?.request?.content?.data ||
    source?.request?.content?.data ||
    source?.data ||
    {};
  const url = data.url || null;

  return {
    chatId: data.chatId || extractChatIdFromUrl(url) || null,
    initialTitle: data.title || null,
    messageId: data.messageId || null,
    senderId: data.senderId || null,
    isMention: data.isMention === 'true' || data.isMention === true,
    actionIdentifier: source?.actionIdentifier || null,
    userText: source?.userText || null,
  };
};

const isPermissionGranted = (permissions) => {
  if (!permissions) return false;
  if (typeof permissions.granted === 'boolean') return permissions.granted;
  return APPLE_PERMISSION_STATUSES.has(permissions.status);
};

const shouldSuppressForegroundNotification = (notification) => {
  const payload = extractChatPayload(notification);
  if (AppState.currentState !== 'active') return false;
  return Boolean(
    payload.chatId && (isChatRouteActive(payload.chatId) || getActiveChatId() === payload.chatId)
  );
};

// ── Badge ──────────────────────────────────────────────────────────────────
// Met à jour le badge iOS avec le nombre total de messages non lus transmis
// par la Cloud Function dans le champ data.unreadCount.
const updateBadgeFromPayload = async (data = {}) => {
  try {
    const count = parseInt(data.unreadCount || '0', 10);
    if (!Number.isNaN(count) && count >= 0) {
      await Notifications.setBadgeCountAsync(count);
    }
  } catch (_error) {
    // Le badge n'est pas critique.
  }
};

// Remet le badge à 0 quand l'utilisateur ouvre une conversation.
export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (_error) {
    // no-op
  }
};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const suppress = shouldSuppressForegroundNotification(notification);
    const data = notification?.request?.content?.data || {};

    // Met à jour le badge même quand on n'affiche pas la bannière.
    await updateBadgeFromPayload(data);

    return {
      shouldPlaySound: !suppress,
      shouldSetBadge: true,
      shouldShowBanner: !suppress,
      shouldShowList: !suppress,
    };
  },
});

let notificationListenersBound = false;
let registeredToken = null;
let quickReplyHandler = null;
const consumedResponseIds = new Set();
const consumedResponseQueue = [];

const rememberConsumedResponse = (dedupeKey) => {
  if (!dedupeKey || consumedResponseIds.has(dedupeKey)) return;

  consumedResponseIds.add(dedupeKey);
  consumedResponseQueue.push(dedupeKey);

  while (consumedResponseQueue.length > MAX_CONSUMED_RESPONSES) {
    const oldest = consumedResponseQueue.shift();
    if (oldest) consumedResponseIds.delete(oldest);
  }
};

const consumeNavigationPayload = async (payload) => {
  if (!payload?.chatId) return false;

  if (payload.actionIdentifier === QUICK_REPLY_ACTION && payload.userText && quickReplyHandler) {
    try {
      await quickReplyHandler({ chatId: payload.chatId, text: payload.userText });
    } catch (error) {
      logger.warn('Quick reply failed', { message: error?.message });
    }
    return true;
  }

  const dedupeKey = payload.messageId || `${payload.chatId}_${payload.senderId || 'unknown'}`;
  if (consumedResponseIds.has(dedupeKey)) return false;

  rememberConsumedResponse(dedupeKey);
  navigateToChat(payload.chatId, payload.initialTitle);

  // Remet le badge à 0 dès que l'utilisateur tape sur la notification.
  await clearBadge();

  try {
    await Notifications.clearLastNotificationResponseAsync();
  } catch (_error) {
    // no-op
  }

  return true;
};

const processLastNotificationResponse = async () => {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) return false;
    return consumeNavigationPayload(extractChatPayload(response));
  } catch (error) {
    logger.warn('Lecture de la dernière notification impossible.', { message: error?.message });
    return false;
  }
};

// ── Canaux Android ─────────────────────────────────────────────────────────
const ensureAndroidChannels = async () => {
  if (Platform.OS !== 'android') return;

  // Canal principal "Messages"
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_MESSAGES, {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 220, 120, 220],
    lightColor: '#2563EB',
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    enableVibrate: true,
    showBadge: true,
  });

  // Canal "@Mentions" — haute priorité, passe le mode Ne pas déranger
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_MENTIONS, {
    name: 'Mentions',
    description: 'Notifications quand quelqu\'un vous mentionne dans un groupe ou canal.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 100, 50, 100, 50, 300],
    lightColor: '#F59E0B',
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    enableVibrate: true,
    showBadge: true,
  });
};

// ── Catégorie Quick Reply ──────────────────────────────────────────────────
const setupQuickReplyCategory = async () => {
  try {
    await Notifications.setNotificationCategoryAsync(QUICK_REPLY_CATEGORY, [
      {
        identifier: QUICK_REPLY_ACTION,
        buttonTitle: 'Répondre',
        options: { opensAppToForeground: false },
        textInput: {
          submitButtonTitle: 'Envoyer',
          placeholder: 'Écrire une réponse…',
        },
      },
    ]);
  } catch (error) {
    logger.warn('Quick reply category setup failed', { message: error?.message });
  }
};

// ── API publique ───────────────────────────────────────────────────────────

export const setQuickReplyHandler = (handler) => {
  quickReplyHandler = handler;
};

export const getNotificationPermissionStatus = async () => {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return {
      granted: isPermissionGranted(permissions),
      canAskAgain: permissions?.canAskAgain !== false,
      status: permissions?.status || 'undetermined',
    };
  } catch (error) {
    await logger.warn('Lecture des permissions notifications impossible.', {
      message: error?.message,
    });
    return { granted: false, canAskAgain: true, status: 'undetermined' };
  }
};

export const registerForPushNotifications = async (uid) => {
  if (!uid) return null;

  try {
    const currentPermissions = await Notifications.getPermissionsAsync();
    let permissions = currentPermissions;

    if (!isPermissionGranted(permissions)) {
      permissions = await Notifications.requestPermissionsAsync();
    }

    if (!isPermissionGranted(permissions)) {
      await logger.warn('Notifications refusées par l\u2019utilisateur.', {
        uid,
        status: permissions?.status,
        canAskAgain: permissions?.canAskAgain,
      });
      return null;
    }

    await ensureAndroidChannels();
    await setupQuickReplyCategory();

    const deviceToken = await Notifications.getDevicePushTokenAsync();
    const token = deviceToken?.data || null;

    if (!token) {
      await logger.warn('Aucun token de notification natif disponible.', {
        uid,
        platform: Platform.OS,
      });
      return null;
    }

    registeredToken = token;

    await setDoc(
      doc(db, 'users', uid),
      {
        notificationTokens: arrayUnion(token),
        notificationProvider: deviceToken?.type || 'native',
        notificationPlatform: Platform.OS,
        notificationsUpdatedAtMs: Date.now(),
      },
      { merge: true }
    );

    return token;
  } catch (error) {
    await logger.warn('Inscription push impossible.', {
      uid,
      platform: Platform.OS,
      message: error?.message,
    });
    return null;
  }
};

export const unregisterPushToken = async (uid) => {
  if (!uid || !registeredToken) return;

  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        notificationTokens: arrayRemove(registeredToken),
        notificationsUpdatedAtMs: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    await logger.warn('Suppression du token push impossible.', { uid, message: error?.message });
  }
};

export const bindNotificationNavigation = () => {
  if (notificationListenersBound) return () => {};

  notificationListenersBound = true;

  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    const payload = extractChatPayload(notification);
    const data = notification?.request?.content?.data || {};

    // Met à jour le badge à la réception (foreground).
    updateBadgeFromPayload(data);

    logger.info('Notification reçue.', {
      chatId: payload.chatId,
      messageId: payload.messageId,
      isMention: payload.isMention,
      foreground: true,
      suppressed: shouldSuppressForegroundNotification(notification),
    });
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    consumeNavigationPayload(extractChatPayload(response));
  });

  processLastNotificationResponse();

  const appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      processLastNotificationResponse();
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
    appStateSubscription.remove();
    notificationListenersBound = false;
  };
};
