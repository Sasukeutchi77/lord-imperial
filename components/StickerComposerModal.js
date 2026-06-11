import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import { pickStickerMediaFromLibrary, takeStickerPhoto } from '../services/imagePicker';
import { getSavedStickers, removeStickerForUser, reorderSticker } from '../services/stickers';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const suggestNameFromAsset = (asset = {}) => {
  const base = String(asset?.fileName || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return base ? base.slice(0, 32) : '';
};

const validateAsset = (asset) => {
  if (!asset?.uri) {
    return { valid: false, message: 'Aucun fichier s\u00e9lectionn\u00e9.' };
  }
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    return { valid: false, message: 'Le fichier est trop volumineux (max 10 Mo). Choisissez une image plus l\u00e9g\u00e8re.' };
  }
  const w = Number(asset.width || 0);
  const h = Number(asset.height || 0);
  if (w > 0 && h > 0 && (w < 32 || h < 32)) {
    return { valid: false, message: 'L\u2019image est trop petite (minimum 32x32 pixels).' };
  }
  return { valid: true, message: '' };
};

export default function StickerComposerModal({
  visible,
  ownerId,
  disabled = false,
  replyTo = null,
  onClose,
  onCreateSticker,
  onSendSticker,
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState('library');
  const [stickers, setStickers] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [stickerName, setStickerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const progressAnim = useMemo(() => new Animated.Value(0), []);

  const loadStickers = useCallback(async () => {
    if (!ownerId) {
      setStickers([]);
      return;
    }

    try {
      setLibraryLoading(true);
      const next = await getSavedStickers(ownerId);
      setStickers(next);
      if (!next.length) {
        setActiveTab('create');
      }
    } catch (error) {
      Alert.alert('Biblioth\u00e8que indisponible', error.message || 'Impossible de charger vos stickers.');
    } finally {
      setLibraryLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (!visible) return undefined;
    loadStickers();
    return undefined;
  }, [loadStickers, visible]);

  useEffect(() => {
    if (!visible) {
      setSelectedAsset(null);
      setStickerName('');
      setActionBusy('');
      setSearchQuery('');
      setUploadProgress(0);
      setValidationError('');
      progressAnim.setValue(0);
    }
  }, [visible, progressAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress, progressAnim]);

  const filteredStickers = useMemo(() => {
    if (!searchQuery.trim()) return stickers;
    const q = searchQuery.trim().toLowerCase();
    return stickers.filter((s) => (s.name || '').toLowerCase().includes(q));
  }, [stickers, searchQuery]);

  const pickStickerAsset = async () => {
    try {
      const asset = await pickStickerMediaFromLibrary();
      if (!asset) return;
      const validation = validateAsset(asset);
      if (!validation.valid) {
        setValidationError(validation.message);
        return;
      }
      setValidationError('');
      setSelectedAsset(asset);
      setStickerName((previous) => previous || suggestNameFromAsset(asset));
    } catch (error) {
      Alert.alert('S\u00e9lection impossible', error.message || 'Impossible de choisir ce m\u00e9dia.');
    }
  };

  const takeStickerAsset = async () => {
    try {
      const asset = await takeStickerPhoto();
      if (!asset) return;
      const validation = validateAsset(asset);
      if (!validation.valid) {
        setValidationError(validation.message);
        return;
      }
      setValidationError('');
      setSelectedAsset(asset);
      setStickerName((previous) => previous || 'Photo sticker');
    } catch (error) {
      Alert.alert('Capture impossible', error.message || 'Impossible de prendre la photo.');
    }
  };

  const handleSaveSticker = async ({ sendToChat = false } = {}) => {
    if (!onCreateSticker) {
      Alert.alert('Indisponible', 'La cr\u00e9ation de stickers n\u2019est pas encore branch\u00e9e.');
      return;
    }

    if (disabled) {
      Alert.alert('Action indisponible', 'Vous ne pouvez pas publier ou enregistrer de sticker pour le moment.');
      return;
    }

    if (!String(stickerName || '').trim()) {
      setValidationError('Donnez un nom au sticker avant de continuer.');
      return;
    }

    try {
      setActionBusy(sendToChat ? 'create_send' : 'create_save');
      setUploadProgress(0);
      const sticker = await onCreateSticker({
        asset: selectedAsset,
        name: stickerName,
        sendToChat,
        replyTo,
        onProgress: (p) => setUploadProgress(p),
      });
      await loadStickers();
      if (sendToChat) {
        onClose?.();
      } else if (sticker) {
        setSelectedAsset(null);
        setStickerName('');
        setValidationError('');
        setActiveTab('library');
        Alert.alert('Sticker enregistr\u00e9', 'Votre sticker est maintenant disponible dans votre biblioth\u00e8que personnelle.');
      }
    } catch (error) {
      Alert.alert('Cr\u00e9ation impossible', error.message || 'Le sticker n\u2019a pas pu \u00eatre cr\u00e9\u00e9.');
    } finally {
      setActionBusy('');
      setUploadProgress(0);
    }
  };

  const handleSendSavedSticker = async (sticker) => {
    if (!onSendSticker) {
      Alert.alert('Indisponible', 'L\u2019envoi de stickers n\u2019est pas encore branch\u00e9.');
      return;
    }

    if (disabled) {
      Alert.alert('Action indisponible', 'Vous ne pouvez pas envoyer de sticker dans cette discussion.');
      return;
    }

    try {
      setActionBusy(`send_${sticker.id}`);
      await onSendSticker(sticker, { replyTo });
      onClose?.();
    } catch (error) {
      Alert.alert('Envoi impossible', error.message || 'Le sticker n\u2019a pas pu \u00eatre envoy\u00e9.');
    } finally {
      setActionBusy('');
    }
  };

  const handleDeleteSticker = async (stickerId) => {
    Alert.alert('Supprimer ce sticker', 'Ce sticker sera retir\u00e9 de votre biblioth\u00e8que personnelle.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionBusy(`delete_${stickerId}`);
            await removeStickerForUser(ownerId, stickerId);
            await loadStickers();
          } catch (error) {
            Alert.alert('Suppression impossible', error.message || 'Le sticker n\u2019a pas pu \u00eatre supprim\u00e9.');
          } finally {
            setActionBusy('');
          }
        },
      },
    ]);
  };

  const handleMoveSticker = async (stickerId, direction) => {
    try {
      await reorderSticker(ownerId, stickerId, direction);
      await loadStickers();
    } catch (_error) {}
  };

  const createDisabled = !selectedAsset?.uri || !String(stickerName || '').trim() || Boolean(actionBusy);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Stickers</Text>
              <Text style={styles.subtitle}>
                {activeTab === 'library'
                  ? `${stickers.length} sticker${stickers.length !== 1 ? 's' : ''} dans votre biblioth\u00e8que`
                  : 'Cr\u00e9ez un sticker avec une image, un GIF ou la cam\u00e9ra'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.tabsRow}>
            <Pressable style={[styles.tabButton, activeTab === 'library' && styles.tabButtonActive]} onPress={() => setActiveTab('library')}>
              <Ionicons name="grid-outline" size={16} color={activeTab === 'library' ? '#fff' : theme.colors.text} />
              <Text style={[styles.tabLabel, activeTab === 'library' && styles.tabLabelActive]}>Biblioth\u00e8que</Text>
            </Pressable>
            <Pressable style={[styles.tabButton, activeTab === 'create' && styles.tabButtonActive]} onPress={() => setActiveTab('create')}>
              <Ionicons name="add-circle-outline" size={16} color={activeTab === 'create' ? '#fff' : theme.colors.text} />
              <Text style={[styles.tabLabel, activeTab === 'create' && styles.tabLabelActive]}>Cr\u00e9er</Text>
            </Pressable>
          </View>

          {activeTab === 'library' ? (
            <View style={styles.libraryWrap}>
              {stickers.length > 3 ? (
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={16} color={theme.colors.textMuted} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Rechercher un sticker..."
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.searchInput}
                  />
                  {searchQuery ? (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {libraryLoading ? (
                <View style={styles.centerState}>
                  <ActivityIndicator color={theme.colors.accent} />
                  <Text style={styles.stateText}>Chargement de vos stickers...</Text>
                </View>
              ) : filteredStickers.length ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
                  {filteredStickers.map((sticker) => {
                    const busy = actionBusy === `send_${sticker.id}` || actionBusy === `delete_${sticker.id}`;
                    return (
                      <View key={sticker.id} style={styles.stickerCard}>
                        <View style={styles.stickerActions}>
                          <Pressable style={styles.actionPill} onPress={() => handleMoveSticker(sticker.id, 'up')} disabled={Boolean(actionBusy)}>
                            <Ionicons name="arrow-up" size={12} color={theme.colors.textMuted} />
                          </Pressable>
                          <Pressable style={styles.deletePill} onPress={() => handleDeleteSticker(sticker.id)} disabled={Boolean(actionBusy)}>
                            <Ionicons name="trash-outline" size={12} color={theme.colors.danger} />
                          </Pressable>
                        </View>
                        <Pressable style={styles.stickerPreviewButton} onPress={() => handleSendSavedSticker(sticker)} disabled={busy || Boolean(actionBusy)}>
                          <Image source={{ uri: sticker.mediaUrl }} style={styles.stickerPreview} resizeMode="contain" />
                          {busy ? <ActivityIndicator style={styles.stickerBusy} color={theme.colors.accent} /> : null}
                        </Pressable>
                        <Text style={styles.stickerName} numberOfLines={2}>{sticker.name}</Text>
                        {sticker.animated ? (
                          <View style={styles.gifBadge}>
                            <Text style={styles.gifBadgeText}>GIF</Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              ) : searchQuery ? (
                <View style={styles.centerState}>
                  <Ionicons name="search-outline" size={26} color={theme.colors.textMuted} />
                  <Text style={styles.stateTitle}>Aucun r\u00e9sultat</Text>
                  <Text style={styles.stateText}>Aucun sticker ne correspond \u00e0 "{searchQuery}".</Text>
                </View>
              ) : (
                <View style={styles.centerState}>
                  <Ionicons name="pricetags-outline" size={26} color={theme.colors.textMuted} />
                  <Text style={styles.stateTitle}>Aucun sticker enregistr\u00e9</Text>
                  <Text style={styles.stateText}>Passez sur l'onglet "Cr\u00e9er" pour ajouter votre premier sticker image ou GIF.</Text>
                </View>
              )}
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.createContent}>
              <View style={styles.sourceRow}>
                <Pressable style={styles.sourceButton} onPress={pickStickerAsset} disabled={Boolean(actionBusy)}>
                  <Ionicons name="images-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.sourceLabel}>Galerie</Text>
                </Pressable>
                <Pressable style={styles.sourceButton} onPress={takeStickerAsset} disabled={Boolean(actionBusy)}>
                  <Ionicons name="camera-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.sourceLabel}>Cam\u00e9ra</Text>
                </Pressable>
              </View>

              <Pressable style={styles.mediaPicker} onPress={pickStickerAsset} disabled={Boolean(actionBusy)}>
                {selectedAsset?.uri ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: selectedAsset.uri }} style={styles.selectedPreview} resizeMode="contain" />
                    <Pressable style={styles.changeImageButton} onPress={pickStickerAsset}>
                      <Ionicons name="refresh" size={16} color="#fff" />
                      <Text style={styles.changeImageText}>Changer</Text>
                    </Pressable>
                    {selectedAsset.width && selectedAsset.height ? (
                      <View style={styles.dimensionsBadge}>
                        <Text style={styles.dimensionsText}>{selectedAsset.width}x{selectedAsset.height}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.placeholderWrap}>
                    <View style={styles.placeholderIcon}>
                      <Ionicons name="images-outline" size={32} color={theme.colors.textMuted} />
                    </View>
                    <Text style={styles.placeholderTitle}>Choisir une image ou un GIF</Text>
                    <Text style={styles.placeholderText}>Formats accept\u00e9s : JPG, PNG, GIF, WebP. Taille max : 10 Mo.</Text>
                  </View>
                )}
              </Pressable>

              {validationError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              ) : null}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Nom du sticker</Text>
                <TextInput
                  value={stickerName}
                  onChangeText={(text) => {
                    setStickerName(text);
                    if (validationError && text.trim()) setValidationError('');
                  }}
                  placeholder="Ex. Empereur heureux"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.input, validationError && !stickerName.trim() && styles.inputError]}
                  editable={!actionBusy}
                  maxLength={32}
                />
                <View style={styles.fieldFooter}>
                  <Text style={styles.fieldHint}>Le nom sera visible sous le sticker.</Text>
                  <Text style={styles.charCount}>{stickerName.length}/32</Text>
                </View>
              </View>

              {actionBusy && uploadProgress > 0 ? (
                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                  </View>
                  <Text style={styles.progressLabel}>{Math.round(uploadProgress * 100)}%</Text>
                </View>
              ) : null}

              <View style={styles.actionsColumn}>
                <Pressable style={[styles.primaryAction, createDisabled && styles.actionDisabled]} onPress={() => handleSaveSticker({ sendToChat: false })} disabled={createDisabled}>
                  {actionBusy === 'create_save' ? (
                    <View style={styles.busyRow}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.primaryActionText}>Enregistrement...</Text>
                    </View>
                  ) : (
                    <View style={styles.busyRow}>
                      <Ionicons name="bookmark-outline" size={18} color="#fff" />
                      <Text style={styles.primaryActionText}>Enregistrer le sticker</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable style={[styles.secondaryAction, createDisabled && styles.actionDisabled]} onPress={() => handleSaveSticker({ sendToChat: true })} disabled={createDisabled}>
                  {actionBusy === 'create_send' ? (
                    <View style={styles.busyRow}>
                      <ActivityIndicator color={theme.colors.text} size="small" />
                      <Text style={styles.secondaryActionText}>Envoi en cours...</Text>
                    </View>
                  ) : (
                    <View style={styles.busyRow}>
                      <Ionicons name="send-outline" size={16} color={theme.colors.text} />
                      <Text style={styles.secondaryActionText}>Cr\u00e9er et envoyer</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      maxHeight: '90%',
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      gap: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '900',
    },
    subtitle: {
      color: theme.colors.textMuted,
      marginTop: 4,
      lineHeight: 19,
      fontSize: 13,
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    tabButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      gap: 8,
    },
    tabButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabLabel: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 13,
    },
    tabLabelActive: {
      color: '#fff',
    },
    libraryWrap: {
      minHeight: 260,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
      paddingVertical: 0,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingBottom: 24,
    },
    stickerCard: {
      width: '30%',
      minWidth: 92,
      maxWidth: 115,
      padding: 8,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: 'relative',
      gap: 6,
    },
    stickerActions: {
      position: 'absolute',
      top: 6,
      right: 6,
      zIndex: 4,
      flexDirection: 'row',
      gap: 4,
    },
    actionPill: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    deletePill: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    stickerPreviewButton: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    },
    stickerPreview: {
      width: '100%',
      height: '100%',
    },
    stickerBusy: {
      position: 'absolute',
    },
    stickerName: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 2,
    },
    gifBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: 'rgba(255,193,7,0.9)',
      borderRadius: 6,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    gifBadgeText: {
      color: '#000',
      fontSize: 9,
      fontWeight: '900',
    },
    centerState: {
      minHeight: 260,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      gap: 10,
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
    },
    stateText: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
    createContent: {
      gap: 14,
      paddingBottom: 22,
    },
    sourceRow: {
      flexDirection: 'row',
      gap: 10,
    },
    sourceButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sourceLabel: {
      color: theme.colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    mediaPicker: {
      minHeight: 200,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    previewContainer: {
      width: '100%',
      position: 'relative',
    },
    selectedPreview: {
      width: '100%',
      height: 200,
    },
    changeImageButton: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    changeImageText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    dimensionsBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dimensionsText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },
    placeholderWrap: {
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 18,
      paddingVertical: 20,
    },
    placeholderIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
    },
    placeholderText: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      fontSize: 13,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: theme.radius.md,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.3)',
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    fieldWrap: {
      gap: 8,
    },
    fieldLabel: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 13,
    },
    input: {
      minHeight: 50,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    fieldFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fieldHint: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    charCount: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    progressWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progressTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.surfaceMuted,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    progressLabel: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '800',
      minWidth: 36,
      textAlign: 'right',
    },
    actionsColumn: {
      gap: 10,
    },
    primaryAction: {
      minHeight: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    primaryActionText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 14,
    },
    secondaryAction: {
      minHeight: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    secondaryActionText: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 14,
    },
    actionDisabled: {
      opacity: 0.55,
    },
    busyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
