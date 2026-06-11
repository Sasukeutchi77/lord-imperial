import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  deleteField,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { unregisterPushToken } from './notifications';
import { compressImageBeforeUpload } from './media';
import { uploadImageToCloudinary } from './cloudinary';
import {
  buildAvatarFromUsername,
  getUserLabel,
  normalizeBio,
  normalizeDisplayName,
  validateUsername,
} from '../utils/helpers';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

const buildErrorStatus = (code) => {
  switch (code) {
    case 'username/already-taken':
    case 'auth/email-already-in-use':
      return 409;
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 401;
    case 'auth/network-request-failed':
      return 503;
    case 'auth/invalid-email':
    case 'auth/missing-email':
    case 'auth/missing-password':
    case 'auth/weak-password':
    case 'auth/missing-user':
    case 'profile/display-name-invalid':
    case 'profile/bio-invalid':
      return 400;
    default:
      return 500;
  }
};

const createFriendlyError = (message, code, status = buildErrorStatus(code)) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
};

const buildUserProfilePayload = ({
  uid,
  email,
  username = null,
  displayName = '',
  bio = '',
  avatar = null,
  currentProfile = null,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedDisplayName = normalizeDisplayName(displayName || currentProfile?.displayName || '');
  const normalizedBio = normalizeBio(bio || currentProfile?.bio || '');
  const avatarSeed = username || normalizedEmail || uid || 'lord-imperial';

  return {
    uid,
    email: normalizedEmail || null,
    username,
    usernameLower: username ? username.toLowerCase() : null,
    displayName: normalizedDisplayName,
    bio: normalizedBio,
    avatar: avatar || currentProfile?.avatar || buildAvatarFromUsername(avatarSeed),
    activeChatId: currentProfile?.activeChatId || null,
    isOnline: true,
    lastSeen: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedAtMs: Date.now(),
  };
};

const mapFirebaseAuthError = (error) => {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide.';
    case 'auth/missing-password':
      return 'Saisissez votre mot de passe.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'auth/network-request-failed':
      return 'Connexion réseau impossible. Vérifiez votre accès Internet.';
    case 'auth/operation-not-allowed':
      return 'La connexion email/mot de passe n’est pas activée dans Firebase Authentication.';
    case 'username/already-taken':
      return 'Ce nom d’utilisateur est déjà pris.';
    case 'profile/display-name-invalid':
      return 'Le nom affiché doit contenir au moins 2 caractères.';
    case 'profile/bio-invalid':
      return 'La bio doit contenir 160 caractères maximum.';
    default:
      return error?.message || 'Une erreur d’authentification est survenue.';
  }
};

const assertEmailPasswordCredentials = (email, password) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw createFriendlyError('Saisissez votre adresse email.', 'auth/missing-email');
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createFriendlyError('Adresse email invalide.', 'auth/invalid-email');
  }

  if (!String(password || '')) {
    throw createFriendlyError('Saisissez votre mot de passe.', 'auth/missing-password');
  }

  return normalizedEmail;
};

const validateProfileForm = ({ displayName, bio }) => {
  const normalizedDisplayName = normalizeDisplayName(displayName || '');
  const normalizedBio = normalizeBio(bio || '');

  if (!normalizedDisplayName || normalizedDisplayName.length < 2) {
    throw createFriendlyError('Le nom affiché doit contenir au moins 2 caractères.', 'profile/display-name-invalid', 400);
  }

  if (normalizedBio.length > 160) {
    throw createFriendlyError('La bio doit contenir 160 caractères maximum.', 'profile/bio-invalid', 400);
  }

  return {
    normalizedDisplayName,
    normalizedBio,
  };
};

const uploadProfileImage = async ({ uid, uri, onProgress }) => {
  const optimized = await compressImageBeforeUpload(uri, {
    maxWidth: 1024,
    quality: 0.72,
  });

  return uploadImageToCloudinary(optimized.uri, {
    onProgress,
    path: `profileImages/${uid}`,
  });
};

const ensureUserProfile = async (user) => {
  if (!user?.uid) {
    throw createFriendlyError('Utilisateur Firebase introuvable.', 'auth/missing-user');
  }

  const normalizedEmail = normalizeEmail(user.email);
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  const currentData = snapshot.exists() ? snapshot.data() : null;

  await setDoc(
    userRef,
    {
      ...buildUserProfilePayload({
        uid: user.uid,
        email: normalizedEmail,
        username: currentData?.username || null,
        displayName: currentData?.displayName || currentData?.username || '',
        bio: currentData?.bio || '',
        avatar: currentData?.avatar || null,
        currentProfile: currentData,
      }),
      createdAt: currentData?.createdAt || serverTimestamp(),
    },
    { merge: true }
  );

  return user;
};

const withFriendlyAuthErrors = async (action) => {
  try {
    return await action();
  } catch (error) {
    if (error?.status) {
      throw error;
    }

    throw createFriendlyError(mapFirebaseAuthError(error), error?.code);
  }
};

export const registerWithEmail = async (email, password) => {
  const normalizedEmail = assertEmailPasswordCredentials(email, password);

  if (String(password).length < 6) {
    throw createFriendlyError('Le mot de passe doit contenir au moins 6 caractères.', 'auth/weak-password');
  }

  return withFriendlyAuthErrors(async () => {
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

    try {
      await ensureUserProfile(credential.user);
    } catch (error) {
      try {
        await deleteUser(credential.user);
      } catch (cleanupError) {
        console.warn('Suppression du compte incomplet impossible:', cleanupError?.message || cleanupError);
      }
      throw error;
    }

    return credential.user;
  });
};

export const loginWithEmail = async (email, password) => {
  const normalizedEmail = assertEmailPasswordCredentials(email, password);

  return withFriendlyAuthErrors(async () => {
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    await ensureUserProfile(credential.user);
    return credential.user;
  });
};

export const logoutUser = async () => {
  const uid = auth.currentUser?.uid;

  if (uid) {
    await unregisterPushToken(uid).catch(() => {});
    await setDoc(
      doc(db, 'users', uid),
      {
        isOnline: false,
        activeChatId: null,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );
  }

  return signOut(auth);
};

export const reserveUsername = async (uid, rawUsername) => {
  const validation = validateUsername(rawUsername);
  if (!validation.valid) {
    throw createFriendlyError(validation.message, 'username/invalid', 400);
  }

  const username = validation.normalized;
  const usernameKey = username.slice(1);
  const usernameRef = doc(db, 'usernames', usernameKey);
  const userRef = doc(db, 'users', uid);

  try {
    await runTransaction(db, async (transaction) => {
      const usernameSnap = await transaction.get(usernameRef);
      const userSnap = await transaction.get(userRef);
      const existingUserData = userSnap.exists() ? userSnap.data() : {};
      const previousUsername = existingUserData.username || null;
      const previousUsernameKey = previousUsername ? previousUsername.slice(1) : null;

      if (existingUserData.usernameLower === username.toLowerCase()) {
        return;
      }

      if (usernameSnap.exists()) {
        const usernameOwner = usernameSnap.data()?.uid;

        if (usernameOwner !== uid) {
          throw createFriendlyError('Ce nom d’utilisateur est déjà pris.', 'username/already-taken', 409);
        }
      }

      if (previousUsernameKey && previousUsernameKey !== usernameKey) {
        transaction.delete(doc(db, 'usernames', previousUsernameKey));
      }

      if (!userSnap.exists()) {
        transaction.set(
          userRef,
          {
            ...buildUserProfilePayload({
              uid,
              email: auth.currentUser?.uid === uid ? auth.currentUser?.email : existingUserData.email,
              username,
              displayName: existingUserData.displayName || username,
              bio: existingUserData.bio || '',
              avatar: existingUserData.avatar || null,
              currentProfile: existingUserData,
            }),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      transaction.set(usernameRef, {
        uid,
        username,
        createdAt: usernameSnap.exists() ? usernameSnap.data()?.createdAt || serverTimestamp() : serverTimestamp(),
      });

      transaction.set(
        userRef,
        {
          ...buildUserProfilePayload({
            uid,
            email:
              existingUserData.email ||
              (auth.currentUser?.uid === uid ? normalizeEmail(auth.currentUser?.email) : null),
            username,
            displayName: existingUserData.displayName || username,
            bio: existingUserData.bio || '',
            avatar: existingUserData.avatar || null,
            currentProfile: existingUserData,
          }),
        },
        { merge: true }
      );
    });
  } catch (error) {
    if (error?.code === 'username/already-taken') {
      throw error;
    }

    throw createFriendlyError(mapFirebaseAuthError(error), error?.code || 'username/reservation-failed');
  }

  return username;
};

export const updatePresence = async (uid, isOnline) => {
  if (!uid) return;

  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      isOnline,
      ...(isOnline ? {} : { activeChatId: null }),
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );
};

export const updateActiveChatId = async (uid, chatId = null) => {
  if (!uid) return;

  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      activeChatId: chatId || null,
      updatedAt: serverTimestamp(),
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );
};

export const updateUserProfile = async ({ uid, currentProfile, values }) => {
  if (!uid) {
    throw createFriendlyError('Utilisateur introuvable.', 'auth/missing-user');
  }

  const { normalizedDisplayName: nextDisplayName, normalizedBio: nextBio } = validateProfileForm({
    displayName: values?.displayName || currentProfile?.displayName || '',
    bio: values?.bio || '',
  });
  const usernameValidation = validateUsername(values?.username || currentProfile?.username || '');

  if (!usernameValidation.valid) {
    throw createFriendlyError(usernameValidation.message, 'username/invalid', 400);
  }

  let nextAvatar = currentProfile?.avatar || null;

  if (values?.avatarUri && values.avatarUri !== currentProfile?.avatar) {
    nextAvatar = await uploadProfileImage({ uid, uri: values.avatarUri });
  }

  const nextUsername = usernameValidation.normalized;
  const nextUsernameKey = nextUsername.slice(1);
  const previousUsername = currentProfile?.username || null;
  const previousUsernameKey = previousUsername ? previousUsername.slice(1) : null;
  const userRef = doc(db, 'users', uid);
  const nextUsernameRef = doc(db, 'usernames', nextUsernameKey);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const existingUser = userSnap.exists() ? userSnap.data() : currentProfile || {};
    const usernameSnap = await transaction.get(nextUsernameRef);

    if (usernameSnap.exists() && usernameSnap.data()?.uid !== uid) {
      throw createFriendlyError('Ce nom d’utilisateur est déjà pris.', 'username/already-taken', 409);
    }

    if (previousUsernameKey && previousUsernameKey !== nextUsernameKey) {
      transaction.delete(doc(db, 'usernames', previousUsernameKey));
    }

    transaction.set(nextUsernameRef, {
      uid,
      username: nextUsername,
      createdAt: usernameSnap.exists() ? usernameSnap.data()?.createdAt || serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(
      userRef,
      {
        ...buildUserProfilePayload({
          uid,
          email: existingUser.email || auth.currentUser?.email,
          username: nextUsername,
          displayName: nextDisplayName || nextUsername,
          bio: nextBio,
          avatar: nextAvatar || existingUser.avatar || buildAvatarFromUsername(nextUsername),
          currentProfile: existingUser,
        }),
        avatarUpdatedAtMs: nextAvatar !== currentProfile?.avatar ? Date.now() : existingUser.avatarUpdatedAtMs || null,
      },
      { merge: true }
    );
  });
};

export const clearPushTokenFromProfile = async (uid, token) => {
  if (!uid || !token) return;

  await setDoc(
    doc(db, 'users', uid),
    {
      notificationTokens: deleteField(),
      notificationsUpdatedAtMs: Date.now(),
    },
    { merge: true }
  );
};

export const getUserProfile = async (uid) => {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const getProfileHeadline = (profile) => getUserLabel(profile || {});
