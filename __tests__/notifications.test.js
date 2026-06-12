jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getDevicePushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => {}),
  setNotificationCategoryAsync: jest.fn(async () => {}),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  clearLastNotificationResponseAsync: jest.fn(async () => {}),
  setBadgeCountAsync: jest.fn(async () => true),
  getBadgeCountAsync: jest.fn(async () => 0),
}));

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: { OS: 'android', select: (obj) => obj.android ?? obj.default },
}));

jest.mock('../services/firebase', () => ({
  app: {},
  auth: { currentUser: null },
  db: {},
  firebaseReady: true,
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(async () => {}),
  arrayUnion: jest.fn((...a) => a),
  arrayRemove: jest.fn((...a) => a),
}));

jest.mock('../services/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../services/navigationRef', () => ({
  getActiveChatId: jest.fn(() => null),
  isChatRouteActive: jest.fn(() => false),
  navigateToChat: jest.fn(),
}));

const Notifications = require('expo-notifications');
const {
  getNotificationPermissionStatus,
  registerForPushNotifications,
  unregisterPushToken,
  setQuickReplyHandler,
  bindNotificationNavigation,
  clearBadge,
} = require('../services/notifications');

beforeEach(() => {
  jest.clearAllMocks();
  Notifications.setNotificationChannelAsync.mockResolvedValue(undefined);
  Notifications.setNotificationCategoryAsync.mockResolvedValue(undefined);
  Notifications.addNotificationReceivedListener.mockReturnValue({ remove: jest.fn() });
  Notifications.addNotificationResponseReceivedListener.mockReturnValue({ remove: jest.fn() });
  Notifications.getLastNotificationResponseAsync.mockResolvedValue(null);
});

// ── getNotificationPermissionStatus ──────────────────────────────────────

describe('getNotificationPermissionStatus', () => {
  it('retourne granted=true si permission accordée', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ granted: true, status: 'granted', canAskAgain: false });
    const result = await getNotificationPermissionStatus();
    expect(result.granted).toBe(true);
    expect(result.status).toBe('granted');
  });

  it('retourne granted=false si permission refusée', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'denied', canAskAgain: false });
    const result = await getNotificationPermissionStatus();
    expect(result.granted).toBe(false);
  });

  it('retourne un état sûr en cas d\'erreur', async () => {
    Notifications.getPermissionsAsync.mockRejectedValueOnce(new Error('OS error'));
    const result = await getNotificationPermissionStatus();
    expect(result.granted).toBe(false);
    expect(result.canAskAgain).toBe(true);
    expect(result.status).toBe('undetermined');
  });
});

// ── registerForPushNotifications ─────────────────────────────────────────

describe('registerForPushNotifications', () => {
  beforeEach(() => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true, status: 'granted' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true, status: 'granted' });
    Notifications.getDevicePushTokenAsync.mockResolvedValue({ data: 'token-abc', type: 'fcm' });
  });

  it('retourne null si uid absent', async () => {
    expect(await registerForPushNotifications(null)).toBeNull();
    expect(await registerForPushNotifications(undefined)).toBeNull();
    expect(await registerForPushNotifications('')).toBeNull();
  });

  it('retourne le token natif si tout se passe bien', async () => {
    expect(await registerForPushNotifications('uid1')).toBe('token-abc');
  });

  it('demande les permissions si non accordées initialement', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ granted: true, status: 'granted' });
    const result = await registerForPushNotifications('uid2');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(result).toBe('token-abc');
  });

  it('retourne null si permission définitivement refusée', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'denied' });
    expect(await registerForPushNotifications('uid1')).toBeNull();
  });

  it('retourne null si aucun token natif disponible', async () => {
    Notifications.getDevicePushTokenAsync.mockResolvedValueOnce({ data: null });
    expect(await registerForPushNotifications('uid1')).toBeNull();
  });

  it('retourne null si getDevicePushTokenAsync lève une erreur', async () => {
    Notifications.getDevicePushTokenAsync.mockRejectedValueOnce(new Error('Device error'));
    expect(await registerForPushNotifications('uid1')).toBeNull();
  });

  it('crée les canaux Android lors de l\'inscription (Platform.OS=android)', async () => {
    await registerForPushNotifications('uid1');
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalled();
  });
});

// ── unregisterPushToken ───────────────────────────────────────────────────

describe('unregisterPushToken', () => {
  it('ne plante pas si uid absent', async () => {
    await expect(unregisterPushToken(null)).resolves.toBeUndefined();
  });

  it('ne plante pas si registeredToken est null (jamais enregistré)', async () => {
    await expect(unregisterPushToken('uid1')).resolves.toBeUndefined();
  });
});

// ── setQuickReplyHandler ──────────────────────────────────────────────────

describe('setQuickReplyHandler', () => {
  it('enregistre un handler sans erreur', () => {
    expect(() => setQuickReplyHandler(jest.fn())).not.toThrow();
    expect(() => setQuickReplyHandler(null)).not.toThrow();
  });
});

// ── clearBadge ────────────────────────────────────────────────────────────

describe('clearBadge', () => {
  it('appelle setBadgeCountAsync(0)', async () => {
    Notifications.setBadgeCountAsync.mockResolvedValueOnce(true);
    await clearBadge();
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
  });

  it('ne plante pas si setBadgeCountAsync échoue', async () => {
    Notifications.setBadgeCountAsync.mockRejectedValueOnce(new Error('badge error'));
    await expect(clearBadge()).resolves.toBeUndefined();
  });
});

// ── bindNotificationNavigation ────────────────────────────────────────────

describe('bindNotificationNavigation', () => {
  it('retourne une fonction de nettoyage', () => {
    const cleanup = bindNotificationNavigation();
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('enregistre les deux listeners expo-notifications', () => {
    const cleanup = bindNotificationNavigation();
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    cleanup();
  });

  it('est idempotent (deuxième appel retourne un cleanup)', () => {
    const cleanup1 = bindNotificationNavigation();
    const cleanup2 = bindNotificationNavigation();
    expect(typeof cleanup1).toBe('function');
    expect(typeof cleanup2).toBe('function');
    cleanup1();
  });
});
