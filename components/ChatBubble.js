import React, { memo, useMemo, useRef } from 'react';
import { Animated, Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  extractFirstUrl,
  formatFileSize,
  getFileIconName,
  formatTime,
  getMessagePreviewLabel,
  getPollOptions,
  getPollTotalVotes,
  getPollUserVote,
  getPollVotePercentage,
} from '../utils/helpers';
import { useAppTheme } from '../utils/theme';
import AudioMessageBubble from './AudioMessageBubble';
import Avatar from './Avatar';
import LinkPreviewCard from './LinkPreviewCard';

const GROUPING_WINDOW_MS = 4 * 60 * 1000;
const SWIPE_THRESHOLD = 72;

const getTimestampMs = (message) => {
  if (!message) return 0;
  if (typeof message.createdAtMs === 'number') return message.createdAtMs;
  if (typeof message?.timestamp?.toMillis === 'function') return message.timestamp.toMillis();
  const parsed = new Date(message.timestamp || 0).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const belongsToSameVisualGroup = (a, b) => {
  if (!a || !b) return false;
  if (a.type === 'system' || b.type === 'system') return false;
  if (a.type === 'deleted' || b.type === 'deleted') return false;
  if (a.senderId !== b.senderId) return false;
  return Math.abs(getTimestampMs(a) - getTimestampMs(b)) <= GROUPING_WINDOW_MS;
};

const getGroupShape = ({ previousMessage, nextMessage, message }) => {
  const groupedWithPrevious = belongsToSameVisualGroup(previousMessage, message);
  const groupedWithNext = belongsToSameVisualGroup(message, nextMessage);

  if (groupedWithPrevious && groupedWithNext) return 'middle';
  if (groupedWithPrevious) return 'end';
  if (groupedWithNext) return 'start';
  return 'solo';
};

const getStatusIcon = (message, isMine) => {
  if (!isMine) return null;

  if (message.status === 'failed') {
    return { icon: 'alert-circle', color: '#FF6B6B' };
  }
  if (message.status === 'sending') {
    return { icon: 'time-outline', color: 'rgba(255,255,255,0.50)' };
  }

  const seenCount = message.delivery?.seenBy?.length || 0;
  const deliveredCount = message.delivery?.deliveredTo?.length || 0;

  if (seenCount > 1) {
    return { icon: 'checkmark-done', color: '#53BDEB' };
  }
  if (deliveredCount > 1) {
    return { icon: 'checkmark-done', color: 'rgba(255,255,255,0.55)' };
  }
  return { icon: 'checkmark', color: 'rgba(255,255,255,0.55)' };
};

const normalizeReactions = (reactions = {}) =>
  Object.entries(reactions)
    .map(([emoji, users]) => ({ emoji, count: Array.isArray(users) ? users.length : 0, users: Array.isArray(users) ? users : [] }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji));

const PollOption = ({ option, percentage, voted, isMine, onPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const votes = Array.isArray(option?.voterIds) ? option.voterIds.length : 0;

  return (
    <Pressable onPress={onPress} style={[styles.pollOption, voted && styles.pollOptionActive, isMine && styles.pollOptionMine]}>
      <View style={styles.pollTrack}>
        <View style={[styles.pollFill, { width: `${Math.max(percentage, voted && votes ? 12 : 0)}%` }]} />
      </View>
      <View style={styles.pollOptionRow}>
        <View style={styles.pollOptionCopy}>
          <Text style={[styles.pollOptionText, voted && styles.pollOptionTextActive]} numberOfLines={2}>{option?.text}</Text>
          <Text style={styles.pollOptionMeta}>{votes} vote{votes > 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.pollOptionRight}>
          {voted ? <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} /> : null}
          <Text style={[styles.pollOptionPercent, voted && styles.pollOptionPercentActive]}>{percentage}%</Text>
        </View>
      </View>
    </Pressable>
  );
};

function ChatBubble({
  message,
  isMine,
  canDelete = false,
  highlighted = false,
  onLongPress,
  onRetry,
  previousMessage = null,
  nextMessage = null,
  senderLabel = '',
  senderAvatar = null,
  onPressSender,
  onSwipeReply,
  onPressImage,
  onPressQuotedMessage,
  onPressReaction,
  onVotePoll,
  currentUserId,
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const swipeTranslate = useRef(new Animated.Value(0)).current;
  const isSystem = message.type === 'system';
  const isDeleted = message.type === 'deleted';
  const groupShape = getGroupShape({ previousMessage, nextMessage, message });
  const statusIcon = getStatusIcon(message, isMine);
  const imageUri = message.mediaUrl || message.localUri || null;
  const isAudio = Boolean(message.audioUrl) && !isDeleted;
  const isImage = message.type === 'image' && Boolean(imageUri) && !isDeleted;
  const isVideo = message.type === 'video' && Boolean(imageUri) && !isDeleted;
  const isSticker = message.type === 'sticker' && Boolean(imageUri) && !isDeleted;
  const isFile = message.type === 'file' && !isDeleted;
  const isPoll = message.type === 'poll' && Boolean(message.poll?.question);
  const disappearAfterMs = message.disappearAfterMs || null;
  const disappearAt = disappearAfterMs && message.createdAtMs ? message.createdAtMs + disappearAfterMs : null;
  const isExpired = disappearAt && Date.now() > disappearAt;

  if (isExpired) return null;
  const reactions = normalizeReactions(message.reactions);
  const showSenderAvatar = !isMine && senderLabel && groupShape !== 'middle' && groupShape !== 'end';
  const previewUrl = !isDeleted && !isAudio && !isImage && !isSticker && !isPoll ? extractFirstUrl(message.text || '') : null;
  const pollOptions = getPollOptions(message.poll);
  const totalVotes = getPollTotalVotes(message.poll);
  const currentVote = getPollUserVote(message.poll, currentUserId);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderMove: (_event, gestureState) => {
          const limited = Math.max(-84, Math.min(84, gestureState.dx));
          swipeTranslate.setValue(limited);
        },
        onPanResponderRelease: (_event, gestureState) => {
          const shouldReply = Math.abs(gestureState.dx) >= SWIPE_THRESHOLD;
          Animated.spring(swipeTranslate, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
          if (shouldReply) onSwipeReply?.(message);
        },
        onPanResponderTerminate: () => {
          Animated.spring(swipeTranslate, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [message, onSwipeReply, swipeTranslate]
  );

  if (isSystem) {
    return (
      <View style={styles.systemWrap}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  const timeLabel = formatTime(message.timestamp || message.createdAtMs);

  const bubbleStyle = [
    styles.bubble,
    isMine ? styles.mine : styles.theirs,
    groupShape === 'start' && (isMine ? styles.mineStart : styles.theirsStart),
    groupShape === 'middle' && (isMine ? styles.mineMiddle : styles.theirsMiddle),
    groupShape === 'end' && (isMine ? styles.mineEnd : styles.theirsEnd),
    isDeleted && styles.deletedBubble,
    message.status === 'failed' && styles.failedBubble,
    highlighted && styles.highlightedBubble,
  ];

  // WhatsApp-style inline footer (time + status) that sits at bottom-right
  const FooterInline = () => (
    <View style={styles.inlineFooter}>
      <Text style={[styles.inlineTime, !isMine && styles.inlineTimeTheirs]}>{timeLabel}</Text>
      {statusIcon ? (
        <Ionicons name={statusIcon.icon} size={13} color={statusIcon.color} />
      ) : null}
    </View>
  );

  const fileNode = isFile ? (
    <View style={styles.fileContainer}>
      <View style={[styles.fileIconWrap, isMine ? styles.fileIconWrapMine : styles.fileIconWrapTheirs]}>
        <Ionicons name={getFileIconName(message.mimeType, message.fileName)} size={22} color={isMine ? '#fff' : theme.colors.primary} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, !isMine && styles.fileNameTheirs]} numberOfLines={2}>{message.fileName || message.text || 'Fichier'}</Text>
        {message.fileSize ? (
          <Text style={[styles.fileSize, !isMine && styles.fileSizeTheirs]}>{formatFileSize(message.fileSize)}</Text>
        ) : null}
      </View>
    </View>
  ) : null;

  const retryAction = isMine && message.status === 'failed' ? (
    <Pressable onPress={() => onRetry?.(message)} style={styles.retryChip}>
      <Ionicons name="refresh" size={13} color="#fff" />
      <Text style={styles.retryText}>Réessayer</Text>
    </Pressable>
  ) : null;

  const senderNode = !isMine && groupShape !== 'middle' && groupShape !== 'end' && senderLabel ? (
    <Pressable onPress={onPressSender}>
      <Text style={styles.senderLabel}>{senderLabel}</Text>
    </Pressable>
  ) : null;

  const replyNode = message.replyTo ? (
    <Pressable
      style={[styles.replyBlock, isMine ? styles.replyBlockMine : styles.replyBlockTheirs]}
      onPress={() => onPressQuotedMessage?.(message.replyTo?.messageId)}
    >
      <View style={[styles.replyBar, isMine ? styles.replyBarMine : styles.replyBarTheirs]} />
      <View style={styles.replyCopy}>
        <Text style={[styles.replyAuthor, !isMine && styles.replyAuthorTheirs]} numberOfLines={1}>
          {message.replyTo.senderName || 'Message'}
        </Text>
        <Text style={[styles.replyPreview, !isMine && styles.replyPreviewTheirs]} numberOfLines={2}>
          {message.replyTo.preview || getMessagePreviewLabel(message.replyTo)}
        </Text>
      </View>
    </Pressable>
  ) : null;

  const imageNode = isImage ? (
    <Pressable onPress={() => onPressImage?.(imageUri)}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
    </Pressable>
  ) : null;

  const videoNode = isVideo ? (
    <Pressable onPress={() => onPressImage?.(imageUri)} style={styles.videoContainer}>
      <Image source={{ uri: imageUri }} style={styles.videoThumb} resizeMode="cover" />
      <View style={styles.videoPlayOverlay}>
        <Ionicons name="play-circle" size={44} color="rgba(255,255,255,0.9)" />
      </View>
      {disappearAt ? (
        <View style={styles.disappearBadge}>
          <Ionicons name="timer-outline" size={11} color="#fff" />
        </View>
      ) : null}
    </Pressable>
  ) : null;

  const stickerNode = isSticker ? (
    <Pressable onPress={() => onPressImage?.(imageUri)} style={styles.stickerPreviewWrap}>
      <Image source={{ uri: imageUri }} style={styles.stickerImage} resizeMode="contain" />
      {message.sticker?.name ? (
        <Text style={[styles.stickerName, !isMine && styles.stickerNameTheirs]} numberOfLines={2}>
          {message.sticker.name}
        </Text>
      ) : null}
    </Pressable>
  ) : null;

  const pollNode = isPoll ? (
    <View style={styles.pollWrap}>
      <View style={styles.pollHeader}>
        <Ionicons name="bar-chart-outline" size={15} color={isMine ? 'rgba(255,255,255,0.85)' : theme.colors.primary} />
        <Text style={[styles.pollTitle, !isMine && styles.pollTitleTheirs]} numberOfLines={3}>{message.poll?.question}</Text>
      </View>
      <View style={styles.pollOptionsWrap}>
        {pollOptions.map((option) => {
          const voted = currentVote?.id === option?.id;
          const percentage = getPollVotePercentage(message.poll, option?.id);
          return (
            <PollOption
              key={option?.id || option?.text}
              option={option}
              percentage={percentage}
              voted={voted}
              isMine={isMine}
              onPress={() => onVotePoll?.(message, option?.id)}
            />
          );
        })}
      </View>
      <Text style={[styles.pollSummary, !isMine && styles.pollSummaryTheirs]}>
        {totalVotes} participant{totalVotes > 1 ? 's' : ''}{currentVote ? ' • votre vote est enregistré' : ''}
      </Text>
    </View>
  ) : null;

  // For text messages: inline footer floats bottom-right (WhatsApp style)
  const isTextOnly = !isAudio && !isImage && !isVideo && !isSticker && !isPoll && !isFile;

  const contentNode = (
    <>
      {senderNode}
      {replyNode}
      {isAudio ? <AudioMessageBubble uri={message.audioUrl} isMine={isMine} durationMillis={message.durationMillis} /> : null}
      {isImage ? imageNode : null}
      {isVideo ? videoNode : null}
      {isSticker ? stickerNode : null}
      {isPoll ? pollNode : null}
      {isFile ? fileNode : null}

      {isTextOnly ? (
        // Text + footer on the same "line flow" — like WhatsApp
        <View style={styles.textRow}>
          <Text style={[styles.body, !isMine && styles.bodyTheirs, isDeleted && styles.deletedBody]}>
            {message.text}
          </Text>
          <FooterInline />
        </View>
      ) : (
        // For media/audio/poll — footer below content
        <View style={[styles.mediaFooter, isMine ? styles.mediaFooterMine : styles.mediaFooterTheirs]}>
          <FooterInline />
        </View>
      )}

      {previewUrl ? <LinkPreviewCard url={previewUrl} isMine={isMine} /> : null}
      {retryAction}
    </>
  );

  return (
    <Animated.View style={{ transform: [{ translateX: swipeTranslate }] }} {...panResponder.panHandlers}>
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs, groupShape === 'middle' || groupShape === 'end' ? styles.compactRow : null]}>
        {!isMine && showSenderAvatar ? (
          <Avatar uri={senderAvatar} label={senderLabel} size={30} onPress={onPressSender} />
        ) : (
          <View style={styles.avatarSpacer} />
        )}
        <View style={styles.contentWrap}>
          <Pressable disabled={!onLongPress} onLongPress={onLongPress} delayLongPress={280}>
            <View
              style={
                isAudio
                  ? [styles.audioWrap, bubbleStyle]
                  : isImage
                    ? [styles.imageWrap, bubbleStyle]
                    : isVideo
                      ? [styles.imageWrap, bubbleStyle]
                      : isSticker
                        ? [styles.stickerWrap, bubbleStyle, styles.stickerBubble]
                        : isFile
                          ? [styles.fileBubble, bubbleStyle]
                          : bubbleStyle
              }
            >
              {contentNode}
            </View>
          </Pressable>
          {reactions.length ? (
            <View style={[styles.reactionsWrap, isMine ? styles.reactionsMine : styles.reactionsTheirs]}>
              {reactions.map((reaction) => {
                const active = reaction.users.includes(currentUserId);
                return (
                  <Pressable
                    key={reaction.emoji}
                    style={[styles.reactionChip, active && styles.reactionChipActive]}
                    onPress={() => onPressReaction?.(reaction.emoji)}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                    <Text style={[styles.reactionCount, active && styles.reactionCountActive]}>{reaction.count}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const areEqual = (previous, next) => {
  const previousMessage = previous.message || {};
  const nextMessage = next.message || {};

  return (
    previous.isMine === next.isMine &&
    previous.canDelete === next.canDelete &&
    previous.highlighted === next.highlighted &&
    previous.senderLabel === next.senderLabel &&
    previous.senderAvatar === next.senderAvatar &&
    previous.currentUserId === next.currentUserId &&
    previousMessage.id === nextMessage.id &&
    previousMessage.clientId === nextMessage.clientId &&
    previousMessage.text === nextMessage.text &&
    previousMessage.type === nextMessage.type &&
    previousMessage.audioUrl === nextMessage.audioUrl &&
    previousMessage.mediaUrl === nextMessage.mediaUrl &&
    previousMessage.localUri === nextMessage.localUri &&
    previousMessage.status === nextMessage.status &&
    previousMessage.durationMillis === nextMessage.durationMillis &&
    previousMessage.replyTo?.messageId === nextMessage.replyTo?.messageId &&
    JSON.stringify(previousMessage.reactions || {}) === JSON.stringify(nextMessage.reactions || {}) &&
    JSON.stringify(previousMessage.poll || null) === JSON.stringify(nextMessage.poll || null) &&
    JSON.stringify(previousMessage.sticker || null) === JSON.stringify(nextMessage.sticker || null) &&
    previousMessage.fileName === nextMessage.fileName &&
    previousMessage.fileSize === nextMessage.fileSize &&
    previous.previousMessage?.id === next.previousMessage?.id &&
    previous.nextMessage?.id === next.nextMessage?.id &&
    (previousMessage.delivery?.deliveredTo?.length || 0) === (nextMessage.delivery?.deliveredTo?.length || 0) &&
    (previousMessage.delivery?.seenBy?.length || 0) === (nextMessage.delivery?.seenBy?.length || 0)
  );
};

export default memo(ChatBubble, areEqual);

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      marginBottom: 2,
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 6,
    },
    compactRow: {
      marginBottom: 1,
    },
    rowMine: {
      justifyContent: 'flex-end',
    },
    rowTheirs: {
      justifyContent: 'flex-start',
    },
    avatarSpacer: {
      width: 30,
      marginRight: 4,
    },
    contentWrap: {
      maxWidth: '80%',
    },
    bubble: {
      paddingHorizontal: 10,
      paddingTop: 7,
      paddingBottom: 5,
      borderRadius: 16,
    },
    audioWrap: {
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 6,
      borderRadius: 16,
    },
    imageWrap: {
      maxWidth: 250,
      padding: 3,
      borderRadius: 14,
      gap: 0,
    },
    stickerWrap: {
      maxWidth: 170,
      padding: 3,
      borderRadius: 16,
      gap: 3,
    },
    image: {
      width: 230,
      height: 230,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceMuted,
    },
    videoContainer: {
      width: 230,
      height: 180,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    videoThumb: {
      width: '100%',
      height: '100%',
    },
    videoPlayOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    disappearBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stickerBubble: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    stickerPreviewWrap: {
      alignItems: 'center',
      gap: 4,
    },
    stickerImage: {
      width: 150,
      height: 150,
      backgroundColor: 'transparent',
    },
    stickerName: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    stickerNameTheirs: {
      color: theme.colors.textMuted,
    },
    // My messages: warm gold/brown (Lord Imperial brand)
    mine: {
      backgroundColor: theme.colors.bubbleMine,
    },
    // Others' messages: dark surface like WhatsApp dark mode
    theirs: {
      backgroundColor: '#1E2733',
    },
    highlightedBubble: {
      borderWidth: 2,
      borderColor: theme.colors.warning,
    },
    // WhatsApp-style corner rounding for grouped messages
    mineStart: {
      borderBottomRightRadius: 5,
    },
    mineMiddle: {
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
    },
    mineEnd: {
      borderTopRightRadius: 5,
    },
    theirsStart: {
      borderBottomLeftRadius: 5,
    },
    theirsMiddle: {
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
    },
    theirsEnd: {
      borderTopLeftRadius: 5,
    },
    deletedBubble: {
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    failedBubble: {
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    senderLabel: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 3,
    },
    replyBlock: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 6,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginBottom: 5,
    },
    replyBlockMine: {
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    replyBlockTheirs: {
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    replyBar: {
      width: 3,
      borderRadius: 99,
    },
    replyBarMine: {
      backgroundColor: 'rgba(255,255,255,0.85)',
    },
    replyBarTheirs: {
      backgroundColor: theme.colors.primary,
    },
    replyCopy: {
      flex: 1,
      minWidth: 0,
    },
    replyAuthor: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 12,
      fontWeight: '700',
    },
    replyAuthorTheirs: {
      color: theme.colors.primary,
    },
    replyPreview: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 12,
      lineHeight: 16,
      marginTop: 1,
    },
    replyPreviewTheirs: {
      color: theme.colors.textMuted,
    },
    // Text + footer layout: text and footer on the same line (WhatsApp style)
    textRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: 4,
    },
    body: {
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 21,
      flexShrink: 1,
    },
    bodyTheirs: {
      color: '#E8EDF2',
    },
    deletedBody: {
      color: 'rgba(200,200,200,0.6)',
      fontStyle: 'italic',
    },
    // Inline footer: time + status icon side by side
    inlineFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginBottom: 1,
    },
    inlineTime: {
      color: 'rgba(255,255,255,0.58)',
      fontSize: 11,
      lineHeight: 14,
    },
    inlineTimeTheirs: {
      color: 'rgba(232,237,242,0.50)',
    },
    // Footer below media content
    mediaFooter: {
      marginTop: 4,
    },
    mediaFooterMine: {
      alignSelf: 'flex-end',
    },
    mediaFooterTheirs: {
      alignSelf: 'flex-start',
    },
    retryChip: {
      alignSelf: 'flex-end',
      marginTop: 7,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: theme.colors.danger,
    },
    retryText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    reactionsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 3,
    },
    reactionsMine: {
      alignSelf: 'flex-end',
    },
    reactionsTheirs: {
      alignSelf: 'flex-start',
    },
    reactionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    reactionChipActive: {
      borderColor: theme.colors.accent,
      backgroundColor: 'rgba(201,149,107,0.14)',
    },
    reactionEmoji: {
      fontSize: 13,
      lineHeight: 17,
    },
    reactionCount: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    reactionCountActive: {
      color: theme.colors.accent,
    },
    systemWrap: {
      alignItems: 'center',
      marginVertical: 8,
      paddingHorizontal: 20,
    },
    systemText: {
      color: 'rgba(200,210,220,0.72)',
      fontSize: 12,
      lineHeight: 16,
      textAlign: 'center',
      backgroundColor: 'rgba(20,28,38,0.75)',
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 999,
      overflow: 'hidden',
    },
    pollWrap: {
      gap: 8,
      minWidth: 200,
    },
    pollHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    pollTitle: {
      flex: 1,
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 19,
    },
    pollTitleTheirs: {
      color: theme.colors.text,
    },
    pollOptionsWrap: {
      gap: 5,
    },
    pollOption: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      backgroundColor: 'rgba(0,0,0,0.14)',
      minHeight: 48,
    },
    pollOptionMine: {
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    pollOptionActive: {
      borderColor: theme.colors.accent,
    },
    pollTrack: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    pollFill: {
      height: '100%',
      backgroundColor: 'rgba(201,149,107,0.22)',
    },
    pollOptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    pollOptionCopy: {
      flex: 1,
      minWidth: 0,
    },
    pollOptionText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    pollOptionTextActive: {
      color: '#fff',
    },
    pollOptionMeta: {
      color: 'rgba(255,255,255,0.58)',
      fontSize: 11,
      marginTop: 2,
    },
    pollOptionRight: {
      alignItems: 'flex-end',
      gap: 3,
      minWidth: 40,
    },
    pollOptionPercent: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 12,
      fontWeight: '700',
    },
    pollOptionPercentActive: {
      color: '#fff',
    },
    pollSummary: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: 11,
      fontWeight: '600',
    },
    pollSummaryTheirs: {
      color: theme.colors.textMuted,
    },
    fileBubble: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    fileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 160,
      maxWidth: 240,
      paddingVertical: 4,
    },
    fileIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      flexShrink: 0,
    },
    fileIconWrapMine: {
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    fileIconWrapTheirs: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    fileInfo: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    fileName: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 17,
    },
    fileNameTheirs: {
      color: theme.colors.text,
    },
    fileSize: {
      color: 'rgba(255,255,255,0.65)',
      fontSize: 11,
    },
    fileSizeTheirs: {
      color: theme.colors.textMuted,
    },
  });
