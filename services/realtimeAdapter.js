export const realtimeAdapters = {
  firebase: {
    name: 'firebase',
    transport: 'firestore',
    supportsOfflineQueue: true,
  },
  websocket: {
    name: 'websocket',
    transport: 'socket.io',
    supportsOfflineQueue: true,
    status: 'planned',
  },
};

let activeRealtimeAdapter = realtimeAdapters.firebase;

export const getRealtimeAdapter = () => activeRealtimeAdapter;

export const setRealtimeAdapter = (adapterName) => {
  if (realtimeAdapters[adapterName]) {
    activeRealtimeAdapter = realtimeAdapters[adapterName];
  }
  return activeRealtimeAdapter;
};
