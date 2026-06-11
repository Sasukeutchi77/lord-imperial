import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const ensureMediaPermission = async (errorMessage = 'Autorisez l\u2019acc\u00e8s \u00e0 votre galerie pour choisir une image.') => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(errorMessage);
  }
};

const ensureCameraPermission = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Autorisez l\u2019acc\u00e8s \u00e0 la cam\u00e9ra pour prendre une photo.');
  }
};

export const pickImageFromLibrary = async (options = {}) => {
  await ensureMediaPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect ?? [1, 1],
    quality: options.quality ?? 0.85,
    selectionLimit: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0].uri;
};

export const pickChatImageFromLibrary = async () =>
  pickImageFromLibrary({
    allowsEditing: false,
    quality: 0.82,
  });

export const pickChatVideoFromLibrary = async () => {
  await ensureMediaPermission('Autorisez l\u2019acc\u00e8s \u00e0 votre galerie pour choisir une vid\u00e9o.');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: true,
    videoMaxDuration: 30,
    quality: ImagePicker.UIImagePickerControllerQualityType?.Medium ?? 0.5,
    selectionLimit: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  if (asset.duration && asset.duration > 31000) {
    throw new Error('La vid\u00e9o est trop longue. Choisissez une vid\u00e9o de 30 secondes maximum.');
  }

  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'video/mp4',
    fileName: asset.fileName || `video-${Date.now()}.mp4`,
    duration: asset.duration || null,
    width: asset.width || null,
    height: asset.height || null,
    fileSize: asset.fileSize || null,
  };
};

export const pickStickerMediaFromLibrary = async () => {
  await ensureMediaPermission('Autorisez l\u2019acc\u00e8s \u00e0 votre galerie pour choisir une image ou un GIF.');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
    selectionLimit: 1,
    orderedSelection: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    mimeType: asset.mimeType || null,
    fileName: asset.fileName || null,
    width: asset.width || null,
    height: asset.height || null,
    fileSize: asset.fileSize || null,
  };
};

export const takeStickerPhoto = async () => {
  await ensureCameraPermission();

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || `camera-sticker-${Date.now()}.jpg`,
    width: asset.width || null,
    height: asset.height || null,
    fileSize: asset.fileSize || null,
  };
};

export const pickDocumentFromLibrary = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const MAX_SIZE = 50 * 1024 * 1024;

  if (asset.size && asset.size > MAX_SIZE) {
    throw new Error('Le fichier est trop volumineux. Choisissez un fichier de moins de 50 Mo.');
  }

  return {
    uri: asset.uri,
    mimeType: asset.mimeType || 'application/octet-stream',
    fileName: asset.name || `document-${Date.now()}`,
    fileSize: asset.size || null,
  };
};
