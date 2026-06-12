import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EMOJI_REACTIONS } from '../utils/helpers';
import { useAppTheme } from '../utils/theme';

export default function MessageActionSheet({
  visible,
  message,
  canDelete = false,
  canPin = false,
  isPinned = false,
  canReport = false,
  onClose,
  onReact,
  onReply,
  onDelete,
  onViewProfile,
  onTogglePin,
  onReport,
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!visible || !message) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Message</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reactionsRow}>
            {EMOJI_REACTIONS.map((emoji) => (
              <Pressable key={emoji} style={styles.emojiButton} onPress={() => onReact?.(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.actionRow} onPress={onReply}>
            <Ionicons name="return-up-back-outline" size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Répondre</Text>
          </Pressable>

          {canPin ? (
            <Pressable style={styles.actionRow} onPress={onTogglePin}>
              <Ionicons name={isPinned ? 'pin' : 'pin-outline'} size={18} color={theme.colors.text} />
              <Text style={styles.actionText}>{isPinned ? 'Retirer des messages épinglés' : 'Épingler ce message'}</Text>
            </Pressable>
          ) : null}

          {onViewProfile ? (
            <Pressable style={styles.actionRow} onPress={onViewProfile}>
              <Ionicons name="person-circle-outline" size={18} color={theme.colors.text} />
              <Text style={styles.actionText}>Voir le profil</Text>
            </Pressable>
          ) : null}

          {canReport ? (
            <Pressable style={styles.actionRow} onPress={onReport}>
              <Ionicons name="flag-outline" size={18} color={theme.colors.danger} />
              <Text style={[styles.actionText, styles.deleteText]}>Signaler</Text>
            </Pressable>
          ) : null}

          {canDelete ? (
            <Pressable style={styles.actionRow} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
      padding: 18,
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      gap: 8,
    },
    title: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 6,
    },
    reactionsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 2,
      marginBottom: 6,
    },
    emojiButton: {
      width: 50,
      minHeight: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emojiText: {
      fontSize: 24,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 48,
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.surfaceMuted,
    },
    actionText: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 14,
      flex: 1,
    },
    deleteText: {
      color: theme.colors.danger,
    },
  });
