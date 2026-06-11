import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const getOptimizedAudioRecordingOptions = () => ({
  android: {
    extension: '.m4a',
    outputFormat: 2,
    audioEncoder: 3,
    sampleRate: 24000,
    numberOfChannels: 1,
    bitRate: 32000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: 0,
    sampleRate: 24000,
    numberOfChannels: 1,
    bitRate: 32000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 32000,
  },
});

export const createLocalFileBlob = (uri) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Le fichier local n’a pas pu être chargé.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

export const getLocalFileInfo = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return {
      exists: Boolean(info?.exists),
      size: info?.size || 0,
      uri: info?.uri || uri,
    };
  } catch (_error) {
    return {
      exists: true,
      size: 0,
      uri,
    };
  }
};

export const compressImageBeforeUpload = async (uri, options = {}) => {
  if (!uri) {
    throw new Error('Image introuvable.');
  }

  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: options.maxWidth || 1440 } }],
      {
        compress: options.quality || 0.72,
        format: SaveFormat.JPEG,
        base64: false,
      }
    );

    const info = await getLocalFileInfo(result.uri);

    return {
      uri: result.uri,
      size: info.size,
      width: result.width,
      height: result.height,
      contentType: 'image/jpeg',
    };
  } catch (error) {
    throw new Error(error?.message || 'Cette image n’a pas pu être préparée avant l’envoi.');
  }
};
