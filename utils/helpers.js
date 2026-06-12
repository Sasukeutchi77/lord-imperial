const USERNAME_REGEX = /^@?[a-z0-9](?:[a-z0-9._]{1,22}[a-z0-9])?$/;
const URL_REGEX = /(https?:\/\/[^\s<>()]+(?:\([^\s<>()]*\))?[^\s<>().,!?;:])/gi;

export const normalizeUsername = (value = '') => {
  const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!raw) return '';
  return raw.startsWith('@') ? raw : `@${raw}`;
};

export const validateUsername = (value = '') => {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    return { valid: false, normalized: '', message: 'Le pseudo est requis.' };
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      message: 'Utilisez 3 à 24 caractères : lettres minuscules, chiffres, point ou underscore.',
    };
  }

  if (normalized.length < 3) {
    return { valid: false, normalized, message: 'Le pseudo doit contenir au moins 3 caractères.' };
  }

  return { valid: true, normalized, message: '' };
};

export const normalizeDisplayName = (value = '') => String(value || '').trim().replace(/\s+/g, ' ').slice(0, 40);

export const normalizeBio = (value = '') => String(value || '').trim().replace(/\s+/g, ' ').slice(0, 160);

export const getUserLabel = (user = {}) => user.displayName || user.username || user.email || 'Utilisateur';

export const buildAvatarFromUsername = (seed = 'lord-imperial') =>
  `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(String(seed || 'lord-imperial'))}&backgroundType=gradientLinear`;

export const privateChatId = (uidA, uidB) => [uidA, uidB].filter(Boolean).sort().join('__');

export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatTime = (value) => {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatLastSeen = (value, isOnline = false) => {
  if (isOnline) return 'En ligne';

  const date = toDate(value);
  if (!date) return 'Hors ligne';

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (yesterday.toDateString() === date.toDateString()) {
    return `Vu hier à ${formatTime(date)}`;
  }

  if (sameDay) {
    return `Vu aujourd’hui à ${formatTime(date)}`;
  }

  return `Vu le ${date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const isChatAdmin = (chat, uid) => Boolean(chat?.admins?.includes(uid) || chat?.memberRoles?.[uid] === 'owner');

const truncate = (value = '', max = 80) => {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

export const extractUrls = (value = '') => {
  const matches = String(value || '').match(URL_REGEX) || [];
  return Array.from(new Set(matches.map((item) => item.trim())));
};

export const extractFirstUrl = (value = '') => extractUrls(value)[0] || null;

export const getPollOptions = (poll = {}) => (Array.isArray(poll?.options) ? poll.options : []).filter(Boolean);

export const getPollTotalVotes = (poll = {}) =>
  getPollOptions(poll).reduce((total, option) => total + (Array.isArray(option?.voterIds) ? option.voterIds.length : 0), 0);

export const getPollVotePercentage = (poll = {}, optionId) => {
  const total = getPollTotalVotes(poll);
  if (!total) return 0;
  const option = getPollOptions(poll).find((item) => item?.id === optionId);
  const votes = Array.isArray(option?.voterIds) ? option.voterIds.length : 0;
  return Math.round((votes / total) * 100);
};

export const getPollUserVote = (poll = {}, userId) =>
  getPollOptions(poll).find((option) => Array.isArray(option?.voterIds) && option.voterIds.includes(userId)) || null;

export const getMessagePreviewLabel = (message = {}) => {
  if (!message) return '';
  if (message.type === 'image') return '📷 Photo';
  if (message.type === 'video') return '🎬 Vidéo';
  if (message.type === 'file') return `📎 ${truncate(message.fileName || message.text || 'Fichier')}`;
  if (message.type === 'sticker') return `🏷️ ${truncate(message.sticker?.name || message.text || 'Sticker')}`;
  if (message.type === 'audio') return '🎤 Message vocal';
  if (message.type === 'poll') return `📊 ${truncate(message.poll?.question || message.text || 'Sondage')}`;
  if (message.type === 'deleted') return 'Message supprimé';
  if (message.type === 'system') return truncate(message.text || 'Mise à jour');
  return truncate(message.text || 'Message');
};

export const buildReplyReference = (message = {}) => ({
  messageId: message.id || message.clientId || null,
  senderId: message.senderId || null,
  senderName: getUserLabel(message.senderSnapshot || {}),
  type: message.type || 'text',
  preview: getMessagePreviewLabel(message),
});

export const getMessageSearchText = (message = {}) =>
  [
    message.text,
    message.fileName,
    message.replyTo?.preview,
    message.poll?.question,
    message.sticker?.name,
    ...getPollOptions(message.poll).map((option) => option?.text),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const getInitials = (label = '') => {
  const safe = String(label || '').trim().replace(/^@/, '');
  if (!safe) return 'LI';
  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

export const formatFileSize = (bytes = 0) => {
  const safe = Number(bytes) || 0;
  if (safe === 0) return '';
  if (safe < 1024) return `${safe} o`;
  if (safe < 1024 * 1024) return `${(safe / 1024).toFixed(1)} Ko`;
  if (safe < 1024 * 1024 * 1024) return `${(safe / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(safe / (1024 * 1024 * 1024)).toFixed(2)} Go`;
};

export const getFileIconName = (mimeType = '', fileName = '') => {
  const mime = String(mimeType || '').toLowerCase();
  const ext = String(fileName || '').split('.').pop().toLowerCase();
  if (mime.includes('pdf') || ext === 'pdf') return 'document-text';
  if (mime.includes('word') || ext === 'doc' || ext === 'docx') return 'document';
  if (mime.includes('excel') || mime.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx') return 'grid';
  if (mime.includes('powerpoint') || mime.includes('presentation') || ext === 'ppt' || ext === 'pptx') return 'easel';
  if (mime.includes('zip') || mime.includes('compressed') || ext === 'zip' || ext === 'rar') return 'archive';
  if (mime.includes('text') || ext === 'txt') return 'document-text-outline';
  return 'document-attach';
};

const LEVELS = [
  { name: 'Légendaire', minMessages: 1000, color: '#9B59B6', icon: '👑', rank: 4 },
  { name: 'Or',         minMessages: 500,  color: '#FFD700', icon: '🥇', rank: 3 },
  { name: 'Argent',     minMessages: 100,  color: '#C0C0C0', icon: '🥈', rank: 2 },
  { name: 'Bronze',     minMessages: 0,    color: '#CD7F32', icon: '🥉', rank: 1 },
];

export const getUserLevel = (profile = {}) => {
  const count = Number(profile?.messageCount) || 0;
  const current = LEVELS.find((l) => count >= l.minMessages) || LEVELS[LEVELS.length - 1];
  const currentIndex = LEVELS.indexOf(current);
  const nextLevel = currentIndex > 0 ? LEVELS[currentIndex - 1] : null;

  let progress;
  if (!nextLevel) {
    progress = 1;
  } else {
    const prevMin = current.minMessages;
    const nextMin = nextLevel.minMessages;
    progress = Math.min(1, Math.max(0, (count - prevMin) / (nextMin - prevMin)));
  }

  return {
    ...current,
    count,
    nextLevel: nextLevel || null,
    messagesUntilNext: nextLevel ? Math.max(0, nextLevel.minMessages - count) : 0,
    progress,
    isMaxLevel: !nextLevel,
  };
};

const CERTIFICATION_DAYS = 30;

export const getCertificationStatus = (profile = {}) => {
  const createdAt = toDate(profile?.createdAt);
  if (!createdAt) {
    return {
      isCertified: Boolean(profile?.isCertified),
      daysRemaining: CERTIFICATION_DAYS,
      progress: 0,
      eligible: false,
      daysElapsed: 0,
    };
  }

  const nowMs = Date.now();
  const elapsedMs = nowMs - createdAt.getTime();
  const requiredMs = CERTIFICATION_DAYS * 24 * 60 * 60 * 1000;
  const progress = Math.min(1, Math.max(0, elapsedMs / requiredMs));
  const daysElapsed = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  const daysRemaining = Math.max(0, CERTIFICATION_DAYS - daysElapsed);
  const eligible = elapsedMs >= requiredMs;

  return {
    isCertified: Boolean(profile?.isCertified) || eligible,
    eligible,
    daysRemaining,
    daysElapsed: Math.min(daysElapsed, CERTIFICATION_DAYS),
    progress,
  };
};

export const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🙏', '😍', '🥰', '🤩', '😎', '🥳', '🤔', '💯', '🙌', '💪', '✨'];

export const EMOJI_CATEGORIES = [
  {
    title: 'Favoris',
    emojis: ['😀', '😂', '😍', '🥰', '🔥', '👍', '❤️', '🙏', '👏', '💯', '✨', '🙌'],
  },
  {
    title: 'Sourires',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😊', '🙂', '😉', '😌', '😇', '🥹', '😋', '😜', '🤪', '😝', '🫠'],
  },
  {
    title: 'Amour',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '😘', '😍', '🥰'],
  },
  {
    title: 'Réactions',
    emojis: ['👍', '👎', '👏', '🙌', '🙏', '🤝', '👌', '✌️', '🤟', '💪', '🔥', '✨', '⭐', '💯', '✅', '🎉', '🥳', '🏆'],
  },
  {
    title: 'Humeurs',
    emojis: ['😎', '🤩', '😮', '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😡', '🤬', '😴', '🤔', '🤨', '🙄', '😬', '🤐'],
  },
  {
    title: 'Objets',
    emojis: ['📸', '🎤', '🎧', '📱', '💬', '📌', '📍', '🔔', '🎁', '⚡', '🌟', '🚀', '👑', '🛡️', '⚔️', '💎', '🕊️', '🌹'],
  },
];
