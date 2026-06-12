import React, { memo, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getInitials } from '../utils/helpers';
import { useAppTheme } from '../utils/theme';
import AnimatedProfileCard from './AnimatedProfileCard';

const CERTIFIED_BADGE_COLOR = '#F5C518';

function Avatar({ uri = null, label = '', size = 48, showOnline = false, onPress = null, cardEffect = null, isCertified = false, levelColor = null }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, size), [theme, size]);
  const initials = useMemo(() => getInitials(label), [label]);
  const Container = onPress ? Pressable : View;

  const certifiedBadgeSize = Math.max(14, Math.round(size * 0.28));

  const avatarContent = (
    <Container onPress={onPress} style={[styles.wrap, levelColor && { borderWidth: 3, borderColor: levelColor }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryStrong]} style={styles.fallback}>
          <Text style={styles.initials}>{initials}</Text>
        </LinearGradient>
      )}
      {showOnline ? <View style={styles.onlineDot} /> : null}
      {isCertified ? (
        <View style={[styles.certifiedBadge, { width: certifiedBadgeSize, height: certifiedBadgeSize, borderRadius: certifiedBadgeSize / 2 }]}>
          <Ionicons name="checkmark" size={Math.max(8, Math.round(certifiedBadgeSize * 0.62))} color="#0D1117" />
        </View>
      ) : null}
    </Container>
  );

  if (cardEffect) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedProfileCard effect={cardEffect} size={size}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryStrong]} style={styles.fallback}>
              <Text style={styles.initials}>{initials}</Text>
            </LinearGradient>
          )}
        </AnimatedProfileCard>
        {showOnline ? (
          <View
            style={[
              styles.onlineDot,
              { position: 'absolute', right: 0, bottom: 0, zIndex: 10 },
            ]}
          />
        ) : null}
        {isCertified ? (
          <View
            style={[
              styles.certifiedBadge,
              {
                position: 'absolute',
                left: cardEffect ? 14 : 1,
                bottom: cardEffect ? 14 : 1,
                zIndex: 10,
                width: certifiedBadgeSize,
                height: certifiedBadgeSize,
                borderRadius: certifiedBadgeSize / 2,
              },
            ]}
          >
            <Ionicons name="checkmark" size={Math.max(8, Math.round(certifiedBadgeSize * 0.62))} color="#0D1117" />
          </View>
        ) : null}
      </View>
    );
  }

  return avatarContent;
}

export default memo(Avatar);

const createStyles = (theme, size) =>
  StyleSheet.create({
    wrap: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.surfaceMuted,
    },
    fallback: {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    initials: {
      color: '#fff',
      fontWeight: '900',
      fontSize: Math.max(12, Math.round(size * 0.34)),
      letterSpacing: 0.6,
    },
    onlineDot: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: Math.max(12, Math.round(size * 0.24)),
      height: Math.max(12, Math.round(size * 0.24)),
      borderRadius: 99,
      borderWidth: 2,
      borderColor: theme.colors.background,
      backgroundColor: theme.colors.success,
    },
    certifiedBadge: {
      position: 'absolute',
      left: 1,
      bottom: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CERTIFIED_BADGE_COLOR,
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
  });
