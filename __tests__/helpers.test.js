import {
  normalizeUsername,
  validateUsername,
  normalizeDisplayName,
  normalizeBio,
  getUserLabel,
  buildAvatarFromUsername,
  privateChatId,
  toDate,
  formatTime,
  formatLastSeen,
  isChatAdmin,
  extractUrls,
  extractFirstUrl,
  getPollOptions,
  getPollTotalVotes,
  getPollVotePercentage,
  getPollUserVote,
  getMessagePreviewLabel,
  buildReplyReference,
  getMessageSearchText,
  getCertificationStatus,
  getUserLevel,
} from '../utils/helpers';

// ---------------------------------------------------------------------------
// normalizeUsername
// ---------------------------------------------------------------------------
describe('normalizeUsername', () => {
  it('préfixe @ si absent', () => {
    expect(normalizeUsername('alice')).toBe('@alice');
  });

  it('ne double pas le @ si déjà présent', () => {
    expect(normalizeUsername('@alice')).toBe('@alice');
  });

  it('met en minuscules', () => {
    expect(normalizeUsername('ALICE')).toBe('@alice');
  });

  it('supprime les espaces', () => {
    expect(normalizeUsername('  al ice  ')).toBe('@alice');
  });

  it('retourne une chaîne vide si vide', () => {
    expect(normalizeUsername('')).toBe('');
    expect(normalizeUsername(null)).toBe('');
    expect(normalizeUsername(undefined)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// validateUsername
// ---------------------------------------------------------------------------
describe('validateUsername', () => {
  it('accepte un pseudo valide', () => {
    const result = validateUsername('alice123');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('@alice123');
  });

  it('accepte un pseudo avec point et underscore', () => {
    expect(validateUsername('alice_bob.ok').valid).toBe(true);
  });

  it('rejette un pseudo trop court (< 3 chars avec @)', () => {
    const result = validateUsername('ab');
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('rejette un pseudo vide', () => {
    const result = validateUsername('');
    expect(result.valid).toBe(false);
  });

  it('met en minuscules avant validation (accepte les majuscules en les normalisant)', () => {
    // normalizeUsername convertit en minuscules — @alice est valide
    const result = validateUsername('Alice');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('@alice');
  });

  it('rejette les caractères spéciaux interdits', () => {
    expect(validateUsername('alice!').valid).toBe(false);
    expect(validateUsername('alice#bad').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// normalizeDisplayName / normalizeBio
// ---------------------------------------------------------------------------
describe('normalizeDisplayName', () => {
  it('tronque à 40 chars', () => {
    expect(normalizeDisplayName('a'.repeat(50))).toHaveLength(40);
  });

  it('collapse les espaces multiples', () => {
    expect(normalizeDisplayName('Jean   Pierre')).toBe('Jean Pierre');
  });

  it('retourne vide si null/undefined', () => {
    expect(normalizeDisplayName(null)).toBe('');
    expect(normalizeDisplayName(undefined)).toBe('');
  });
});

describe('normalizeBio', () => {
  it('tronque à 160 chars', () => {
    expect(normalizeBio('x'.repeat(200))).toHaveLength(160);
  });

  it('supprime les espaces de début/fin', () => {
    expect(normalizeBio('  bio  ')).toBe('bio');
  });
});

// ---------------------------------------------------------------------------
// getUserLabel
// ---------------------------------------------------------------------------
describe('getUserLabel', () => {
  it('retourne displayName en priorité', () => {
    expect(getUserLabel({ displayName: 'Alice', username: '@bob', email: 'c@c.com' })).toBe('Alice');
  });

  it('fallback sur username', () => {
    expect(getUserLabel({ username: '@bob', email: 'c@c.com' })).toBe('@bob');
  });

  it('fallback sur email', () => {
    expect(getUserLabel({ email: 'c@c.com' })).toBe('c@c.com');
  });

  it('fallback ultime "Utilisateur"', () => {
    expect(getUserLabel({})).toBe('Utilisateur');
    expect(getUserLabel(undefined)).toBe('Utilisateur');
  });
});

// ---------------------------------------------------------------------------
// buildAvatarFromUsername
// ---------------------------------------------------------------------------
describe('buildAvatarFromUsername', () => {
  it('retourne une URL dicebear valide', () => {
    const url = buildAvatarFromUsername('alice');
    expect(url).toMatch(/^https:\/\/api\.dicebear\.com/);
    expect(url).toContain('alice');
  });

  it('utilise le seed par défaut si vide', () => {
    const url = buildAvatarFromUsername('');
    expect(url).toContain('lord-imperial');
  });
});

// ---------------------------------------------------------------------------
// privateChatId
// ---------------------------------------------------------------------------
describe('privateChatId', () => {
  it('est symétrique', () => {
    expect(privateChatId('uid1', 'uid2')).toBe(privateChatId('uid2', 'uid1'));
  });

  it('sépare les uids par __', () => {
    expect(privateChatId('aaa', 'bbb')).toBe('aaa__bbb');
  });

  it('ignore les valeurs falsy', () => {
    expect(privateChatId('aaa', null)).toBe('aaa');
  });
});

// ---------------------------------------------------------------------------
// toDate
// ---------------------------------------------------------------------------
describe('toDate', () => {
  it('retourne null si vide', () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
  });

  it('retourne un Date natif tel quel', () => {
    const d = new Date('2026-01-01');
    expect(toDate(d)).toBe(d);
  });

  it('convertit un objet Firestore { seconds, nanoseconds }', () => {
    const ts = { seconds: 1700000000, nanoseconds: 0 };
    const result = toDate(ts);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1700000000000);
  });

  it('convertit un objet avec toDate()', () => {
    const d = new Date('2026-06-01');
    const firestoreTs = { toDate: () => d };
    expect(toDate(firestoreTs)).toBe(d);
  });

  it('parse une chaîne ISO', () => {
    const result = toDate('2026-06-01T00:00:00.000Z');
    expect(result).toBeInstanceOf(Date);
  });

  it('retourne null pour une chaîne invalide', () => {
    expect(toDate('not-a-date')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// formatLastSeen
// ---------------------------------------------------------------------------
describe('formatLastSeen', () => {
  it('retourne "En ligne" si isOnline', () => {
    expect(formatLastSeen(null, true)).toBe('En ligne');
  });

  it('retourne "Hors ligne" si pas de date', () => {
    expect(formatLastSeen(null, false)).toBe('Hors ligne');
    expect(formatLastSeen(undefined, false)).toBe('Hors ligne');
  });

  it('retourne "Vu aujourd\'hui" pour une date du jour', () => {
    const now = new Date();
    const result = formatLastSeen(now, false);
    expect(result).toMatch(/aujourd/);
  });

  it('retourne "Vu hier" pour hier', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = formatLastSeen(yesterday, false);
    expect(result).toMatch(/hier/);
  });
});

// ---------------------------------------------------------------------------
// isChatAdmin
// ---------------------------------------------------------------------------
describe('isChatAdmin', () => {
  it('retourne true si uid dans admins[]', () => {
    expect(isChatAdmin({ admins: ['uid1', 'uid2'] }, 'uid1')).toBe(true);
  });

  it('retourne true si memberRoles[uid] === owner', () => {
    expect(isChatAdmin({ memberRoles: { uid3: 'owner' } }, 'uid3')).toBe(true);
  });

  it('retourne false sinon', () => {
    expect(isChatAdmin({ admins: ['uid1'] }, 'uid2')).toBe(false);
    expect(isChatAdmin({}, 'uid1')).toBe(false);
    expect(isChatAdmin(null, 'uid1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractUrls / extractFirstUrl
// ---------------------------------------------------------------------------
describe('extractUrls', () => {
  it('extrait une URL simple', () => {
    const urls = extractUrls('Voir https://example.com pour plus');
    expect(urls).toContain('https://example.com');
  });

  it('extrait plusieurs URLs', () => {
    const urls = extractUrls('https://a.com et https://b.com');
    expect(urls).toHaveLength(2);
  });

  it('déduplique les URLs', () => {
    const urls = extractUrls('https://a.com https://a.com');
    expect(urls).toHaveLength(1);
  });

  it('retourne [] si aucune URL', () => {
    expect(extractUrls('pas d\'url ici')).toEqual([]);
  });

  it('retourne [] si vide', () => {
    expect(extractUrls('')).toEqual([]);
    expect(extractUrls(null)).toEqual([]);
  });
});

describe('extractFirstUrl', () => {
  it('retourne la première URL', () => {
    expect(extractFirstUrl('Voir https://example.com et https://b.com')).toBe('https://example.com');
  });

  it('retourne null si aucune URL', () => {
    expect(extractFirstUrl('aucune url')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Poll helpers
// ---------------------------------------------------------------------------
describe('getPollOptions', () => {
  it('retourne les options valides', () => {
    const poll = { options: [{ id: '1', text: 'A', voterIds: [] }, { id: '2', text: 'B', voterIds: [] }] };
    expect(getPollOptions(poll)).toHaveLength(2);
  });

  it('retourne [] si pas d\'options', () => {
    expect(getPollOptions({})).toEqual([]);
    expect(getPollOptions(null)).toEqual([]);
  });
});

describe('getPollTotalVotes', () => {
  it('compte tous les votes', () => {
    const poll = {
      options: [
        { id: '1', text: 'A', voterIds: ['u1', 'u2'] },
        { id: '2', text: 'B', voterIds: ['u3'] },
      ],
    };
    expect(getPollTotalVotes(poll)).toBe(3);
  });

  it('retourne 0 si vide', () => {
    expect(getPollTotalVotes({})).toBe(0);
  });
});

describe('getPollVotePercentage', () => {
  const poll = {
    options: [
      { id: 'a', text: 'A', voterIds: ['u1', 'u2', 'u3'] },
      { id: 'b', text: 'B', voterIds: ['u4'] },
    ],
  };

  it('calcule le pourcentage correctement', () => {
    expect(getPollVotePercentage(poll, 'a')).toBe(75);
    expect(getPollVotePercentage(poll, 'b')).toBe(25);
  });

  it('retourne 0 si aucun vote', () => {
    expect(getPollVotePercentage({ options: [] }, 'a')).toBe(0);
  });
});

describe('getPollUserVote', () => {
  const poll = {
    options: [
      { id: 'a', text: 'A', voterIds: ['u1'] },
      { id: 'b', text: 'B', voterIds: ['u2'] },
    ],
  };

  it("retourne l'option votée par l'utilisateur", () => {
    expect(getPollUserVote(poll, 'u1')?.id).toBe('a');
  });

  it('retourne null si non voté', () => {
    expect(getPollUserVote(poll, 'u3')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getMessagePreviewLabel
// ---------------------------------------------------------------------------
describe('getMessagePreviewLabel', () => {
  it('retourne "📷 Photo" pour type image', () => {
    expect(getMessagePreviewLabel({ type: 'image' })).toBe('📷 Photo');
  });

  it('retourne "🎬 Vidéo" pour type video', () => {
    expect(getMessagePreviewLabel({ type: 'video' })).toBe('🎬 Vidéo');
  });

  it('retourne "🎤 Message vocal" pour type audio', () => {
    expect(getMessagePreviewLabel({ type: 'audio' })).toBe('🎤 Message vocal');
  });

  it('retourne "Message supprimé" pour type deleted', () => {
    expect(getMessagePreviewLabel({ type: 'deleted' })).toBe('Message supprimé');
  });

  it('retourne le texte tronqué pour type text', () => {
    expect(getMessagePreviewLabel({ type: 'text', text: 'Bonjour' })).toBe('Bonjour');
  });

  it('tronque à 80 chars', () => {
    const longText = 'a'.repeat(100);
    const result = getMessagePreviewLabel({ type: 'text', text: longText });
    expect(result.length).toBeLessThanOrEqual(81);
    expect(result.endsWith('…')).toBe(true);
  });

  it('retourne vide si message null', () => {
    expect(getMessagePreviewLabel(null)).toBe('');
    // Un message vide sans text retourne 'Message' (fallback du code source)
    expect(getMessagePreviewLabel({ type: 'text', text: '' })).toBe('Message');
  });

  it('retourne le label sticker avec emoji', () => {
    expect(getMessagePreviewLabel({ type: 'sticker', sticker: { name: 'MonSticker' } })).toContain('MonSticker');
  });

  it('retourne le texte du sondage avec emoji', () => {
    expect(getMessagePreviewLabel({ type: 'poll', poll: { question: 'Qui?' } })).toContain('Qui?');
  });
});

// ---------------------------------------------------------------------------
// buildReplyReference
// ---------------------------------------------------------------------------
describe('buildReplyReference', () => {
  it('construit une référence valide', () => {
    const msg = {
      id: 'msg1',
      senderId: 'uid1',
      senderSnapshot: { displayName: 'Alice' },
      type: 'text',
      text: 'Bonjour',
    };
    const ref = buildReplyReference(msg);
    expect(ref.messageId).toBe('msg1');
    expect(ref.senderId).toBe('uid1');
    expect(ref.senderName).toBe('Alice');
    expect(ref.type).toBe('text');
    expect(ref.preview).toBe('Bonjour');
  });

  it('gère un message vide sans planter', () => {
    const ref = buildReplyReference({});
    expect(ref.messageId).toBeNull();
    expect(ref.senderName).toBe('Utilisateur');
  });
});

// ---------------------------------------------------------------------------
// getMessageSearchText
// ---------------------------------------------------------------------------
describe('getMessageSearchText', () => {
  it('combine texte, fileName, replyTo.preview, question de sondage', () => {
    const msg = {
      text: 'bonjour',
      fileName: 'doc.pdf',
      replyTo: { preview: 'citation' },
      poll: { question: 'Aimes-tu ça?' },
    };
    const result = getMessageSearchText(msg);
    expect(result).toContain('bonjour');
    expect(result).toContain('doc.pdf');
    expect(result).toContain('citation');
    // getMessageSearchText normalise en minuscules
    expect(result.toLowerCase()).toContain('aimes-tu ça?');
  });

  it('retourne chaîne vide si message vide', () => {
    expect(getMessageSearchText({})).toBe('');
  });
});
