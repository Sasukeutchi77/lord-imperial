import React, { memo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CUSTOM_EMOJI_CATEGORIES, getCustomEmojiSource, toEmojiCode } from '../utils/customEmojis';
import { useAppTheme } from '../utils/theme';

function CustomEmojiPanel({ onPickEmoji }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const [activeCategory, setActiveCategory] = useState(0);

  const handlePick = (id) => {
    onPickEmoji(toEmojiCode(id));
  };

  const currentCategory = CUSTOM_EMOJI_CATEGORIES[activeCategory];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primaryStrong, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
        <Text style={styles.headerTitle}>LORD IMPERIAL</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>50 émojis exclusifs</Text>
        </View>
      </LinearGradient>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {CUSTOM_EMOJI_CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat.title}
            onPress={() => setActiveCategory(i)}
            style={[styles.tab, activeCategory === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeCategory === i && styles.tabTextActive]}>
              {cat.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Emoji grid */}
      <ScrollView
        style={styles.grid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        <View style={styles.gridRow}>
          {currentCategory.emojis.map((id) => {
            const source = getCustomEmojiSource(id);
            return (
              <Pressable
                key={id}
                onPress={() => handlePick(id)}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              >
                {source ? (
                  <Image source={source} style={styles.emojiImage} resizeMode="contain" />
                ) : null}
                <Text style={styles.chipLabel} numberOfLines={1}>
                  {id.replace('li_', '').replace(/_/g, ' ')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(CustomEmojiPanel);

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 13,
      letterSpacing: 0.5,
    },
    headerBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 99,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 4,
    },
    headerBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    tabs: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabsContent: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 6,
    },
    tab: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 99,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    grid: {
      maxHeight: 200,
    },
    gridContent: {
      padding: 10,
    },
    gridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      alignItems: 'center',
      width: 62,
      padding: 6,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipPressed: {
      backgroundColor: 'rgba(201,149,107,0.15)',
      borderColor: theme.colors.primary,
    },
    emojiImage: {
      width: 36,
      height: 36,
    },
    chipLabel: {
      color: theme.colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 3,
    },
  });
