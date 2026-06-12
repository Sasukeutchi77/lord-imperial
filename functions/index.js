const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

const INVALID_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

// ── Utilitaires ────────────────────────────────────────────────────────────

const chunk = (items, size = 400) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

/**
 * Construit le corps de la notification selon le type de message.
 * Enrichit l'aperçu avec des emojis et des métadonnées contextuelles.
 */
const buildNotificationBody = (message) => {
  const { type, text, fileName, sticker, poll, senderSnapshot } = message;
  const senderLabel =
    senderSnapshot?.displayName || senderSnapshot?.username || senderSnapshot?.email || '';

  switch (type) {
    case 'audio':
      return '🎤 Message vocal';
    case 'image':
      return '📷 Photo';
    case 'video':
      return '🎬 Vidéo';
    case 'file':
      return `📎 ${String(fileName || 'Fichier').slice(0, 60)}`;
    case 'sticker':
      return `🏷️ Sticker${sticker?.name ? ` — ${sticker.name}` : ''}`;
    case 'poll':
      return `📊 ${String(poll?.question || 'Sondage').slice(0, 100)}`;
    default:
      return String(text || (senderLabel ? `Message de ${senderLabel}` : 'Nouveau message')).slice(0, 180);
  }
};

/**
 * Détecte si un message mentionne un utilisateur spécifique.
 * Supporte @username et @uid dans le texte.
 */
const isMentioned = (message, uid, username) => {
  const text = String(message.text || '');
  if (!text) return false;
  const mentionPatterns = [`@${uid}`, username ? `@${username.replace(/^@/, '')}` : null].filter(Boolean);
  return mentionPatterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
};

/**
 * Calcule le nombre de messages non lus d'un utilisateur dans une conversation.
 * Utilisé pour alimenter le badge iOS et le compteur Android.
 */
const getUnreadCount = async (uid, conversationId) => {
  try {
    const lastReadAt = await admin
      .firestore()
      .doc(`conversations/${conversationId}`)
      .get()
      .then((snap) => Number(snap.data()?.lastReadAt?.[uid] || 0));

    const unreadSnap = await admin
      .firestore()
      .collection(`conversations/${conversationId}/messages`)
      .where('senderId', '!=', uid)
      .where('createdAtMs', '>', lastReadAt)
      .count()
      .get();

    return unreadSnap.data().count || 0;
  } catch (_error) {
    return 0;
  }
};

/**
 * Calcule le total des messages non lus sur toutes les conversations actives
 * d'un utilisateur (pour le badge global iOS).
 */
const getTotalUnreadCount = async (uid) => {
  try {
    const conversationsSnap = await admin
      .firestore()
      .collection('conversations')
      .where('members', 'array-contains', uid)
      .get();

    if (conversationsSnap.empty) return 0;

    const counts = await Promise.all(
      conversationsSnap.docs.map((doc) => getUnreadCount(uid, doc.id))
    );

    return counts.reduce((sum, n) => sum + n, 0);
  } catch (_error) {
    return 0;
  }
};

// ── Cloud Functions ────────────────────────────────────────────────────────

exports.sendMessagePush = onDocumentCreated(
  'conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    const message = event.data?.data();
    const { conversationId, messageId } = event.params;

    if (!message || ['system', 'deleted'].includes(message.type)) {
      return;
    }

    const conversationSnap = await admin.firestore().doc(`conversations/${conversationId}`).get();
    if (!conversationSnap.exists) return;

    const conversation = conversationSnap.data() || {};
    const recipients = (conversation.members || []).filter((uid) => uid !== message.senderId);

    if (!recipients.length) return;

    const userSnaps = await Promise.all(
      recipients.map((uid) => admin.firestore().doc(`users/${uid}`).get())
    );

    const createdAtMs = Number(message.createdAtMs || Date.now());
    const senderName =
      message.senderSnapshot?.displayName ||
      message.senderSnapshot?.username ||
      message.senderSnapshot?.email ||
      'Nouveau message';
    const conversationTitle = conversation.title || senderName;
    const body = buildNotificationBody(message);

    // Calcule le badge global en parallèle pour chaque destinataire éligible.
    const recipientData = await Promise.all(
      userSnaps.map(async (snapshot) => {
        const uid = snapshot.id;
        const userData = snapshot.data() || {};
        const lastReadAt = Number(conversation.lastReadAt?.[uid] || 0);
        const isInActiveChat = userData.isOnline && userData.activeChatId === conversationId;

        // Pas de notification si l'utilisateur a déjà vu le message.
        if ((userData.isOnline && lastReadAt >= createdAtMs) || isInActiveChat) {
          return null;
        }

        const userTokens = Array.isArray(userData.notificationTokens)
          ? userData.notificationTokens
          : [];

        if (!userTokens.length) return null;

        const mentioned = isMentioned(message, uid, userData.username);
        const unreadCount = await getTotalUnreadCount(uid);

        return { uid, userData, userTokens, mentioned, unreadCount };
      })
    );

    // Construit la liste des tokens à notifier avec leur contexte.
    const tokenToOwner = new Map();
    const tokenToContext = new Map();
    const tokens = [];

    recipientData.filter(Boolean).forEach(({ uid, userTokens, mentioned, unreadCount }) => {
      userTokens.forEach((token) => {
        if (!token || tokenToOwner.has(token)) return;
        tokenToOwner.set(token, uid);
        tokenToContext.set(token, { mentioned, unreadCount });
        tokens.push(token);
      });
    });

    if (!tokens.length) return;

    // Envoie les notifications individuellement pour personnaliser badge et canal.
    const sendResults = await Promise.allSettled(
      tokens.map((token) => {
        const { mentioned, unreadCount } = tokenToContext.get(token) || {};
        const androidChannelId = mentioned ? 'mentions' : 'messages';

        return admin.messaging().send({
          token,
          notification: {
            title: conversationTitle,
            body,
          },
          data: {
            chatId: String(conversationId),
            title: String(conversationTitle),
            senderId: String(message.senderId || ''),
            messageId: String(messageId),
            type: String(message.type || 'text'),
            url: `lordimperial://chat/${conversationId}`,
            isMention: String(Boolean(mentioned)),
            unreadCount: String(unreadCount || 0),
          },
          android: {
            priority: 'high',
            collapseKey: String(conversationId),
            notification: {
              channelId: androidChannelId,
              tag: String(conversationId),
              notificationCount: unreadCount || 0,
              // clickAction nécessaire pour les intents React Native
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            },
          },
          apns: {
            headers: {
              'apns-priority': mentioned ? '10' : '5',
              'apns-push-type': 'alert',
              'apns-collapse-id': String(conversationId),
            },
            payload: {
              aps: {
                sound: mentioned ? 'default' : 'default',
                badge: unreadCount || 0,
                contentAvailable: true,
                mutableContent: true,
                threadId: String(conversationId),
                category: 'MESSAGE_REPLY',
              },
            },
          },
        });
      })
    );

    // Collecte les tokens invalides à nettoyer.
    const invalidTokens = sendResults
      .map((result, index) => {
        if (result.status === 'rejected') {
          const code = result.reason?.errorInfo?.code || result.reason?.code || '';
          if (INVALID_TOKEN_ERRORS.has(code)) return tokens[index];
        }
        return null;
      })
      .filter(Boolean);

    if (!invalidTokens.length) return;

    const batch = admin.firestore().batch();
    invalidTokens.forEach((token) => {
      const ownerId = tokenToOwner.get(token);
      if (!ownerId) return;

      batch.set(
        admin.firestore().doc(`users/${ownerId}`),
        {
          notificationTokens: admin.firestore.FieldValue.arrayRemove(token),
          notificationsUpdatedAtMs: Date.now(),
        },
        { merge: true }
      );
    });

    await batch.commit();
  }
);

exports.syncUserProfileToConversations = onDocumentUpdated('users/{userId}', async (event) => {
  const before = event.data?.before?.data() || {};
  const after = event.data?.after?.data() || {};
  const { userId } = event.params;

  const trackedFields = ['username', 'displayName', 'email', 'avatar', 'bio', 'isOnline', 'lastSeen'];
  const changed = trackedFields.some((field) => before[field] !== after[field]);

  if (!changed) return;

  const conversationsSnap = await admin
    .firestore()
    .collection('conversations')
    .where('members', 'array-contains', userId)
    .get();

  if (conversationsSnap.empty) return;

  const updates = conversationsSnap.docs.map((conversationDoc) => conversationDoc.ref);
  const nextMemberDetails = {
    uid: userId,
    username: after.username || null,
    displayName: after.displayName || null,
    email: after.email || null,
    avatar: after.avatar || null,
    bio: after.bio || '',
    isOnline: Boolean(after.isOnline),
    lastSeen: after.lastSeen || null,
  };

  for (const refs of chunk(updates, 400)) {
    const batch = admin.firestore().batch();
    refs.forEach((conversationRef) => {
      batch.set(
        conversationRef,
        {
          [`memberDetails.${userId}`]: nextMemberDetails,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAtMs: Date.now(),
        },
        { merge: true }
      );
    });
    await batch.commit();
  }
});
