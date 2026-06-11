import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';
import { getConversationMediaMessages } from '../services/chat';

const COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 4) / COLUMNS);

export default function GalleryScreen({ route }) {
  const { chatId } = route.params;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    getConversationMediaMessages({ chatId })
      .then((msgs) => {
        if (active) {
          setItems(msgs);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [chatId]);

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable style={styles.cell} onPress={() => setSelected(item)}>
        <Image source={{ uri: item.mediaUrl || item.localUri }} style={styles.thumb} resizeMode="cover" />
        {item.type === 'video' ? (
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        ) : null}
      </Pressable>
    ),
    [styles]
  );

  const keyExtractor = useCallback((item) => item.id || item.clientId || String(item.createdAtMs), []);

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Médias partagés</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="images-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>Aucun média partagé</Text>
          <Text style={styles.emptySubtext}>Les images et vidéos envoyées dans cette conversation apparaîtront ici.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBg}>
          <Pressable style={styles.modalClose} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          {selected ? (
            <Image
              source={{ uri: selected.mediaUrl || selected.localUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    heading: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 14,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyText: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    emptySubtext: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    grid: {
      gap: 2,
      paddingBottom: 40,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      margin: 1,
    },
    thumb: {
      width: '100%',
      height: '100%',
    },
    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    modalBg: {
      flex: 1,
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalClose: {
      position: 'absolute',
      top: 52,
      right: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullImage: {
      width: SCREEN_WIDTH,
      height: '80%',
    },
  });
