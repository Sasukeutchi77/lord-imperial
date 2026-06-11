import AsyncStorage from '@react-native-async-storage/async-storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { uploadToCloudinary } from './cloudinary';

const STORAGE_PREFIX = '@lord-imperial/stickers_';
const MAX_STICKERS = 72;
const MAX_NAME_LENGTH = 32;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const normalizeName = (value = '') => String(value || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);

const getStickerKey = (uid) => `${STORAGE_PREFIX}${uid || 'anonymous'}`;

const inferMimeType = (asset = {}) => {
  if (asset?.mimeType) return asset.mimeType;
  const safeName = String(asset?.fileName || asset?.uri || '').toLowerCase();
  if (safeName.endsWith('.gif')) return 'image/gif';
  if (safeName.endsWith('.png')) return 'image/png';
  if (safeName.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const inferFileName = (asset = {}, mimeType = 'image/jpeg') => {
  if (asset?.fileName) return asset.fileName;
  const extension = mimeType === 'image/gif' ? 'gif' : mimeType === 'image/png' ? 'png' : 'jpg';
  return `sticker-${Date.now()}.${extension}`;
};

const normalizeSticker = (sticker = {}) => ({
  id: sticker.id || `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  name: normalizeName(sticker.name || 'Sticker') || 'Sticker',
  mediaUrl: sticker.mediaUrl || '',
  mimeType: sticker.mimeType || 'image/jpeg',
  animated: Boolean(sticker.animated || sticker.mimeType === 'image/gif'),
  fileName: sticker.fileName || null,
  width: Number(sticker.width || 0) || null,
  height: Number(sticker.height || 0) || null,
  createdAtMs: Number(sticker.createdAtMs || Date.now()),
});

const readStickers = async (uid) => {
  try {
    const raw = await AsyncStorage.getItem(getStickerKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeSticker).filter((item) => item.mediaUrl) : [];
  } catch (_error) {
    return [];
  }
};

const writeStickers = async (uid, stickers = []) => {
  const next = stickers.map(normalizeSticker).filter((item) => item.mediaUrl).slice(0, MAX_STICKERS);
  await AsyncStorage.setItem(getStickerKey(uid), JSON.stringify(next));
  return next;
};

const prepareStaticStickerAsset = async (asset = {}) => {
  const sourceUri = asset?.uri;
  if (!sourceUri) {
    throw new Error('Image du sticker introuvable.');
  }

  const sourceMime = inferMimeType(asset);
  const targetFormat = sourceMime === 'image/png' || sourceMime === 'image/webp' ? SaveFormat.PNG : SaveFormat.JPEG;
  const shouldResize = Number(asset?.width || 0) > 768;
  const result = await manipulateAsync(
    sourceUri,
    shouldResize ? [{ resize: { width: 768 } }] : [],
    {
      compress: targetFormat === SaveFormat.PNG ? 1 : 0.88,
      format: targetFormat,
      base64: false,
    }
  );

  const mimeType = targetFormat === SaveFormat.PNG ? 'image/png' : 'image/jpeg';

  return {
    uri: result.uri,
    mimeType,
    fileName: inferFileName(asset, mimeType),
    width: result.width || asset?.width || null,
    height: result.height || asset?.height || null,
  };
};

export const getSavedStickers = async (uid) => readStickers(uid);

export const removeStickerForUser = async (uid, stickerId) => {
  const current = await readStickers(uid);
  return writeStickers(
    uid,
    current.filter((item) => item.id !== stickerId)
  );
};

export const saveStickerForUser = async (uid, sticker) => {
  const normalized = normalizeSticker(sticker);
  const current = await readStickers(uid);
  const deduped = current.filter((item) => item.id !== normalized.id && item.mediaUrl !== normalized.mediaUrl);
  return writeStickers(uid, [normalized, ...deduped]);
};

export const reorderSticker = async (uid, stickerId, direction = 'up') => {
  const current = await readStickers(uid);
  const index = current.findIndex((item) => item.id === stickerId);
  if (index < 0) return current;

  const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(current.length - 1, index + 1);
  if (newIndex === index) return current;

  const next = [...current];
  const [moved] = next.splice(index, 1);
  next.splice(newIndex, 0, moved);
  return writeStickers(uid, next);
};

export const getStickerCount = async (uid) => {
  const stickers = await readStickers(uid);
  return stickers.length;
};

export const canAddMoreStickers = async (uid) => {
  const count = await getStickerCount(uid);
  return { canAdd: count < MAX_STICKERS, current: count, max: MAX_STICKERS };
};

export const createAndStoreSticker = async ({ userId, asset, name, onProgress }) => {
  const normalizedName = normalizeName(name);
  if (!normalizedName) {
    throw new Error('Donnez un nom au sticker.');
  }

  if (!asset?.uri) {
    throw new Error('Choisissez une image ou un GIF pour cr\u00e9er le sticker.');
  }

  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    throw new Error('Le fichier est trop volumineux (max 10 Mo). Choisissez une image plus l\u00e9g\u00e8re.');
  }

  const capacity = await canAddMoreStickers(userId);
  if (!capacity.canAdd) {
    throw new Error(`Vous avez atteint la limite de ${MAX_STICKERS} stickers. Supprimez-en un pour en ajouter un nouveau.`);
  }

  const sourceMime = inferMimeType(asset);
  const animated = sourceMime === 'image/gif';
  const preparedAsset = animated
    ? {
        uri: asset.uri,
        mimeType: 'image/gif',
        fileName: inferFileName(asset, 'image/gif'),
        width: asset.width || null,
        height: asset.height || null,
      }
    : await prepareStaticStickerAsset(asset);

  const uploadResult = await uploadToCloudinary(preparedAsset.uri, 'image', {
    onProgress,
    path: `stickers/${userId || 'anonymous'}`,
    mimeType: preparedAsset.mimeType,
    fileName: preparedAsset.fileName,
  });

  const sticker = normalizeSticker({
    id: uploadResult.public_id || undefined,
    name: normalizedName,
    mediaUrl: uploadResult.secure_url,
    mimeType: preparedAsset.mimeType,
    animated,
    fileName: preparedAsset.fileName,
    width: preparedAsset.width,
    height: preparedAsset.height,
    createdAtMs: Date.now(),
  });

  await saveStickerForUser(userId, sticker);
  return sticker;
};
