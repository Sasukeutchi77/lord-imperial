import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useAppTheme } from '../utils/theme';

export default function FullscreenImageViewer({ visible, imageUri, onClose }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [saving, setSaving] = React.useState(false);

  const handleSave = React.useCallback(async () => {
    if (!imageUri) return;

    try {
      setSaving(true);
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission refusée', 'Autorisez l’accès à la galerie pour enregistrer cette image.');
        return;
      }

      let localUri = imageUri;
      if (String(imageUri).startsWith('http')) {
        const targetUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}chat-image-${Date.now()}.jpg`;
        const download = await FileSystem.downloadAsync(imageUri, targetUri);
        localUri = download.uri;
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Image enregistrée', 'La photo a été ajoutée à votre galerie.');
    } catch (error) {
      Alert.alert('Enregistrement impossible', error.message || 'Impossible de sauvegarder cette image.');
    } finally {
      setSaving(false);
    }
  }, [imageUri]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
          <Pressable onPress={handleSave} style={styles.headerButton} disabled={saving || !imageUri}>
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="download-outline" size={22} color="#fff" />}
          </Pressable>
        </View>

        <Pressable style={styles.imageArea} onPress={onClose}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" /> : null}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Appuyez sur télécharger pour enregistrer</Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    header: {
      marginTop: 18,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    imageArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 28,
      alignItems: 'center',
    },
    footerText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 12,
      opacity: 0.86,
    },
  });
