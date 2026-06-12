import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { REPORT_REASONS, submitReport } from '../services/reports';
import { useAppTheme } from '../utils/theme';

export default function ReportSheet({ visible, reporterId, reportedUserId, messageId = null, chatId = null, onClose }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleSelectReason = (reason) => {
    Alert.alert(
      'Confirmer le signalement',
      `Vous allez signaler ce contenu pour :\n« ${reason.label} »\n\nVotre signalement sera examiné par notre équipe de modération.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Signaler',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await submitReport({ reporterId, reportedUserId, messageId, chatId, reason: reason.id });
              onClose();
              Alert.alert(
                'Signalement envoyé',
                'Merci. Votre signalement a bien été transmis à notre équipe de modération.',
                [{ text: 'OK' }]
              );
            } catch {
              Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Réessayez plus tard.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.warningIcon}>
              <Ionicons name="flag" size={22} color="#E74C3C" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Signaler ce contenu</Text>
              <Text style={styles.subtitle}>Votre signalement restera confidentiel</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Envoi en cours…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Quel est le problème ?</Text>
              {REPORT_REASONS.map((reason) => (
                <Pressable
                  key={reason.id}
                  style={({ pressed }) => [styles.reasonRow, pressed && styles.reasonRowPressed]}
                  onPress={() => handleSelectReason(reason)}
                >
                  <View style={styles.reasonIcon}>
                    <Ionicons name={reason.icon} size={18} color={theme.colors.textMuted} />
                  </View>
                  <Text style={styles.reasonLabel}>{reason.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            </>
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
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
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 18,
      paddingBottom: 32,
      paddingTop: 12,
      gap: 4,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    warningIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#E74C3C22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    title: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 13,
      marginTop: 2,
    },
    sectionLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 4,
      marginTop: 4,
    },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 52,
      paddingHorizontal: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      marginVertical: 2,
    },
    reasonRowPressed: {
      opacity: 0.7,
    },
    reasonIcon: {
      width: 30,
      alignItems: 'center',
    },
    reasonLabel: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    loaderWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      gap: 12,
    },
    loadingText: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    cancelButton: {
      marginTop: 10,
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
    },
    cancelText: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 15,
    },
  });
