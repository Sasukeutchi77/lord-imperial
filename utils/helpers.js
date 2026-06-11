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
