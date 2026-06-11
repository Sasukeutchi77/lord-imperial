import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { appTheme } from '../utils/theme';

const formatDuration = (durationMillis) => {
  if (!durationMillis || Number.isNaN(durationMillis)) return '0:00';

  const totalSeconds = Math.max(0, Math.round(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export default function AudioMessageBubble({ uri, isMine, durationMillis }) {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [resolvedDurationMillis, setResolvedDurationMillis] = useState(durationMillis || 0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  const label = useMemo(() => {
    const activeDuration = resolvedDurationMillis || durationMillis || 0;

    if (playing) {
      return `${formatDuration(positionMillis)} / ${formatDuration(activeDuration)}`;
    }

    return `Durée ${formatDuration(activeDuration)}`;
  }, [durationMillis, playing, positionMillis, resolvedDurationMillis]);

  const createSoundIfNeeded = async () => {
    if (sound) {
      return sound;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    const { sound: createdSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false, progressUpdateIntervalMillis: 250 },
      (status) => {
        if (!status.isLoaded) return;
        setPlaying(status.isPlaying);
        setPositionMillis(status.positionMillis || 0);
        setResolvedDurationMillis(status.durationMillis || durationMillis || 0);

        if (status.didJustFinish) {
          setPlaying(false);
          setPositionMillis(0);
        }
      }
    );

    setSound(createdSound);
    return createdSound;
  };

  const togglePlayback = async () => {
    if (!uri) {
      Alert.alert('Lecture impossible', 'Le fichier audio est introuvable.');
      return;
    }

    try {
      setLoading(true);
      const activeSound = await createSoundIfNeeded();
      const status = await activeSound.getStatusAsync();

      if (!status.isLoaded) {
        throw new Error('Le fichier audio n’a pas pu être chargé.');
      }

      const totalDuration = status.durationMillis || resolvedDurationMillis || durationMillis || 0;

      if (status.isPlaying) {
        await activeSound.pauseAsync();
      } else if (status.positionMillis > 0 && status.positionMillis >= totalDuration - 250) {
        await activeSound.replayAsync();
      } else {
        await activeSound.playAsync();
      }
    } catch (error) {
      Alert.alert('Lecture impossible', error.message || 'Le message vocal ne peut pas être lu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={togglePlayback} style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <View style={styles.circle}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name={playing ? 'pause' : 'play'} size={18} color="#fff" />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Message vocal</Text>
        <Text style={styles.subtitle}>{playing ? `Lecture en cours · ${label}` : label}</Text>
      </View>
      <Ionicons name="mic" size={18} color={isMine ? '#fff' : appTheme.colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 220,
    maxWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
  },
  body: {
    flex: 1,
  },
  mine: {
    backgroundColor: appTheme.colors.bubbleMine,
  },
  theirs: {
    backgroundColor: appTheme.colors.bubbleTheirs,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  title: {
    color: '#fff',
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
    fontSize: 12,
  },
});
