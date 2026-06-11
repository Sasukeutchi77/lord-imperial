const DEFAULT_CLOUD_NAME = 'dobs5ixuc';

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

const buildCloudinaryError = (message) => {
  const error = new Error(message);
  error.code = 'cloudinary/upload-failed';
  return error;
};

const inferExtension = (fileUri = '', fileType = 'auto', customFileName = '') => {
  const safeFileName = String(customFileName || '').split('?')[0];
  const fileNameMatch = safeFileName.match(/\.([a-zA-Z0-9]+)$/);
  if (fileNameMatch?.[1]) return fileNameMatch[1].toLowerCase();

  const cleanUri = String(fileUri).split('?')[0];
  const uriMatch = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  if (uriMatch?.[1]) return uriMatch[1].toLowerCase();
  if (fileType === 'audio') return 'm4a';
  if (fileType === 'image') return 'jpg';
  if (fileType === 'video') return 'mp4';
  return 'bin';
};

const inferMimeType = (fileUri = '', fileType = 'auto', customMimeType = '', customFileName = '') => {
  if (customMimeType) return customMimeType;

  const extension = inferExtension(fileUri, fileType, customFileName);
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    wav: 'audio/wav',
    webm: 'audio/webm',
    caf: 'audio/x-caf',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
  };

  if (mimeMap[extension]) {
    return mimeMap[extension];
  }

  if (fileType === 'image') return 'image/jpeg';
  if (fileType === 'audio') return 'audio/mp4';
  if (fileType === 'video') return 'video/mp4';
  return 'application/octet-stream';
};

const inferFileName = (fileUri = '', fileType = 'auto', customFileName = '') => {
  if (customFileName) return customFileName;
  const extension = inferExtension(fileUri, fileType, customFileName);
  const prefix = fileType === 'audio' ? 'voice-message' : fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : 'upload';
  return `${prefix}-${Date.now()}.${extension}`;
};

const getResourceType = (fileType = 'auto') => {
  if (fileType === 'image') return 'image';
  if (fileType === 'audio') return 'video';
  if (fileType === 'video') return 'video';
  return 'auto';
};

const ensureCloudinaryConfig = () => {
  if (!cloudName) {
    throw buildCloudinaryError('Configurez EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME pour envoyer les médias.');
  }

  if (!uploadPreset) {
    throw buildCloudinaryError('Configurez EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET avec un preset non signé Cloudinary.');
  }
};

export const cloudinaryReady = Boolean(cloudName && uploadPreset);
export const cloudinaryConfigError = cloudinaryReady
  ? ''
  : 'Configuration Cloudinary incomplète. Ajoutez EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET dans votre environnement Expo.';

export async function uploadToCloudinary(fileUri, fileType, options = {}) {
  ensureCloudinaryConfig();

  if (!fileUri) {
    throw buildCloudinaryError('Aucun fichier à envoyer vers Cloudinary.');
  }

  const resourceType = getResourceType(fileType);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const mimeType = inferMimeType(fileUri, fileType, options?.mimeType || '', options?.fileName || '');
  const fileName = inferFileName(fileUri, fileType, options?.fileName || '');
  const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    });
    formData.append('upload_preset', uploadPreset);

    if (options?.path) {
      formData.append('folder', options.path);
    }

    xhr.open('POST', endpoint);
    xhr.responseType = 'text';
    xhr.timeout = options.timeout || (fileType === 'video' ? 180000 : 90000);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
        onProgress(percent);
      };
    }

    xhr.onerror = () => reject(buildCloudinaryError('Le transfert Cloudinary a échoué. Vérifiez votre connexion et réessayez.'));
    xhr.ontimeout = () => reject(buildCloudinaryError('Le transfert Cloudinary a expiré. Réessayez avec une meilleure connexion.'));
    xhr.onabort = () => reject(buildCloudinaryError('Le transfert Cloudinary a été interrompu.'));
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;

      try {
        const parsed = xhr.responseText ? JSON.parse(xhr.responseText) : {};

        if (xhr.status >= 200 && xhr.status < 300 && parsed?.secure_url) {
          if (onProgress) onProgress(100);
          resolve({
            secure_url: parsed.secure_url,
            public_id: parsed.public_id || null,
            bytes: parsed.bytes || 0,
            resource_type: parsed.resource_type || resourceType,
            format: parsed.format || null,
            duration: parsed.duration || null,
          });
          return;
        }

        reject(buildCloudinaryError(parsed?.error?.message || 'Cloudinary a refusé le fichier envoyé. Vérifiez le preset non signé.'));
      } catch (_error) {
        reject(buildCloudinaryError('La réponse Cloudinary est invalide ou incomplète.'));
      }
    };

    xhr.send(formData);
  });
}

export const uploadImageToCloudinary = async (fileUri, options = {}) => {
  const result = await uploadToCloudinary(fileUri, 'image', options);
  return result.secure_url;
};

export const uploadAudioToCloudinary = async (fileUri, options = {}) => {
  const result = await uploadToCloudinary(fileUri, 'audio', options);
  return result.secure_url;
};

export const uploadVideoToCloudinary = async (fileUri, options = {}) => {
  const result = await uploadToCloudinary(fileUri, 'video', options);
  return result.secure_url;
};
