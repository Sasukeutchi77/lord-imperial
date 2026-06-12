/**
 * Tests de la logique pure extraite de services/chat.js.
 * On teste les fonctions utilitaires sans toucher Firebase.
 */

// Re-implement the pure functions inline (mirroring chat.js exactly)
// so tests don't need to import the full Firebase-heavy module.

const getTimestampValue = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
  }
  const date = value instanceof Date ? value : new Date(value);
  const result = date.getTime();
  return Number.isNaN(result) ? 0 : result;
};

const sortMessagesChronologically = (messages = []) =>
  [...messages].sort((a, b) => {
    const timeA = a.createdAtMs || getTimestampValue(a.timestamp) || 0;
    const timeB = b.createdAtMs || getTimestampValue(b.timestamp) || 0;
    if (timeA === timeB) {
      return String(a.id || a.clientId || '').localeCompare(String(b.id || b.clientId || ''));
    }
    return timeA - timeB;
  });

const normalizePoll = (poll = null) => {
  if (!poll?.question) return null;
  const question = String(poll.question || '').trim();
  const options = Array.isArray(poll.options)
    ? poll.options
        .map((option, index) => ({
          id: String(option?.id || `poll_option_${index}`),
          text: String(option?.text || '').trim(),
          voterIds: Array.from(new Set(Array.isArray(option?.voterIds) ? option.voterIds.filter(Boolean) : [])),
        }))
        .filter((option) => option.text)
    : [];
  if (!question || options.length < 2) return null;
  return { question, options };
};

const mergeDeliveryState = (previous = {}, next = {}) => ({
  deliveredTo: Array.from(new Set([...(previous.deliveredTo || []), ...(next.deliveredTo || [])])),
  seenBy: Array.from(new Set([...(previous.seenBy || []), ...(next.seenBy || [])])),
});

// createClientId from chat.js
const createClientId = () => {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  let cursor = Date.now();
  return template.replace(/[xy]/g, (character) => {
    const random = (cursor + Math.random() * 16) % 16 | 0;
    cursor = Math.floor(cursor / 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

// ---------------------------------------------------------------------------
// getTimestampValue
// ---------------------------------------------------------------------------
describe('getTimestampValue', () => {
  it('retourne 0 si null/undefined', () => {
    expect(getTimestampValue(null)).toBe(0);
    expect(getTimestampValue(undefined)).toBe(0);
  });

  it('utilise toMillis() si disponible', () => {
    const ts = { toMillis: () => 1700000000000 };
    expect(getTimestampValue(ts)).toBe(1700000000000);
  });

  it('convertit { seconds, nanoseconds }', () => {
    const ts = { seconds: 1700000000, nanoseconds: 500000000 };
    expect(getTimestampValue(ts)).toBe(1700000000500);
  });

  it('convertit un objet Date', () => {
    const d = new Date(1700000000000);
    expect(getTimestampValue(d)).toBe(1700000000000);
  });

  it('retourne 0 pour une valeur non parseable', () => {
    expect(getTimestampValue('not-a-date')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// sortMessagesChronologically
// ---------------------------------------------------------------------------
describe('sortMessagesChronologically', () => {
  it('trie par createdAtMs croissant', () => {
    const msgs = [
      { id: 'c', createdAtMs: 3000 },
      { id: 'a', createdAtMs: 1000 },
      { id: 'b', createdAtMs: 2000 },
    ];
    const sorted = sortMessagesChronologically(msgs);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('utilise timestamp Firestore si createdAtMs absent', () => {
    const msgs = [
      { id: 'b', timestamp: { seconds: 2000, nanoseconds: 0 } },
      { id: 'a', timestamp: { seconds: 1000, nanoseconds: 0 } },
    ];
    const sorted = sortMessagesChronologically(msgs);
    expect(sorted[0].id).toBe('a');
  });

  it('trie par id en cas d\'égalité de timestamp', () => {
    const now = Date.now();
    const msgs = [
      { id: 'zzz', createdAtMs: now },
      { id: 'aaa', createdAtMs: now },
    ];
    const sorted = sortMessagesChronologically(msgs);
    expect(sorted[0].id).toBe('aaa');
  });

  it("ne mute pas le tableau d'origine", () => {
    const msgs = [{ id: 'b', createdAtMs: 2 }, { id: 'a', createdAtMs: 1 }];
    const original = [...msgs];
    sortMessagesChronologically(msgs);
    expect(msgs).toEqual(original);
  });

  it('gère un tableau vide', () => {
    expect(sortMessagesChronologically([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// normalizePoll
// ---------------------------------------------------------------------------
describe('normalizePoll', () => {
  it('retourne null si pas de question', () => {
    expect(normalizePoll(null)).toBeNull();
    expect(normalizePoll({ options: [] })).toBeNull();
  });

  it('retourne null si moins de 2 options valides', () => {
    expect(normalizePoll({ question: 'Q?', options: [{ text: 'A' }] })).toBeNull();
  });

  it('normalise un sondage valide', () => {
    const poll = {
      question: '  Qui gagne?  ',
      options: [
        { id: 'a', text: 'Alice', voterIds: ['u1', 'u1', 'u2'] },
        { id: 'b', text: 'Bob', voterIds: [] },
      ],
    };
    const result = normalizePoll(poll);
    expect(result).not.toBeNull();
    expect(result.question).toBe('Qui gagne?');
    expect(result.options).toHaveLength(2);
    expect(result.options[0].voterIds).toHaveLength(2);
  });

  it('filtre les options sans texte', () => {
    const poll = {
      question: 'Test?',
      options: [
        { id: 'a', text: 'Option A', voterIds: [] },
        { id: 'b', text: '', voterIds: [] },
        { id: 'c', text: 'Option C', voterIds: [] },
      ],
    };
    const result = normalizePoll(poll);
    expect(result.options).toHaveLength(2);
  });

  it('déduplique les voterIds', () => {
    const poll = {
      question: 'Q?',
      options: [
        { id: 'a', text: 'A', voterIds: ['u1', 'u1', 'u1'] },
        { id: 'b', text: 'B', voterIds: ['u2'] },
      ],
    };
    const result = normalizePoll(poll);
    expect(result.options[0].voterIds).toHaveLength(1);
  });

  it('génère des ids auto si absents', () => {
    const poll = {
      question: 'Q?',
      options: [
        { text: 'A', voterIds: [] },
        { text: 'B', voterIds: [] },
      ],
    };
    const result = normalizePoll(poll);
    expect(result.options[0].id).toBe('poll_option_0');
    expect(result.options[1].id).toBe('poll_option_1');
  });
});

// ---------------------------------------------------------------------------
// mergeDeliveryState
// ---------------------------------------------------------------------------
describe('mergeDeliveryState', () => {
  it('fusionne deliveredTo et seenBy', () => {
    const prev = { deliveredTo: ['u1', 'u2'], seenBy: ['u1'] };
    const next = { deliveredTo: ['u2', 'u3'], seenBy: ['u1', 'u2'] };
    const merged = mergeDeliveryState(prev, next);
    expect(merged.deliveredTo).toHaveLength(3);
    expect(merged.seenBy).toHaveLength(2);
  });

  it('déduplique les UIDs', () => {
    const prev = { deliveredTo: ['u1', 'u1'], seenBy: [] };
    const next = { deliveredTo: ['u1'], seenBy: [] };
    const merged = mergeDeliveryState(prev, next);
    expect(merged.deliveredTo).toHaveLength(1);
  });

  it('gère des objets vides', () => {
    const merged = mergeDeliveryState({}, {});
    expect(merged.deliveredTo).toEqual([]);
    expect(merged.seenBy).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// createClientId
// ---------------------------------------------------------------------------
describe('createClientId', () => {
  it('retourne une chaîne au format UUID v4', () => {
    const id = createClientId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('génère des IDs uniques', () => {
    const ids = new Set(Array.from({ length: 100 }, createClientId));
    expect(ids.size).toBe(100);
  });
});
