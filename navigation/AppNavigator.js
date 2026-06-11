import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';
import { usePresence } from '../hooks/usePresence';
import { firebaseReady } from '../services/firebase';
import { initializeChatSync, flushOfflineQueue } from '../services/chat';
import { bindNotificationNavigation, registerForPushNotifications, setQuickReplyHandler } from '../services/notifications';
import { sendTextMessage } from '../services/chat';
import { subscribeToNetworkStatus } from '../services/network';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UsernameSetupScreen from '../screens/UsernameSetupScreen';
import MainTabsScreen from './MainTabsScreen';
import SearchUsersScreen from '../screens/SearchUsersScreen';
import ChatScreen from '../screens/ChatScreen';
import GroupScreen from '../screens/GroupScreen';
import ChannelScreen from '../screens/ChannelScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FirebaseSetupScreen from '../screens/FirebaseSetupScreen';
import ManageMembersScreen from '../screens/ManageMembersScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import GalleryScreen from '../screens/GalleryScreen';
import GlobalSearchScreen from '../screens/GlobalSearchScreen';
import StoriesScreen from '../screens/StoriesScreen';
import JoinChatScreen from '../screens/JoinChatScreen';

const Stack = createNativeStackNavigator();

function AuthStack({ screenOptions }) {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Créer un compte' }} />
    </Stack.Navigator>
  );
}

function MainStack({ screenOptions }) {
  const { firebaseUser, profile } = useAuth();
  usePresence(firebaseUser?.uid);

  useEffect(() => {
    if (!firebaseUser?.uid) return undefined;

    const unsubscribeSync = initializeChatSync(firebaseUser.uid);
    const unsubscribeNotifications = bindNotificationNavigation();
    registerForPushNotifications(firebaseUser.uid).catch(() => {});

    setQuickReplyHandler(async ({ chatId, text }) => {
      if (!profile) return;
      try {
        await sendTextMessage({ chatId, sender: profile, text });
      } catch (_err) {}
    });

    const unsubscribeNetwork = subscribeToNetworkStatus((isOnline) => {
      if (isOnline && firebaseUser?.uid) {
        flushOfflineQueue({ uid: firebaseUser.uid }).catch(() => {});
      }
    });

    return () => {
      unsubscribeSync?.();
      unsubscribeNotifications?.();
      unsubscribeNetwork?.();
    };
  }, [firebaseUser?.uid, profile]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={MainTabsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SearchUsers" component={SearchUsersScreen} options={{ title: 'Trouver un utilisateur' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversation' }} />
      <Stack.Screen name="Group" component={GroupScreen} options={{ title: 'Nouveau groupe' }} />
      <Stack.Screen name="Channel" component={ChannelScreen} options={{ title: 'Nouveau canal' }} />
      <Stack.Screen name="ManageMembers" component={ManageMembersScreen} options={{ title: 'Membres & rôles' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profil public' }} />
      <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: 'Médias partagés' }} />
      <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} options={{ title: 'Recherche' }} />
      <Stack.Screen name="Stories" component={StoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JoinChat" component={JoinChatScreen} options={{ title: 'Rejoindre' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, firebaseUser, hasUsername } = useAuth();

  const screenOptions = useMemo(
    () => ({
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerShadowVisible: false,
      headerTitleStyle: {
        color: theme.colors.text,
        fontWeight: '800',
      },
      headerTintColor: theme.colors.text,
      contentStyle: {
        backgroundColor: theme.colors.background,
      },
    }),
    [theme]
  );

  if (!firebaseReady) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="FirebaseSetup" component={FirebaseSetupScreen} options={{ title: 'Configurer Firebase' }} />
      </Stack.Navigator>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!firebaseUser) {
    return <AuthStack screenOptions={screenOptions} />;
  }

  if (!hasUsername) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} options={{ title: 'Choisir un pseudo' }} />
      </Stack.Navigator>
    );
  }

  return <MainStack screenOptions={screenOptions} />;
}

const createStyles = (theme) =>
  StyleSheet.create({
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
  });
