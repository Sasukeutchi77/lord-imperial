const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

const INVALID_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

const chunk = (items, size = 400) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

exports.sendMessagePush = onDocumentCreated('conversations/{conversationId}/messages/{messageId}', async (event) => {
  const message = event.data?.data();
  const { conversationId, messageId } = event.params;

  if (!message || ['system', 'deleted'].includes(message.type)) {
    return;
  }

  const conversationSnap = await admin.firestore().doc(`conversations/${conversationId}`).get();
  if (!conversationSnap.exists) {
    return;
  }

  const conversation = conversationSnap.data() || {};
  const recipients = (conversation.members || []).filter((uid) => uid !== message.senderId);

  if (!recipients.length) {
    return;
  }

  const userSnaps = await Promise.all(recipients.map((uid) => admin.firestore().doc(`users/${uid}`).get()));
  const tokenToOwner = new Map();
  const tokens = [];
  const createdAtMs = Number(message.createdAtMs || Date.now());

  userSnaps.forEach((snapshot) => {
    const uid = snapshot.id;
    const userData = snapshot.data() || {};
    const userTokens = Array.isArray(userData.notificationTokens) ? userData.notificationTokens : [];
    const lastReadAt = Number(conversation.lastReadAt?.[uid] || 0);
    const isInActiveChat = userData.isOnline && userData.activeChatId === conversationId;

    if ((userData.isOnline && lastReadAt >= createdAtMs) || isInActiveChat) {
      return;
    }

    userTokens.forEach((token) => {
      if (!token || tokenToOwner.has(token)) {
        return;
      }

      tokenToOwner.set(token, uid);
      tokens.push(token);
    });
  });

  if (!tokens.length) {
    return;
  }

  const senderName = message.senderSnapshot?.displayName || message.senderSnapshot?.username || message.senderSnapshot?.email || 'Nouveau message';
  const body = message.type === 'audio' ? '🎤 Message vocal' : String(message.text || 'Nouveau message').slice(0, 180);
  const title = conversation.title || senderName;

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    data: {
      chatId: String(conversationId),
      title: String(title),
      senderId: String(message.senderId || ''),
      messageId: String(messageId),
      type: String(message.type || 'text'),
      url: `lordimperial://chat/${conversationId}`,
    },
    android: {
      priority: 'high',
      collapseKey: String(conversationId),
      notification: {
        channelId: 'messages',
        tag: String(conversationId),
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
        'apns-push-type': 'alert',
        'apns-collapse-id': String(conversationId),
      },
      payload: {
        aps: {
          sound: 'default',
          contentAvailable: true,
          mutableContent: true,
          threadId: String(conversationId),
        },
      },
    },
  });

  const invalidTokens = response.responses
    .map((result, index) => ({
      success: result.success,
      code: result.error?.code,
      token: tokens[index],
    }))
    .filter((entry) => !entry.success && INVALID_TOKEN_ERRORS.has(entry.code))
    .map((entry) => entry.token);

  if (!invalidTokens.length) {
    return;
  }

  const batch = admin.firestore().batch();
  invalidTokens.forEach((token) => {
    const ownerId = tokenToOwner.get(token);
    if (!ownerId) {
      return;
    }

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
});

exports.syncUserProfileToConversations = onDocumentUpdated('users/{userId}', async (event) => {
  const before = event.data?.before?.data() || {};
  const after = event.data?.after?.data() || {};
  const { userId } = event.params;

  const trackedFields = ['username', 'displayName', 'email', 'avatar', 'bio', 'isOnline', 'lastSeen'];
  const changed = trackedFields.some((field) => before[field] !== after[field]);

  if (!changed) {
    return;
  }

  const conversationsSnap = await admin.firestore().collection('conversations').where('members', 'array-contains', userId).get();
  if (conversationsSnap.empty) {
    return;
  }

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
