import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { viewStory } from '../services/stories';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const STORY_DURATION_MS = 5000;

export default function StoriesScreen({ route, navigation }) {
  const { groups, initialGroupIndex = 0 } = route.params;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const group = groups[groupIndex];
  const story = group?.stories?.[storyIndex] || null;
  const totalStories = group?.stories?.length || 0;

  const advanceStory = useCallback(() => {
    if (storyIndex < totalStories - 1) {
      setStoryIndex((p) => p + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((p) => p + 1);
      setStoryIndex(0);
    } else {
      navigation.goBack();
    }
  }, [groupIndex, groups.length, navigation, storyIndex, totalStories]);

  const goBack = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((p) => p - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((p) => p - 1);
      setStoryIndex(0);
    }
  }, [groupIndex, storyIndex]);

  useEffect(() => {
    if (!story) return undefined;

    progressAnim.setValue(0);

    if (timerRef.current) clearTimeout(timerRef.current);

    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (finished) advanceStory();
    });

    viewStory({ storyId: story.id, viewerId: profile.uid }).catch(() => {});

    return () => {
      anim.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [advanceStory, profile.uid, progressAnim, story]);

  if (!group || !story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Story introuvable.</Text>
      </View>
    );
  }

  const bgColor = story.color || '#1E1E2E';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Progress bars */}
      <View style={styles.progressRow}>
        {group.stories.map((s, i) => (
          <View key={s.id || i} style={styles.progressTrack}>
            {i < storyIndex ? (
              <View style={[styles.progressFill, { width: '100%' }]} />
            ) : i === storyIndex ? (
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={group.authorAvatar ? { uri: group.authorAvatar } : null}
          style={styles.avatar}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{group.authorName}</Text>
          <Text style={styles.storyTime}>
            {new Date(story.createdAtMs).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
      </View>

      {/* Media */}
      {story.mediaUrl ? (
        <Image source={{ uri: story.mediaUrl }} style={styles.media} resizeMode="contain" />
      ) : (
        <View style={styles.textStory}>
          <Text style={styles.storyText}>{story.text}</Text>
        </View>
      )}

      {/* Overlay caption */}
      {story.mediaUrl && story.text ? (
        <View style={styles.caption}>
          <Text style={styles.captionText}>{story.text}</Text>
        </View>
      ) : null}

      {/* Navigation zones */}
      <Pressable style={styles.leftZone} onPress={goBack} />
      <Pressable style={styles.rightZone} onPress={advanceStory} />
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    errorText: {
      color: '#fff',
      marginTop: 100,
      textAlign: 'center',
    },
    progressRow: {
      flexDirection: 'row',
      gap: 4,
      paddingHorizontal: 12,
      paddingTop: 52,
      paddingBottom: 8,
    },
    progressTrack: {
      flex: 1,
      height: 3,
      backgroundColor: 'rgba(255,255,255,0.35)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#fff',
      borderRadius: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingBottom: 10,
      gap: 10,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    authorInfo: {
      flex: 1,
    },
    authorName: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    storyTime: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: 11,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    media: {
      flex: 1,
      width: SCREEN_W,
    },
    textStory: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    storyText: {
      color: '#fff',
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 36,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    caption: {
      position: 'absolute',
      bottom: 48,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    captionText: {
      color: '#fff',
      fontSize: 15,
      textAlign: 'center',
    },
    leftZone: {
      position: 'absolute',
      left: 0,
      top: 100,
      width: SCREEN_W * 0.35,
      bottom: 80,
    },
    rightZone: {
      position: 'absolute',
      right: 0,
      top: 100,
      width: SCREEN_W * 0.65,
      bottom: 80,
    },
  });
