import React, { memo, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import { formatLastSeen, formatTime, getCertificationStatus, getUserLevel } from '../utils/helpers';
import { useAppTheme } from '../utils/theme';

const CERTIFIED_COLOR = '#F5C518';

function ChatListItem({ chat, currentUser, onPress, online = true }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const otherUid = (chat.members || []).find((uid) => uid !== currentUser.uid);
  const otherMember = otherUid ? chat.memberDetails?.[otherUid] : null;
  const otherLabel = otherMember?.displayName || otherMember?.username || otherMember?.email;

  const title = chat.type === 'private' ? otherLabel || 'Discussion privée' : chat.title || (chat.type === 'channel' ? 'Canal' : 'Groupe');
  const subtitle =
    chat.type === 'private'
      ? formatLastSeen(otherMember?.lastSeen, otherMember?.isOnline)
      : chat.type === 'channel'
        ? `${chat.admins?.length || 1} admin · ${chat.members?.length || 0} abonnés`
        : `${chat.members?.length || 0} membres · ${chat.admins?.length || 1} admin`;

  const activeDot = chat.type === 'private' ? Boolean(otherMember?.isOnline) : online;
  const timeLabel = formatTime(chat.lastActivityAtMs || chat.updatedAtMs || chat.createdAtMs);
  const preview = chat.lastMessage || 'Commencer la conversation';
  const badgeIcon = chat.type === 'channel' ? 'megaphone' : chat.type === 'group' ? 'people' : null;

  const cardEffect = chat.type === 'private' ? (otherMember?.profileCard || null) : null;
  const { isCertified: otherCertified } = useMemo(() => getCertificationStatus(otherMember || {}), [otherMember]);
  const { color: otherLevelColor } = useMemo(() => getUserLevel(otherMember || {}), [otherMember]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View>
        <Avatar
          uri={otherMember?.avatar || chat.avatar}
          label={title}
          size={64}
          showOnline={activeDot}
          cardEffect={cardEffect}
          isCertified={chat.type === 'private' ? otherCertified : false}
          levelColor={chat.type === 'private' ? otherLevelColor : null}
        />
        {badgeIcon ? (
          <View style={[styles.kindBadge, cardEffect && styles.kindBadgeWithCard]}>
            <Ionicons name={badgeIcon} size={12} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.titleLine}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {chat.type === 'channel' ? <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} /> : null}
            {chat.type === 'private' && otherCertified ? (
              <View style={styles.certifiedPill}>
                <Ionicons name="checkmark" size={10} color="#0D1117" />
              </View>
            ) : null}
          </View>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        <View style={styles.previewRow}>
          <View style={styles.previewBody}>
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            {chat.description ? <Text style={styles.description} numberOfLines={1}>{chat.description}</Text> : null}
            <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
          </View>
          {chat.unreadCount ? (
            <View style={styles.unreadPill}>
              <Text style={styles.unreadText}>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const areEqual = (previous, next) => {
  const previousChat = previous.chat || {};
  const nextChat = next.chat || {};
  const previousMembers = previousChat.memberDetails || {};
  const nextMembers = nextChat.memberDetails || {};
  const previousOtherUid = (previousChat.members || []).find((uid) => uid !== previous.currentUser?.uid);
  const nextOtherUid = (nextChat.members || []).find((uid) => uid !== next.currentUser?.uid);
  const previousOtherMember = previousOtherUid ? previousMembers[previousOtherUid] : null;
  const nextOtherMember = nextOtherUid ? nextMembers[nextOtherUid] : null;

  return (
    previous.online === next.online &&
    previous.currentUser?.uid === next.currentUser?.uid &&
    previousChat.id === nextChat.id &&
    previousChat.title === nextChat.title &&
    previousChat.description === nextChat.description &&
    previousChat.lastMessage === nextChat.lastMessage &&
    previousChat.lastActivityAtMs === nextChat.lastActivityAtMs &&
    previousChat.updatedAtMs === nextChat.updatedAtMs &&
    previousChat.createdAtMs === nextChat.createdAtMs &&
    previousChat.type === nextChat.type &&
    previousChat.avatar === nextChat.avatar &&
    previousChat.unreadCount === nextChat.unreadCount &&
    (previousChat.members?.length || 0) === (nextChat.members?.length || 0) &&
    (previousChat.admins?.length || 0) === (nextChat.admins?.length || 0) &&
    previousOtherMember?.avatar === nextOtherMember?.avatar &&
    previousOtherMember?.displayName === nextOtherMember?.displayName &&
    previousOtherMember?.username === nextOtherMember?.username &&
    previousOtherMember?.email === nextOtherMember?.email &&
    previousOtherMember?.isOnline === nextOtherMember?.isOnline &&
    previousOtherMember?.lastSeen === nextOtherMember?.lastSeen &&
    previousOtherMember?.profileCard === nextOtherMember?.profileCard
  );
};

export default memo(ChatListItem, areEqual);

const createStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 9,
    },
    rowPressed: {
      opacity: 0.72,
    },
    kindBadge: {
      position: 'absolute',
      right: 1,
      bottom: 2,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kindBadgeWithCard: {
      right: 14,
      bottom: 14,
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: 7,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    titleLine: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      minWidth: 0,
    },
    title: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '800',
      flexShrink: 1,
    },
    time: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 10,
    },
    previewBody: {
      flex: 1,
      minWidth: 0,
    },
    subtitle: {
      color: theme.colors.textSoft,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    description: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginBottom: 3,
    },
    preview: {
      color: theme.colors.text,
      opacity: 0.9,
      fontSize: 15,
      fontWeight: '600',
    },
    unreadPill: {
      minWidth: 30,
      height: 23,
      paddingHorizontal: 7,
      borderRadius: 12,
      backgroundColor: theme.colors.unread,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadText: {
      color: '#0D1117',
      fontSize: 12,
      fontWeight: '800',
    },
    certifiedPill: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: CERTIFIED_COLOR,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
