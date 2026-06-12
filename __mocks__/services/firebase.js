const mockDoc = jest.fn();
const mockSetDoc = jest.fn(async () => {});
const mockUpdateDoc = jest.fn(async () => {});
const mockGetDoc = jest.fn(async () => ({ exists: () => false, data: () => null }));
const mockOnSnapshot = jest.fn(() => jest.fn());
const mockCollection = jest.fn();
const mockQuery = jest.fn((...args) => args);
const mockWhere = jest.fn((...args) => args);
const mockOrderBy = jest.fn((...args) => args);
const mockLimit = jest.fn((...args) => args);
const mockGetDocs = jest.fn(async () => ({ docs: [], empty: true }));

module.exports = {
  app: {},
  auth: { currentUser: null },
  db: {},
  firebaseReady: true,
  firebaseConfigError: '',
  firebaseProjectInfo: 'lord-15ca8',
};
