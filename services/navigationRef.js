import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingChatNavigation = null;
let currentRouteName = null;
let currentChatId = null;

const extractActiveRoute = (state) => {
  if (!state?.routes?.length) {
    return null;
  }

  const route = state.routes[state.index ?? 0];
  if (route?.state) {
    return extractActiveRoute(route.state);
  }

  return route || null;
};

export const syncCurrentRoute = () => {
  if (!navigationRef.isReady()) {
    return null;
  }

  const route = extractActiveRoute(navigationRef.getRootState()) || navigationRef.getCurrentRoute();
  currentRouteName = route?.name || null;
  currentChatId = route?.name === 'Chat' ? route?.params?.chatId || null : null;
  return route;
};

const consumePendingNavigation = () => {
  if (!pendingChatNavigation || !navigationRef.isReady()) {
    return false;
  }

  const nextRoute = pendingChatNavigation;
  pendingChatNavigation = null;

  const currentRoute = syncCurrentRoute();
  if (currentRoute?.name === 'Chat' && currentRoute?.params?.chatId === nextRoute.chatId) {
    return true;
  }

  navigationRef.navigate('Chat', nextRoute);
  syncCurrentRoute();
  return true;
};

export const flushPendingNavigation = () => consumePendingNavigation();

export const navigateToChat = (chatId, initialTitle = null) => {
  if (!chatId) return;

  const nextRoute = {
    chatId,
    initialTitle,
  };

  pendingChatNavigation = nextRoute;
  consumePendingNavigation();
};

export const getActiveChatId = () => currentChatId;
export const isChatRouteActive = (chatId) => Boolean(chatId) && currentRouteName === 'Chat' && currentChatId === chatId;
