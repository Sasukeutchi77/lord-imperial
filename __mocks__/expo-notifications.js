const AndroidImportance = { HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0 };
const AndroidNotificationVisibility = { PUBLIC: 1, PRIVATE: 0, SECRET: -1 };

module.exports = {
  AndroidImportance,
  AndroidNotificationVisibility,
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: false })),
  getDevicePushTokenAsync: jest.fn(async () => ({ data: 'mock-push-token', type: 'fcm' })),
  setNotificationChannelAsync: jest.fn(async () => {}),
  setNotificationCategoryAsync: jest.fn(async () => {}),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  clearLastNotificationResponseAsync: jest.fn(async () => {}),
  setBadgeCountAsync: jest.fn(async () => true),
  getBadgeCountAsync: jest.fn(async () => 0),
  dismissAllNotificationsAsync: jest.fn(async () => {}),
  scheduleNotificationAsync: jest.fn(async () => 'mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => {}),
};
