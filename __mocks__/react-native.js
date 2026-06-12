module.exports = {
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios ?? obj.default),
  },
  Alert: {
    alert: jest.fn(),
  },
};
