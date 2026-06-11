import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLinkPreview } from '../services/linkPreview';
import { useAppTheme } from '../utils/theme';

export default function LinkPreviewCard({ url, isMine = false }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));

  useEffect(() => {
    let active = true;

    if (!url) {
      setPreview(null);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    getLinkPreview(url)
      .then((result) => {
        if (active) {
          setPreview(result);
        }
      })
      .catch(() => {
        if (active) {
          setPreview(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  const handleOpen = async () => {
    if (!preview?.url) return;
    try {
      await Linking.openURL(preview.url);
    } catch (_error) {
      // no-op
    }
  };

  if (!url) return null;

  return (
    <Pressable onPress={handleOpen} style={[styles.card, isMine ? styles.cardMine : styles.cardTheirs]}>
      {preview?.image ? <Image source={{ uri: preview.image }} style={styles.image} resizeMode="cover" /> : null}
      <View style={styles.content}>
        <View style={styles.domainRow}>
          <Ionicons name="globe-outline" size={13} color={isMine ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted} />
          <Text style={[styles.domain, !isMine && styles.domainTheirs]} numberOfLines={1}>
            {preview?.domain || url}
          </Text>
        </View>
        <Text style={[styles.title, !isMine && styles.titleTheirs]} numberOfLines={2}>
          {preview?.title || url}
        </Text>
        {preview?.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {preview.description}
          </Text>
        ) : null}
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={styles.loadingText}>Chargement de l’aperçu…</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      marginTop: 10,
      overflow: 'hidden',
      borderRadius: 18,
      borderWidth: 1,
    },
    cardMine: {
      backgroundColor: 'rgba(8,16,24,0.18)',
      borderColor: 'rgba(255,255,255,0.16)',
    },
    cardTheirs: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
    },
    image: {
      width: '100%',
      height: 148,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 12,
      gap: 6,
    },
    domainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    domain: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'lowercase',
      flex: 1,
    },
    domainTheirs: {
      color: theme.colors.textMuted,
    },
    title: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 19,
    },
    titleTheirs: {
      color: theme.colors.text,
    },
    description: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    loadingText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontStyle: 'italic',
    },
  });
