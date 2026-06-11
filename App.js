import React, { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';
import { AuthProvider } from './context/AuthContext';
import AppErrorBoundary from './components/AppErrorBoundary';
import { flushPendingNavigation, navigationRef, syncCurrentRoute } from './services/navigationRef';
import { setupGlobalErrorHandling } from './services/errorHandling';
import { useAppTheme } from './utils/theme';

function AppShell() {
  const theme = useAppTheme();

  const navTheme = useMemo(
    () => ({
      ...(theme.isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
        background: theme.colors.background,
        card: theme.colors.surface,
        primary: theme.colors.primary,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
    }),
    [theme]
  );

  const linking = useMemo(
    () => ({
      prefixes: ['lordimperial://'],
      async getInitialURL() {
        return Linking.getInitialURL();
      },
      subscribe(listener) {
        const subscription = Linking.addEventListener('url', ({ url }) => listener(url));
        return () => subscription.remove();
      },
      config: {
        screens: {
          Home: '',
          Chat: 'chat/:chatId',
          SearchUsers: 'search',
          Group: 'group',
          Channel: 'channel',
          ManageMembers: 'chat/:chatId/manage',
          Profile: 'profile',
          GlobalSearch: 'search/global',
          JoinChat: 'join/:code',
          Gallery: 'chat/:chatId/gallery',
        },
      },
    }),
    []
  );

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      linking={linking}
      onReady={() => {
        syncCurrentRoute();
        flushPendingNavigation();
      }}
      onStateChange={syncCurrentRoute}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const cleanupErrors = setupGlobalErrorHandling();
    const timer = setTimeout(() => setBooting(false), 400);

    return () => {
      clearTimeout(timer);
      cleanupErrors?.();
    };
  }, []);

  if (booting) {
    return <SplashScreen />;
  }

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
