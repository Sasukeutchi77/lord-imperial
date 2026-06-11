import NetInfo from '@react-native-community/netinfo';

let lastKnownState = true;
const subscribers = new Set();

NetInfo.addEventListener((state) => {
  const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
  lastKnownState = isConnected;
  subscribers.forEach((callback) => callback(isConnected, state));
});

export const subscribeToNetworkStatus = (callback) => {
  subscribers.add(callback);
  callback(lastKnownState, null);
  return () => subscribers.delete(callback);
};

export const getNetworkStatus = async () => {
  const state = await NetInfo.fetch();
  const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
  lastKnownState = isConnected;
  return isConnected;
};

export const getLastKnownNetworkStatus = () => lastKnownState;

export const isNetworkError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === 'unavailable' ||
    error?.code === 'deadline-exceeded' ||
    error?.code === 'failed-precondition' ||
    error?.code === 'resource-exhausted' ||
    error?.code === 'network-request-failed' ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('timed out')
  );
};
