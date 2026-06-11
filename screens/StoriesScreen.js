import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import {
  addStoryComment,
  likeStory,
  subscribeToStoryComments,
  viewStory,
} from '../services/stories';

const { width: SCREEN_W } = Dimensions.get('window');
const STORY_DURATION_MS = 5000;

export default function StoriesScreen({ route, navigation }) {
  const { groups, initialGroupIndex = 0 } = route.params;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentAnimRef = useRef(null);
  const isPaused = useRef(false);

  const [likedMap, setLikedMap] = useState({});
  const [likeCountMap, setLikeCountMap] = useState({});
  const likeScaleAnim = useRef(new Animated.Value(1)).current;

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [sendingComment, setSendingComment] = useState(false);
  const commentInputRef = useRef(null);
  const commentsListRef = useRef(null);

  const group = groups[groupIndex];
  const story = group?.stories?.[storyIndex] || null;
  const totalStories = group?.stories?.length || 0;
  const isOwner = story?.authorId === profile?.uid;

  const liked = story ? Boolean(likedMap[story.id] ?? story.likedBy?.includes(profile.uid)) : false;
  const likeCount = story
    ? (likeCountMap[story.id] !== undefined ? likeCountMap[story.id] : (story.likedBy?.length || 0))
    : 0;

  const stopTimer = useCallback(() => {
    currentAnimRef.current?.stop();
    isPaused.current = true;
  }, []);

  const startTimer = useCallback(
    (fromValue = null) => {
      isPaused.current = false;
      if (fromValue !== null) progressAnim.setValue(fromValue);
      const anim = Animated.timing(progressAnim, {
        toValue: 1,
        duration: STORY_DURATION_MS * (1 - progressAnim.__getValue()),
        useNativeDriver: false,
      });
      currentAnimRef.current = anim;
      anim.start(({ finished }) => {
        if (finished && !isPaused.current) advanceStory();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressAnim]
  );

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

  const goBackStory = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((p) => p - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((p) => p - 1);
      setStoryIndex(0);
    }
  }, [groupIndex, storyIndex]);

  // Story change effect
  useEffect(() => {
    if (!story) return undefined;

    setComments([]);
    setShowComments(false);
    setCommentText('');
    isPaused.current = false;
    progressAnim.setValue(0);

    if (story.likedBy) {
      setLikedMap((prev) => ({ ...prev, [story.id]: story.likedBy.includes(profile.uid) }));
      setLikeCountMap((prev) => ({ ...prev, [story.id]: story.likedBy.length }));
    }

    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });
    currentAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished && !isPaused.current) advanceStory();
    });

    viewStory({ storyId: story.id, viewerId: profile.uid }).catch(() => {});

    return () => {
      currentAnimRef.current?.stop();
    };
  }, [story?.id, groupIndex, storyIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Comments subscription
  useEffect(() => {
    if (!story?.id || !showComments) return undefined;
    return subscribeToStoryComments({ storyId: story.id, callback: setComments });
  }, [story?.id, showComments]);

  const handleLike = useCallback(async () => {
    if (!story) return;
    const prevLiked = likedMap[story.id] ?? story.likedBy?.includes(profile.uid) ?? false;
    const prevCount = likeCountMap[story.id] ?? story.likedBy?.length ?? 0;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLikedMap((prev) => ({ ...prev, [story.id]: nextLiked }));
    setLikeCountMap((prev) => ({ ...prev, [story.id]: nextCount }));

    Animated.sequence([
      Animated.timing(likeScaleAnim, { toValue: 1.5, duration: 100, useNativeDriver: true }),
      Animated.timing(likeScaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    try {
      await likeStory({ storyId: story.id, story, viewer: profile });
    } catch (_) {
      setLikedMap((prev) => ({ ...prev, [story.id]: prevLiked }));
      setLikeCountMap((prev) => ({ ...prev, [story.id]: prevCount }));
    }
  }, [story, likedMap, likeCountMap, profile, likeScaleAnim]);

  const handleOpenComments = useCallback(() => {
    stopTimer();
    setShowComments(true);
    setTimeout(() => commentInputRef.current?.focus(), 350);
  }, [stopTimer]);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
    setCommentText('');
    // Resume from current progress
    isPaused.current = false;
    const remaining = 1 - progressAnim.__getValue();
    if (remaining > 0.02) {
      const anim = Animated.timing(progressAnim, {
        toValue: 1,
        duration: STORY_DURATION_MS * remaining,
        useNativeDriver: false,
      });
      currentAnimRef.current = anim;
      anim.start(({ finished }) => {
        if (finished && !isPaused.current) advanceStory();
      });
    } else {
      advanceStory();
    }
  }, [progressAnim, advanceStory]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || !story || sendingComment) return;
    const textToSend = commentText.trim();
    setCommentText('');
    setSendingComment(true);
    try {
      await addStoryComment({ storyId: story.id, story, author: profile, text: textToSend });
      setTimeout(() => commentsListRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (_) {
      setCommentText(textToSend);
    } finally {
      setSendingComment(false);
    }
  }, [commentText, story, profile, sendingComment]);

  if (!group || !story) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Story introuvable.</Text>
      </View>
    );
  }

  const bgColor = story.color || '#1E1E2E';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
        {group.authorAvatar ? (
          <Image source={{ uri: group.authorAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{(group.authorName || '?').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{group.authorName}</Text>
          <Text style={styles.storyTime}>
            {new Date(story.createdAtMs).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
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

      {/* Navigation touch zones (hidden when comments open) */}
      {!showComments ? (
        <>
          <Pressable style={styles.leftZone} onPress={goBackStory} />
          <Pressable style={styles.rightZone} onPress={advanceStory} />
        </>
      ) : null}

      {/* Bottom action bar */}
      {!showComments ? (
        <View style={styles.actionBar}>
          {/* Like button */}
          <Pressable onPress={handleLike} style={styles.actionBtn} hitSlop={8}>
            <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={28}
                color={liked ? '#FF4D6D' : '#fff'}
              />
            </Animated.View>
            {likeCount > 0 ? (
              <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>{likeCount}</Text>
            ) : null}
          </Pressable>

          {/* Comment button — visible to everyone */}
          <Pressable onPress={handleOpenComments} style={styles.actionBtn} hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={26} color="#fff" />
          </Pressable>

          {/* View count (owner only) */}
          {isOwner ? (
            <View style={styles.actionBtn}>
              <Ionicons name="eye-outline" size={22} color="rgba(255,255,255,0.65)" />
              <Text style={styles.actionCountMuted}>{story.viewedBy?.length || 0}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Comments panel */}
      {showComments ? (
        <View style={styles.commentsPanel}>
          {/* Panel header */}
          <View style={styles.commentsPanelHeader}>
            <Text style={styles.commentsPanelTitle}>Commentaires</Text>
            <Pressable onPress={handleCloseComments} hitSlop={10}>
              <Ionicons name="chevron-down" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Comments list */}
          <FlatList
            ref={commentsListRef}
            data={comments}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.commentsEmpty}>
                <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.textMuted} />
                <Text style={styles.commentsEmptyText}>Soyez le premier à commenter</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                {item.authorAvatar ? (
                  <Image source={{ uri: item.authorAvatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={[styles.commentAvatar, styles.commentAvatarPlaceholder]}>
                    <Text style={styles.commentAvatarInitial}>
                      {(item.authorName || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.commentBody}>
                  <Text style={styles.commentAuthor}>{item.authorName}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              </View>
            )}
          />

          {/* Comment input */}
          <View style={styles.commentInputRow}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Écrire un commentaire…"
              placeholderTextColor={theme.colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
              blurOnSubmit
            />
            <Pressable
              onPress={handleSendComment}
              style={[styles.sendBtn, (!commentText.trim() || sendingComment) && styles.sendBtnDisabled]}
              disabled={!commentText.trim() || sendingComment}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
    },
    emptyText: {
      color: '#fff',
      fontSize: 16,
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
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
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
      bottom: 100,
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
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 36,
      paddingTop: 12,
      gap: 20,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    actionCount: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    actionCountLiked: {
      color: '#FF4D6D',
    },
    actionCountMuted: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13,
    },
    commentsPanel: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '65%',
      paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    },
    commentsPanelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    commentsPanelTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    commentsList: {
      maxHeight: 260,
    },
    commentsListContent: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 12,
    },
    commentsEmpty: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 8,
    },
    commentsEmptyText: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    commentItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceMuted,
      flexShrink: 0,
    },
    commentAvatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    commentAvatarInitial: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    commentBody: {
      flex: 1,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    commentAuthor: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 2,
    },
    commentText: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 19,
    },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 14,
      paddingTop: 10,
      gap: 10,
    },
    commentInput: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: theme.colors.text,
      fontSize: 14,
      maxHeight: 100,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sendBtnDisabled: {
      backgroundColor: theme.colors.surfaceMuted,
    },
  });
