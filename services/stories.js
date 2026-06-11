import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImageToCloudinary } from './cloudinary';
import { compressImageBeforeUpload } from './media';
import { logger } from './logger';

const STORIES_COLLECTION = 'stories';
const STORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

const createStoryId = () => {
  const template = 'story_xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx';
  let cursor = Date.now();
  return template.replace(/[xy]/g, (c) => {
    const r = (cursor + Math.random() * 16) % 16 | 0;
    cursor = Math.floor(cursor / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const postStory = async ({ author, mediaUri = null, text = '', color = '#1E1E2E' }) => {
  if (!author?.uid) throw new Error('Utilisateur requis pour publier une story.');
  if (!mediaUri && !text) throw new Error('Ajoutez une image ou un texte pour publier une story.');

  const storyId = createStoryId();
  const createdAtMs = Date.now();
  const expiresAtMs = createdAtMs + STORY_TTL_MS;

  let mediaUrl = null;

  if (mediaUri) {
    try {
      const optimized = await compressImageBeforeUpload(mediaUri, { maxWidth: 1080, quality: 0.78 });
      mediaUrl = await uploadImageToCloudinary(optimized.uri, {
        path: `stories/${author.uid}/${storyId}`,
      });
    } catch (error) {
      logger.warn('Upload story image failed', { message: error?.message });
      throw new Error("L'image de la story n'a pas pu être envoyée. Vérifiez votre connexion.");
    }
  }

  const payload = {
    id: storyId,
    authorId: author.uid,
    authorName: author.displayName || author.username || 'Utilisateur',
    authorAvatar: author.avatar || null,
    mediaUrl,
    mediaType: mediaUrl ? 'image' : 'text',
    text: String(text || '').trim(),
    color,
    viewedBy: [],
    createdAtMs,
    expiresAtMs,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, STORIES_COLLECTION, storyId), payload);
  return payload;
};

export const subscribeToStories = (callback) => {
  const nowMs = Date.now();
  const storyQuery = query(
    collection(db, STORIES_COLLECTION),
    where('expiresAtMs', '>', nowMs),
    orderBy('expiresAtMs', 'desc')
  );

  const unsubscribe = onSnapshot(
    storyQuery,
    (snapshot) => {
      const stories = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.expiresAtMs > Date.now());
      callback(stories);
    },
    (error) => {
      logger.warn('Stories subscription error', { message: error?.message });
      callback([]);
    }
  );

  return unsubscribe;
};

export const getStoriesByUser = async (uid) => {
  if (!uid) return [];
  const nowMs = Date.now();
  const q = query(
    collection(db, STORIES_COLLECTION),
    where('authorId', '==', uid),
    where('expiresAtMs', '>', nowMs)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const viewStory = async ({ storyId, viewerId }) => {
  if (!storyId || !viewerId) return;
  try {
    const storyRef = doc(db, STORIES_COLLECTION, storyId);
    const snap = await getDoc(storyRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const viewedBy = Array.isArray(data.viewedBy) ? data.viewedBy : [];
    if (viewedBy.includes(viewerId)) return;
    await updateDoc(storyRef, { viewedBy: [...viewedBy, viewerId] });
  } catch (error) {
    logger.warn('Story view update failed', { message: error?.message });
  }
};

export const deleteStory = async ({ storyId, actorId }) => {
  if (!storyId || !actorId) throw new Error('Identifiant requis pour supprimer la story.');
  const storyRef = doc(db, STORIES_COLLECTION, storyId);
  const snap = await getDoc(storyRef);
  if (!snap.exists()) throw new Error('Story introuvable.');
  const data = snap.data();
  if (data.authorId !== actorId) throw new Error('Vous ne pouvez supprimer que vos propres stories.');
  await deleteDoc(storyRef);
};

export const groupStoriesByAuthor = (stories = []) => {
  const map = new Map();
  stories.forEach((story) => {
    const key = story.authorId;
    if (!map.has(key)) {
      map.set(key, {
        authorId: story.authorId,
        authorName: story.authorName,
        authorAvatar: story.authorAvatar,
        stories: [],
      });
    }
    map.get(key).stories.push(story);
  });
  return Array.from(map.values());
};

const STORY_NOTIFS_COLLECTION = 'storyNotifications';

const createCommentId = () => {
  const template = 'cmt_xxxxxxxx_xxxx';
  let cursor = Date.now();
  return template.replace(/[xy]/g, (c) => {
    const r = (cursor + Math.random() * 16) % 16 | 0;
    cursor = Math.floor(cursor / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const sendStoryNotification = async ({ type, recipientId, actor, storyId, storyMediaUrl = null, text = '' }) => {
  if (!recipientId || !actor?.uid || recipientId === actor.uid) return;
  try {
    const notifId = `${type}_${actor.uid}_${storyId}_${Date.now()}`;
    await setDoc(doc(db, STORY_NOTIFS_COLLECTION, recipientId, 'items', notifId), {
      id: notifId,
      type,
      actorId: actor.uid,
      actorName: actor.displayName || actor.username || 'Utilisateur',
      actorAvatar: actor.avatar || null,
      storyId,
      storyMediaUrl: storyMediaUrl || null,
      text: text || '',
      createdAtMs: Date.now(),
      read: false,
    });
  } catch (error) {
    logger.warn('Story notification write failed', { message: error?.message });
  }
};

export const likeStory = async ({ storyId, story, viewer }) => {
  if (!storyId || !viewer?.uid) return { liked: false };
  const storyRef = doc(db, STORIES_COLLECTION, storyId);
  try {
    const snap = await getDoc(storyRef);
    if (!snap.exists()) return { liked: false };
    const data = snap.data();
    const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
    const alreadyLiked = likedBy.includes(viewer.uid);

    if (alreadyLiked) {
      await updateDoc(storyRef, { likedBy: likedBy.filter((id) => id !== viewer.uid) });
      return { liked: false };
    }

    await updateDoc(storyRef, { likedBy: [...likedBy, viewer.uid] });
    await sendStoryNotification({
      type: 'story_like',
      recipientId: data.authorId,
      actor: viewer,
      storyId,
      storyMediaUrl: data.mediaUrl || null,
    });
    return { liked: true };
  } catch (error) {
    logger.warn('likeStory failed', { message: error?.message });
    throw new Error("Impossible d'enregistrer votre réaction.");
  }
};

export const addStoryComment = async ({ storyId, story, author, text }) => {
  if (!storyId || !author?.uid) throw new Error('Données manquantes pour commenter.');
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('Écrivez un commentaire avant d'envoyer.');
  if (trimmed.length > 500) throw new Error('Le commentaire doit contenir 500 caractères maximum.');

  const commentId = createCommentId();
  const comment = {
    id: commentId,
    authorId: author.uid,
    authorName: author.displayName || author.username || 'Utilisateur',
    authorAvatar: author.avatar || null,
    text: trimmed,
    createdAtMs: Date.now(),
  };

  await setDoc(doc(db, STORIES_COLLECTION, storyId, 'comments', commentId), comment);

  const authorId = story?.authorId || null;
  if (authorId) {
    await sendStoryNotification({
      type: 'story_comment',
      recipientId: authorId,
      actor: author,
      storyId,
      storyMediaUrl: story?.mediaUrl || null,
      text: trimmed,
    });
  }

  return comment;
};

export const subscribeToStoryComments = ({ storyId, callback }) => {
  if (!storyId) { callback([]); return () => {}; }
  const q = query(
    collection(db, STORIES_COLLECTION, storyId, 'comments'),
    orderBy('createdAtMs', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => {
      logger.warn('Story comments subscription error', { message: error?.message });
      callback([]);
    }
  );
};

export const subscribeToStoryNotifications = ({ uid, callback }) => {
  if (!uid) { callback([]); return () => {}; }
  const q = query(
    collection(db, STORY_NOTIFS_COLLECTION, uid, 'items'),
    orderBy('createdAtMs', 'desc'),
    limit(50)
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => {
      logger.warn('Story notifications subscription error', { message: error?.message });
      callback([]);
    }
  );
};

export const markStoryNotificationsRead = async (uid) => {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, STORY_NOTIFS_COLLECTION, uid),
      { lastReadAtMs: Date.now() },
      { merge: true }
    );
  } catch (error) {
    logger.warn('markStoryNotificationsRead failed', { message: error?.message });
  }
};
