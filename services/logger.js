import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_KEY = '@lord-imperial/logs';
const MAX_LOGS = 200;

const buildEntry = (level, message, meta = {}) => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  level,
  message,
  meta,
  createdAt: new Date().toISOString(),
});

const persistEntry = async (entry) => {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const next = [entry, ...current].slice(0, MAX_LOGS);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(next));
  } catch (_error) {
    // Les logs ne doivent jamais faire échouer l'app
  }
};

export const logger = {
  async info(message, meta = {}) {
    const entry = buildEntry('info', message, meta);
    console.log(`[info] ${message}`, meta);
    await persistEntry(entry);
  },
  async warn(message, meta = {}) {
    const entry = buildEntry('warn', message, meta);
    console.warn(`[warn] ${message}`, meta);
    await persistEntry(entry);
  },
  async error(message, meta = {}) {
    const entry = buildEntry('error', message, meta);
    console.error(`[error] ${message}`, meta);
    await persistEntry(entry);
  },
};

export const getRecentLogs = async () => {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
};
