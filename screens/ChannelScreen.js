import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';
import { createChannel, searchUserByUsername } from '../services/chat';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';
import { pickImageFromLibrary } from '../services/imagePicker';

export default function ChannelScreen({ navigation }) {
  const { profile } = useAuth();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // localAvatarUri: URI locale affichée immédiatement avant upload
  const [localAvatarUri, setLocalAvatarUri] = useState(null);

  const [memberQuery, setMemberQuery] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  const avatarScale = useRef(new Animated.Value(1)).current;

  const subscriberLabel = useMemo(
    () =>
      `${members.length} abonné${members.length > 1 ? 's' : ''} sélectionné${members.length > 1 ? 's' : ''}`,
    [members.length]
  );

  const pickAvatar = async () => {
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.90, duration: 70, useNativeDriver: true }),
      Animated.timing(avatarScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    try {
      setPickingImage(true);
      const uri = await pickImageFromLibrary();
      if (uri) {
        // Afficher l'aperçu local immédiatement
        setLocalAvatarUri(uri);
      }
    } catch (error) {
      Alert.alert('Image indisponible', error.message || 'Impossible de choisir cette image.');
    } finally {
      setPickingImage(false);
    }
  };

  const lookupMember = async () => {
    try {
      setSearching(true);
      const user = await searchUserByUsername(memberQuery);
      if (!user) {
        Alert.alert('Introuvable', 'Aucun utilisateur trouvé avec ce pseudo.');
        setCandidate(null);
        return;
      }
      if (user.uid === profile.uid) {
        Alert.alert('Info', 'Vous êtes déjà administrateur du canal.');
        setCandidate(null);
        return;
      }
      setCandidate(user);
    } catch (error) {
      setCandidate(null);
      Alert.alert('Recherche impossible', error.message || 'Veuillez réessayer.');
    } finally {
      setSearching(false);
    }
  };

  const addMember = () => {
    if (!candidate) return;
    if (members.some((item) => item.uid === candidate.uid)) {
      Alert.alert('Déjà ajouté', 'Cet abonné est déjà sélectionné.');
      return;
    }
    setMembers((prev) => [...prev, candidate]);
    setCandidate(null);
    setMemberQuery('');
  };

  const removeMember = (uid) => {
    setMembers((prev) => prev.filter((member) => member.uid !== uid));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Nom requis', 'Donnez un nom à votre canal.');
      return;
    }
    try {
      setLoading(true);
      // Passer localAvatarUri — createChannel s'occupe de l'upload via uploadConversationAvatar
      const chatId = await createChannel({
        owner: profile,
        title,
        description,
        members,
        avatarUri: localAvatarUri || null,
      });
      navigation.replace('Chat', { chatId, initialTitle: title.trim() });
    } catch (error) {
      Alert.alert('Création impossible', error.message || 'Le canal n\'a pas pu être créé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un canal</Text>
        <Text style={styles.subtitle}>
          Définissez l'identité du canal. Vous pourrez ensuite décider si seuls les admins publient ou non.
        </Text>

        <View style={styles.card}>
          {/* Section avatar */}
          <View style={styles.avatarSection}>
            <Pressable onPress={pickAvatar} disabled={pickingImage} style={styles.avatarPressable}>
              <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                <Avatar uri={localAvatarUri} label={title || 'CA'} size={80} />
                <View style={styles.avatarOverlay}>
                  {pickingImage ? (
                    <Ionicons name="hourglass" size={16} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  )}
                </View>
              </Animated.View>
            </Pressable>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarLabel}>Photo du canal</Text>
              <Text style={styles.avatarHint}>
                {pickingImage
                  ? 'Chargement…'
                  : localAvatarUri
                  ? 'Photo sélectionnée'
                  : 'Optionnel — touchez pour choisir'}
              </Text>
              <Pressable
                style={[styles.changePhotoBtn, localAvatarUri && styles.changePhotoBtnActive]}
                onPress={pickAvatar}
                disabled={pickingImage}
              >
                <Ionicons
                  name={localAvatarUri ? 'checkmark' : 'image-outline'}
                  size={14}
                  color={localAvatarUri ? theme.colors.success : theme.colors.text}
                />
                <Text style={[styles.changePhotoText, localAvatarUri && styles.changePhotoTextActive]}>
                  {localAvatarUri ? 'Photo sélectionnée' : 'Choisir une photo'}
                </Text>
              </Pressable>
            </View>
          </View>

          <ThemedTextInput
            label="Nom du canal"
            placeholder="Annonces Impériales"
            value={title}
            onChangeText={setTitle}
          />
          <ThemedTextInput
            label="Description"
            placeholder="Informations publiques, annonces, diffusion…"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <ThemedTextInput
            label="Ajouter un abonné"
            placeholder="@username"
            autoCapitalize="none"
            value={memberQuery}
            onChangeText={setMemberQuery}
          />
          <PrimaryButton title="Chercher cet abonné" onPress={lookupMember} loading={searching} />
        </View>

        {candidate ? (
          <View style={styles.memberCard}>
            <Avatar uri={candidate.avatar} label={candidate.displayName || candidate.username} size={58} />
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{candidate.displayName || candidate.username}</Text>
              <Text style={styles.memberEmail}>{candidate.username}</Text>
            </View>
            <Pressable style={styles.addButton} onPress={addMember}>
              <Ionicons name="add" size={22} color="#fff" />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Abonnés sélectionnés</Text>
          <Text style={styles.sectionCount}>{subscriberLabel}</Text>
        </View>

        <View style={styles.chipsWrap}>
          {members.length ? (
            members.map((member) => (
              <View key={member.uid} style={styles.chip}>
                <Text style={styles.chipText}>{member.displayName || member.username}</Text>
                <Pressable onPress={() => removeMember(member.uid)} hitSlop={8}>
                  <Ionicons name="close" size={15} color={theme.colors.textMuted} />
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHint}>
              Vous pouvez créer le canal sans abonné et les ajouter ensuite.
            </Text>
          )}
        </View>

        <PrimaryButton title="Créer le canal" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    title: { color: theme.colors.text, fontSize: 28, fontWeight: '900', marginTop: 8, letterSpacing: -0.5 },
    subtitle: { color: theme.colors.textMuted, marginTop: 10, lineHeight: 22, fontSize: 14 },
    card: {
      marginTop: 22,
      padding: 20,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 14,
    },
    avatarSection: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
      marginBottom: 6,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatarPressable: { position: 'relative' },
    avatarOverlay: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: theme.colors.surface,
    },
    avatarInfo: { flex: 1, gap: 4 },
    avatarLabel: { color: theme.colors.text, fontWeight: '800', fontSize: 16 },
    avatarHint: { color: theme.colors.textMuted, fontSize: 13 },
    changePhotoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: theme.radius.pill,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    changePhotoBtnActive: {
      borderColor: theme.colors.success,
      backgroundColor: 'rgba(55,214,122,0.08)',
    },
    changePhotoText: { color: theme.colors.text, fontWeight: '700', fontSize: 13 },
    changePhotoTextActive: { color: theme.colors.success },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      marginTop: 18,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    memberName: { color: theme.colors.text, fontWeight: '800', fontSize: 16 },
    memberEmail: { color: theme.colors.textMuted, marginTop: 3, fontSize: 13 },
    addButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 12,
    },
    section: { color: theme.colors.text, fontSize: 17, fontWeight: '800' },
    sectionCount: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 13,
      paddingVertical: 9,
      backgroundColor: 'rgba(22,242,209,0.10)',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(22,242,209,0.28)',
    },
    chipText: { color: theme.colors.text, fontWeight: '700', fontSize: 13 },
    emptyHint: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  });
