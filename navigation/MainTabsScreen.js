import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAppTheme } from '../utils/theme';

const tabs = [
  { key: 'groups', label: 'Groupes', icon: 'people' },
  { key: 'channels', label: 'Chaînes', icon: 'megaphone' },
  { key: 'contacts', label: 'Contact', icon: 'person' },
  { key: 'profile', label: 'Profil', icon: 'person-circle' },
];

function TabItem({ tab, active, onPress }) {
  const theme = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
    onPress(tab.key);
  }, [onPress, tab.key, scaleAnim]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.tabItem,
        active && { backgroundColor: theme.colors.primary },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center', gap: 3 }}>
        <Ionicons
          name={active ? tab.icon : `${tab.icon}-outline`}
          size={21}
          color={active ? theme.colors.background : theme.colors.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            active && styles.tabLabelActive,
            active && { color: theme.colors.background },
            !active && { color: theme.colors.textMuted },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function MainTabsScreen({ navigation }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.bottom), [theme, insets.bottom]);
  const [activeTab, setActiveTab] = useState('groups');

  const handleTabPress = useCallback((key) => setActiveTab(key), []);

  return (
    <View style={styles.root}>
      <View style={styles.scene}>
        {activeTab === 'groups' ? <HomeScreen navigation={navigation} mode="groups" /> : null}
        {activeTab === 'channels' ? <HomeScreen navigation={navigation} mode="channels" /> : null}
        {activeTab === 'contacts' ? <HomeScreen navigation={navigation} mode="contacts" /> : null}
        {activeTab === 'profile' ? <ProfileScreen /> : null}
      </View>

      <View style={styles.tabBarWrap}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TabItem
              key={tab.key}
              tab={tab}
              active={activeTab === tab.key}
              onPress={handleTabPress}
            />
          ))}
          <Pressable
            style={styles.searchTab}
            onPress={() => navigation.navigate('GlobalSearch')}
          >
            <Animated.View style={{ alignItems: 'center', gap: 3 }}>
              <Ionicons name="search-outline" size={21} color={theme.colors.textMuted} />
              <Text style={[styles.tabLabel, { color: theme.colors.textMuted }]}>Chercher</Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  searchTab: {
    flex: 1,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});

const createStyles = (theme, bottomInset) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scene: {
      flex: 1,
    },
    tabBarWrap: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: Math.max(12, bottomInset + 8),
      alignItems: 'center',
    },
    tabBar: {
      width: '100%',
      minHeight: 66,
      borderRadius: 34,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      padding: 5,
      shadowColor: '#000',
      shadowOpacity: 0.45,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 16,
    },
  });
