const mockStore = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key) => mockStore.get(key) ?? null),
  setItem: jest.fn(async (key, value) => { mockStore.set(key, value); }),
  removeItem: jest.fn(async (key) => { mockStore.delete(key); }),
  clear: jest.fn(async () => { mockStore.clear(); }),
  getAllKeys: jest.fn(async () => Array.from(mockStore.keys())),
  multiGet: jest.fn(async (keys) => keys.map((k) => [k, mockStore.get(k) ?? null])),
  multiSet: jest.fn(async (pairs) => { pairs.forEach(([k, v]) => mockStore.set(k, v)); }),
  multiRemove: jest.fn(async (keys) => { keys.forEach((k) => mockStore.delete(k)); }),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const store = require('../services/offlineStore');

const UID = 'uid1';

const makeMsg = (id, extra = {}) => ({
  id,
  clientId: id,
  senderId: UID,
  text: `hello ${id}`,
  type: 'text',
  createdAtMs: Date.now(),
  status: 'sent',
  localOnly: false,
  delivery: { deliveredTo: [], seenBy: [] },
  ...extra,
});

const makeChat = (id, title = 'Chat') => ({
  id,
  title,
  type: 'private',
  members: [UID, 'uid2'],
  updatedAtMs: Date.now(),
});

beforeEach(() => {
  mockStore.clear();
  jest.clearAllMocks();
});

// ── messageStore (mémoire) ────────────────────────────────────────────────

describe('offlineStore — messageStore (mémoire)', () => {
  const CHAT_ID = 'chat_msgs';

  it('getMemoryMessages retourne [] si rien', () => {
    expect(store.getMemoryMessages(CHAT_ID)).toEqual([]);
  });

  it('mergeCachedMessages ajoute des messages', async () => {
    await store.mergeCachedMessages(CHAT_ID, [makeMsg('m1'), makeMsg('m2')]);
    expect(store.getMemoryMessages(CHAT_ID)).toHaveLength(2);
  });

  it('mergeCachedMessages déduplique par id/clientId', async () => {
    await store.saveCachedMessages(CHAT_ID, [makeMsg('m1', { text: 'a' })]);
    await store.mergeCachedMessages(CHAT_ID, [makeMsg('m1', { text: 'b' })]);
    expect(store.getMemoryMessages(CHAT_ID)).toHaveLength(1);
  });

  it('patchCachedMessage modifie un champ existant', async () => {
    await store.saveCachedMessages(CHAT_ID, [makeMsg('m1')]);
    await store.patchCachedMessage(CHAT_ID, 'm1', { status: 'seen' });
    const result = store.getMemoryMessages(CHAT_ID).find((m) => m.id === 'm1');
    expect(result?.status).toBe('seen');
  });

  it('patchCachedMessage ne plante pas si message introuvable', async () => {
    await expect(store.patchCachedMessage(CHAT_ID, 'nonexistent', { status: 'seen' })).resolves.not.toThrow();
  });

  it('retourne les messages dans l\'ordre chronologique', async () => {
    const now = Date.now();
    await store.saveCachedMessages(CHAT_ID, [
      makeMsg('m2', { createdAtMs: now + 200 }),
      makeMsg('m1', { createdAtMs: now + 100 }),
      makeMsg('m3', { createdAtMs: now + 300 }),
    ]);
    const ids = store.getMemoryMessages(CHAT_ID).map((m) => m.id);
    expect(ids).toEqual(['m1', 'm2', 'm3']);
  });
});

// ── chatStore (mémoire) ───────────────────────────────────────────────────

describe('offlineStore — chatStore (mémoire)', () => {
  it('getMemoryChats retourne [] si rien', () => {
    expect(store.getMemoryChats(UID)).toEqual([]);
  });

  it('mergeCachedChats ajoute des conversations (uid membre)', async () => {
    await store.mergeCachedChats(UID, [makeChat('c1'), makeChat('c2')]);
    expect(store.getMemoryChats(UID)).toHaveLength(2);
  });

  it('mergeCachedChats fusionne sans dupliquer', async () => {
    await store.saveCachedChats(UID, [makeChat('c1', 'Titre A')]);
    await store.mergeCachedChats(UID, [makeChat('c1', 'Titre B')]);
    const chats = store.getMemoryChats(UID);
    expect(chats).toHaveLength(1);
    expect(chats[0].title).toBe('Titre B');
  });

  it('ignore les chats dont uid n\'est pas membre', async () => {
    const UID_NOUVEAU = 'uid_filtre_test';
    const chatAutre = { id: 'c_autre', title: 'Chat Autre', type: 'private', members: ['uid9', 'uid8'], updatedAtMs: Date.now() };
    await store.mergeCachedChats(UID_NOUVEAU, [chatAutre]);
    expect(store.getMemoryChats(UID_NOUVEAU)).toHaveLength(0);
  });
});

// ── persistance AsyncStorage ─────────────────────────────────────────────

describe('offlineStore — persistance AsyncStorage', () => {
  it('saveCachedMessages déclenche un setItem', async () => {
    await store.saveCachedMessages('chat_p', [makeMsg('x1')]);
    await new Promise((r) => setTimeout(r, 450));
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('getCachedProfile retourne null si clé absente', async () => {
    expect(await store.getCachedProfile('uid_missing')).toBeNull();
  });

  it('getCachedProfile lit la valeur depuis AsyncStorage', async () => {
    const uid = 'uid_read';
    const key = `@lord-imperial/profile_${uid}`;
    mockStore.set(key, JSON.stringify({ uid, displayName: 'Alice' }));
    const result = await store.getCachedProfile(uid);
    expect(result?.displayName).toBe('Alice');
  });

  it('getCachedProfile retourne null si JSON corrompu', async () => {
    const uid = 'uid_corrupt';
    const key = `@lord-imperial/profile_${uid}`;
    mockStore.set(key, '{bad json{{');
    const result = await store.getCachedProfile(uid);
    expect(result).toBeNull();
  });
});

// ── limite MAX_MESSAGES_PER_CHAT ─────────────────────────────────────────

describe('offlineStore — limite MAX_MESSAGES_PER_CHAT (250)', () => {
  it('ne garde pas plus de 250 messages par chat', async () => {
    const CHAT_ID = 'chat_big';
    const msgs = Array.from({ length: 300 }, (_, i) =>
      makeMsg(`m${i}`, { createdAtMs: Date.now() + i })
    );
    await store.saveCachedMessages(CHAT_ID, msgs);
    expect(store.getMemoryMessages(CHAT_ID).length).toBeLessThanOrEqual(250);
  });
});
