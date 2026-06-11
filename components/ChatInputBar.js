import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { getOptimizedAudioRecordingOptions } from '../services/media';
import { pickChatImageFromLibrary, pickChatVideoFromLibrary } from '../services/imagePicker';
import { EMOJI_CATEGORIES } from '../utils/helpers';
import { useAppTheme } from '../utils/theme';
import PollComposerModal from './PollComposerModal';
import StickerComposerModal from './StickerComposerModal';
import CustomEmojiPanel from './CustomEmojiPanel';

const MIN_RECORDING_DURATION_MS = 700;
const TYPING_DEBOUNCE_MS = 1500;

const formatRecordingDuration = (durationMillis) => {
  const safeDuration = Math.max(0, Math.floor((durationMillis || 0) / 1000));
  const minutes = Math.floor(safeDuration / 60);
  const seconds = safeDuration % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export default function ChatInputBar({
  onSend,
  onSendVoice,
  onSendImage,
  onSendVideo,
  onSendPoll,
  onCreateSticker,
  onSendSticker,
  onTypingChange,
  disabled = false,
  disabledReason = '',
  uploadingMedia = false,
  uploadProgress = 0,
  uploadLabel = '',
  replyTo = null,
  onCancelReply,
  stickerOwnerId = '',
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(null);
  const [busy, setBusy] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [showStickerComposer, setShowStickerComposer] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCustomEmoji, setShowCustomEmoji] = useState(false);
  const typingTimeoutRef = useRef(null);
  const typingActiveRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sendScale = useRef(new Animated.Value(1)).current;
  const attachMenuAnim = useRef(new Animated.Value(0)).current;
  const [inputFocused, setInputFocused] = useState(false);
  const mediaBusy = busy || uploadingMedia;

  // Pulsing animation pour le point d'enregistrement
  useEffect(() => {
    if (recording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recording, pulseAnim]);

  // Animation spring sur le bouton envoi quand du texte apparaît/disparaît
  useEffect(() => {
    Animated.spring(sendScale, {
      toValue: hasText ? 1 : 0.85,
      tension: 180,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [hasText, sendScale]);

  // Animation slide pour le menu d'attachement
  useEffect(() => {
    Animated.timing(attachMenuAnim, {
      toValue: showAttachMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showAttachMenu, attachMenuAnim]);

  useEffect(() => {
    let interval;

    if (recording) {
      interval = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status?.isRecording) {
            setRecordingDuration(status.durationMillis || 0);
          }
        } catch (_error) {
          // no-op
        }
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recording]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (typingActiveRef.current && onTypingChange) {
        onTypingChange(false);
      }

      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      }).catch(() => {});
    };
  }, [onTypingChange, recording]);

  const resetAudioMode = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });
  };

  const stopTypingIfNeeded = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typingActiveRef.current && onTypingChange) {
      typingActiveRef.current = false;
      onTypingChange(false);
    }
  };

  const emitTyping = (value) => {
    setText(value);

    if (!onTypingChange || disabled || recording || uploadingMedia) {
      return;
    }

    const hasContent = Boolean(value.trim());

    if (hasContent && !typingActiveRef.current) {
      typingActiveRef.current = true;
      onTypingChange(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (typingActiveRef.current) {
        typingActiveRef.current = false;
        onTypingChange(false);
      }
    }, TYPING_DEBOUNCE_MS);

    if (!hasContent && typingActiveRef.current) {
      typingActiveRef.current = false;
      onTypingChange(false);
    }
  };

  const handleSend = async () => {
    const current = text.trim();
    if (!current || mediaBusy || disabled) return;

    try {
      setBusy(true);
      setText('');
      setShowEmojiPanel(false);
      stopTypingIfNeeded();
      await onSend(current, { replyTo });
    } catch (error) {
      setText(current);
      Alert.alert('Envoi impossible', error.message || 'Le message n\u2019a pas pu être envoyé.');
    } finally {
      setBusy(false);
    }
  };

  const handlePickImage = async () => {
    setShowAttachMenu(false);
    if (disabled || mediaBusy || recording) {
      if (disabled) {
        Alert.alert('Action indisponible', disabledReason || 'Vous ne pouvez pas envoyer de média pour le moment.');
      }
      return;
    }

    if (!onSendImage) {
      Alert.alert('Indisponible', 'L\u2019envoi d\u2019images n\u2019est pas encore branché.');
      return;
    }

    try {
      setBusy(true);
      setShowEmojiPanel(false);
      stopTypingIfNeeded();
      const uri = await pickChatImageFromLibrary();
      if (!uri) return;
      await onSendImage(uri, { replyTo });
    } catch (error) {
      Alert.alert('Image impossible', error.message || 'Cette image n\u2019a pas pu être envoyée.');
    } finally {
      setBusy(false);
    }
  };

  const handlePickVideo = async () => {
    setShowAttachMenu(false);
    if (disabled || mediaBusy || recording) {
      if (disabled) Alert.alert('Action indisponible', disabledReason || 'Vous ne pouvez pas envoyer de vidéo pour le moment.');
      return;
    }

    if (!onSendVideo) {
      Alert.alert('Indisponible', 'L\'envoi de vidéos n\'est pas encore disponible.');
      return;
    }

    try {
      setBusy(true);
      setShowEmojiPanel(false);
      stopTypingIfNeeded();
      const result = await pickChatVideoFromLibrary();
      if (!result) return;
      await onSendVideo(result.uri, result.mimeType || 'video/mp4', { replyTo });
    } catch (error) {
      Alert.alert('Vidéo impossible', error.message || 'Cette vidéo n\'a pas pu être envoyée.');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenPollComposer = () => {
    setShowAttachMenu(false);
    if (disabled) {
      Alert.alert('Action indisponible', disabledReason || 'Vous ne pouvez pas publier de sondage ici.');
      return;
    }

    if (!onSendPoll) {
      Alert.alert('Indisponible', 'L\u2019envoi de sondages n\u2019est pas encore disponible.');
      return;
    }

    setShowEmojiPanel(false);
    stopTypingIfNeeded();
    setShowPollComposer(true);
  };

  const handleOpenStickerComposer = () => {
    setShowAttachMenu(false);
    if (disabled) {
      Alert.alert('Action indisponible', disabledReason || 'Vous ne pouvez pas envoyer ou créer de sticker ici.');
      return;
    }

    if (!onCreateSticker || !onSendSticker) {
      Alert.alert('Indisponible', 'La fonction stickers n\u2019est pas encore disponible.');
      return;
    }

    setShowEmojiPanel(false);
    stopTypingIfNeeded();
    setShowStickerComposer(true);
  };

  const handleSubmitPoll = async ({ question, options }) => {
    if (!onSendPoll) return;
    await onSendPoll({ question, options, replyTo });
  };

  const startRecording = async () => {
    if (disabled) {
      Alert.alert('Action indisponible', disabledReason || 'Le message vocal n\u2019est pas disponible pour le moment.');
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Micro refusé', 'Autorisez le microphone pour envoyer un message vocal.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    const createdRecording = new Audio.Recording();
    await createdRecording.prepareToRecordAsync(getOptimizedAudioRecordingOptions());
    await createdRecording.startAsync();
    setRecordingDuration(0);
    setRecording(createdRecording);
  };

  const finishRecording = async ({ cancel = false } = {}) => {
    if (!recording) return;

    const activeRecording = recording;
    setRecording(null);

    await activeRecording.stopAndUnloadAsync();
    const status = await activeRecording.getStatusAsync();
    const uri = activeRecording.getURI();
    const durationMillis = status?.durationMillis || 0;

    setRecordingDuration(0);
    await resetAudioMode();

    if (cancel || !uri) return;

    if (durationMillis < MIN_RECORDING_DURATION_MS) {
      Alert.alert('Vocal trop court', 'Maintenez un peu plus longtemps pour envoyer un message vocal.');
      return;
    }

    await onSendVoice(uri, durationMillis, { replyTo });
  };

  const toggleRecording = async () => {
    if (mediaBusy || disabled) {
      if (disabled) {
        Alert.alert('Action indisponible', disabledReason || 'Vous ne pouvez pas envoyer de message pour le moment.');
      }
      return;
    }

    try {
      setBusy(true);
      setShowEmojiPanel(false);
      setShowAttachMenu(false);
      stopTypingIfNeeded();
      if (recording) {
        await finishRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (_unused) {
          // no-op
        }
      }
      setRecording(null);
      setRecordingDuration(0);
      await resetAudioMode().catch(() => {});
      Alert.alert('Audio indisponible', error.message || 'Impossible de gérer l\u2019enregistrement.');
    } finally {
      setBusy(false);
    }
  };

  const cancelRecording = async () => {
    if (!recording || mediaBusy) return;

    try {
      setBusy(true);
      await finishRecording({ cancel: true });
    } catch (error) {
      Alert.alert('Annulation impossible', error.message || 'Impossible d\u2019annuler ce vocal.');
    } finally {
      setBusy(false);
    }
  };

  const handlePickEmoji = (emoji) => {
    emitTyping(`${text}${emoji}`);
  };

  const hasText = Boolean(text.trim());
  const sendDisabled = useMemo(
    () => disabled || !hasText || mediaBusy || Boolean(recording),
    [disabled, hasText, mediaBusy, recording]
  );
  const placeholder = disabled
    ? disabledReason || 'Envoi indisponible'
    : uploadingMedia
      ? 'Transfert en cours…'
      : 'Écrire…';

  return (
    <>
      <View style={styles.container}>

        {/* Upload / Recording status banner */}
        {uploadingMedia ? (
          <View style={styles.statusBanner}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={styles.statusBannerText}>
              {uploadLabel || 'Envoi du média en cours'}
              {uploadProgress > 0 ? ` · ${uploadProgress}%` : ''}
            </Text>
          </View>
        ) : recording ? (
          <View style={styles.statusBanner}>
            <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
            <Text style={styles.statusBannerText}>
              {formatRecordingDuration(recordingDuration)} · Appuyez sur Stop pour envoyer
            </Text>
            <Pressable onPress={cancelRecording} style={styles.cancelRecordingBtn} disabled={mediaBusy}>
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        ) : null}

        {/* Reply preview */}
        {replyTo ? (
          <View style={styles.replyPreview}>
            <View style={styles.replyAccent} />
            <View style={styles.replyBody}>
              <Text style={styles.replyTitle} numberOfLines={1}>
                {replyTo.senderName}
              </Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {replyTo.preview}
              </Text>
            </View>
            <Pressable onPress={onCancelReply} style={styles.replyClose} hitSlop={8}>
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        ) : null}

        {/* LORD IMPERIAL Custom Emoji Panel */}
        {showCustomEmoji ? (
          <CustomEmojiPanel onPickEmoji={handlePickCustomEmoji} />
        ) : null}

        {/* Emoji panel */}
        {showEmojiPanel ? (
          <ScrollView
            style={styles.emojiPanel}
            contentContainerStyle={styles.emojiPanelContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {EMOJI_CATEGORIES.map((category) => (
              <View key={category.title} style={styles.emojiCategory}>
                <Text style={styles.emojiCategoryTitle}>{category.title}</Text>
                <View style={styles.emojiGrid}>
                  {category.emojis.map((emoji, index) => (
                    <Pressable
                      key={`${category.title}_${emoji}_${index}`}
                      onPress={() => handlePickEmoji(emoji)}
                      style={styles.emojiChip}
                    >
                      <Text style={styles.emojiChipText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {/* Attach menu (photo / video / poll / sticker) */}
        {(showAttachMenu || attachMenuAnim._value > 0) && !recording ? (
          <Animated.View style={[styles.attachMenu, {
            opacity: attachMenuAnim,
            transform: [{ translateY: attachMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          }]}>
            <Pressable
              onPress={handlePickImage}
              style={styles.attachItem}
              disabled={disabled || mediaBusy}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="image" size={20} color="#fff" />
              </View>
              <Text style={styles.attachLabel}>Photo</Text>
            </Pressable>
            <Pressable
              onPress={handlePickVideo}
              style={styles.attachItem}
              disabled={disabled || mediaBusy}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#E91E63' }]}>
                <Ionicons name="videocam" size={20} color="#fff" />
              </View>
              <Text style={styles.attachLabel}>Vidéo</Text>
            </Pressable>
            <Pressable
              onPress={handleOpenPollComposer}
              style={styles.attachItem}
              disabled={disabled || mediaBusy}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="bar-chart" size={20} color="#fff" />
              </View>
              <Text style={styles.attachLabel}>Sondage</Text>
            </Pressable>
            <Pressable
              onPress={handleOpenStickerComposer}
              style={styles.attachItem}
              disabled={disabled || mediaBusy}
            >
              <View style={[styles.attachIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="pricetag" size={20} color="#fff" />
              </View>
              <Text style={styles.attachLabel}>Sticker</Text>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* ── Main flat input row ── */}
        <View style={[styles.inputRow, inputFocused && styles.inputRowFocused]}>

          {/* LORD IMPERIAL custom emoji toggle */}
          <Pressable
            onPress={toggleCustomEmoji}
            style={[styles.iconButton, showCustomEmoji && styles.iconButtonActive]}
            disabled={disabled || Boolean(recording)}
          >
            <Text style={{ fontSize: 16 }}>👑</Text>
          </Pressable>

          {/* Emoji toggle */}
          <Pressable
            onPress={() => {
              setShowEmojiPanel((prev) => !prev);
              setShowAttachMenu(false);
            }}
            style={styles.sideBtn}
            hitSlop={4}
          >
            <Ionicons
              name={showEmojiPanel ? 'close-circle-outline' : 'happy-outline'}
              size={22}
              color={theme.colors.textMuted}
            />
          </Pressable>

          {/* Text input – takes all remaining space */}
          <TextInput
            value={text}
            onChangeText={emitTyping}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            editable={!disabled && !mediaBusy && !recording}
            style={[styles.input, disabled && styles.inputDisabled]}
            multiline
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            selectionColor={theme.colors.accent}
          />

          {/* Attachment toggle – only when no text and not recording */}
          {!hasText && !recording ? (
            <Pressable
              onPress={() => {
                setShowAttachMenu((prev) => !prev);
                setShowEmojiPanel(false);
              }}
              style={styles.sideBtn}
              hitSlop={4}
              disabled={disabled || mediaBusy}
            >
              <Ionicons
                name={showAttachMenu ? 'close-outline' : 'attach-outline'}
                size={22}
                color={theme.colors.textMuted}
              />
            </Pressable>
          ) : null}

          {/* Camera shortcut – only when no text and not recording */}
          {!hasText && !recording ? (
            <Pressable
              onPress={handlePickImage}
              style={styles.sideBtn}
              hitSlop={4}
              disabled={disabled || mediaBusy}
            >
              {mediaBusy ? (
                <ActivityIndicator size="small" color={theme.colors.textMuted} />
              ) : (
                <Ionicons name="camera-outline" size={22} color={theme.colors.textMuted} />
              )}
            </Pressable>
          ) : null}

          {/* Compteur de caractères - visible quand > 200 chars */}
          {text.length > 200 ? (
            <Text style={[styles.charCount, text.length > 3800 && styles.charCountCritical]}>
              {text.length}/4000
            </Text>
          ) : null}

          {/* Send / Mic button – inline at the right end */}
          {hasText ? (
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <Pressable
                onPress={handleSend}
                style={[styles.roundBtn, styles.sendBtn, sendDisabled && styles.roundBtnDisabled]}
                disabled={sendDisabled}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
                )}
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              onPress={toggleRecording}
              style={[
                styles.roundBtn,
                recording ? styles.stopBtn : styles.micBtn,
                (disabled || uploadingMedia) && styles.roundBtnDisabled,
              ]}
              disabled={mediaBusy || disabled}
            >
              {mediaBusy && !recording ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name={recording ? 'stop' : 'mic'} size={20} color="#fff" />
              )}
            </Pressable>
          )}
        </View>
      </View>

      <PollComposerModal
        visible={showPollComposer}
        onClose={() => setShowPollComposer(false)}
        onSubmit={handleSubmitPoll}
        disabled={disabled}
      />
      <StickerComposerModal
        visible={showStickerComposer}
        ownerId={stickerOwnerId}
        disabled={disabled || mediaBusy}
        replyTo={replyTo}
        onClose={() => setShowStickerComposer(false)}
        onCreateSticker={onCreateSticker}
        onSendSticker={onSendSticker}
      />
    </>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 8,
      paddingBottom: 8,
      paddingTop: 4,
      backgroundColor: theme.colors.background,
    },

    // Status banners (upload / recording)
    statusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 5,
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    recordingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.danger,
      shadowColor: theme.colors.danger,
      shadowOpacity: 0.6,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 0 },
    },
    statusBannerText: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    cancelRecordingBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
    },

    // Reply preview
    replyPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginBottom: 5,
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    replyAccent: {
      width: 3,
      alignSelf: 'stretch',
      borderRadius: 999,
      backgroundColor: theme.colors.primary,
    },
    replyBody: {
      flex: 1,
      minWidth: 0,
    },
    replyTitle: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },
    replyText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 1,
    },
    replyClose: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Emoji panel
    emojiPanel: {
      maxHeight: 210,
      marginBottom: 5,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emojiPanelContent: {
      padding: 10,
      gap: 10,
    },
    emojiCategory: {
      gap: 6,
    },
    emojiCategoryTitle: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    emojiChip: {
      minWidth: 38,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    emojiChipText: {
      fontSize: 20,
    },

    // Attach quick-menu
    attachMenu: {
      flexDirection: 'row',
      gap: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 5,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    attachItem: {
      alignItems: 'center',
      gap: 5,
    },
    attachIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },

    // ── Flat single-row input bar ──
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.input,
      borderRadius: 26,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      paddingHorizontal: 4,
      paddingVertical: 4,
      minHeight: 52,
      gap: 2,
    },
    inputRowFocused: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.18,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
      elevation: 3,
    },
    charCount: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
      paddingHorizontal: 4,
      minWidth: 40,
      textAlign: 'right',
    },
    charCountCritical: {
      color: theme.colors.danger,
    },
    sideBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
      flexShrink: 0,
    },
    input: {
      flex: 1,
      minHeight: 36,
      maxHeight: 130,
      color: theme.colors.text,
      fontSize: 15.5,
      lineHeight: 22,
      paddingTop: 8,
      paddingBottom: 8,
      paddingHorizontal: 6,
      textAlignVertical: 'center',
      letterSpacing: 0.1,
    },
    inputDisabled: {
      opacity: 0.6,
    },

    // Send / mic circular button – now inside inputRow
    roundBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    micBtn: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    stopBtn: {
      backgroundColor: theme.colors.danger,
    },
    sendBtn: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    },
    roundBtnDisabled: {
      opacity: 0.5,
    },
  });
