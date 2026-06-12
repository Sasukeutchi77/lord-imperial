import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import ScreenContainer from '../components/ScreenContainer';
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';
import ThemedTextInput from '../components/ThemedTextInput';
import ProfileCardPickerModal from '../components/ProfileCardPickerModal';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';
import { logoutUser, updateUserProfile } from '../services/auth';
import { auth, db } from '../services/firebase';
import { formatLastSeen, getCertificationStatus, getUserLevel, normalizeBio, normalizeDisplayName, toDate, validateUsername } from '../utils/helpers';
import { pickImageFromLibrary } from '../services/imagePicker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();

  const [form, setForm] = useState({ username: '', displayName: '', bio: '' });
  const [localAvatarUri, setLocalAvatarUri] = useState(null);
  const [localProfileCard, setLocalProfileCard] = useState(undefined);
  const [cardPickerVisible, setCardPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setForm({
      username: profile?.username || '',
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
    });
  }, [profile?.username, profile?.displayName, profile?.bio]);

  // Resolve what card effect is currently active
  const activeCard =
    localProfileCard !== undefined ? localProfileCard : (profile?.profileCard || null);

  // The URI to display: local preview first, then Cloudinary URL
  const displayedAvatarUri = localAvatarUri || profile?.avatar || null;

  const normalizedDisplayName = useMemo(() => normalizeDisplayName(form.displayName), [form.displayName]);
  const normalizedBio = useMemo(() => normalizeBio(form.bio), [form.bio]);
  const usernameValidation = useMemo(() => validateUsername(form.username || ''), [form.username]);

  const errors = useMemo(
    () => ({
      username: usernameValidation.valid ? '' : usernameValidation.message,
      displayName: normalizedDisplayName.length >= 2 ? '' : 'Le nom affiché doit contenir au moins 2 caractères.',
      bio: normalizedBio.length <= 160 ? '' : 'La bio doit contenir 160 caractères maximum.',
    }),
    [normalizedBio.length, normalizedDisplayName.length, usernameValidation]
  );

  const dirty = useMemo(
    () =>
      form.username !== (profile?.username || '') ||
      form.displayName !== (profile?.displayName || '') ||
      form.bio !== (profile?.bio || '') ||
      Boolean(localAvatarUri) ||
      localProfileCard !== undefined,
    [form, profile, localAvatarUri, localProfileCard]
  );

  const canSave = dirty && !saving && !errors.username && !errors.displayName && !errors.bio;

  const toggleSection = (setter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((prev) => !prev);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
            } catch (error) {
              Alert.alert('Déconnexion impossible', error.message || 'Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  // Opens the unified picker modal (photo + cards)
  const handleOpenPicker = () => {
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(avatarScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setCardPickerVisible(true);
  };

  // Called from modal when user picks a photo
  const handlePickPhoto = async () => {
    try {
      setPickingImage(true);
      const uri = await pickImageFromLibrary();
      if (uri) {
        setLocalAvatarUri(uri);
      }
    } catch (error) {
      Alert.alert('Image indisponible', error.message || 'Impossible de sélectionner cette image.');
    } finally {
      setPickingImage(false);
    }
  };

  // Called from modal when user selects a card effect
  const handleSelectCard = (cardId) => {
    setLocalProfileCard(cardId);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile({
        uid: profile.uid,
        currentProfile: profile,
        values: {
          ...form,
          displayName: normalizedDisplayName,
          bio: normalizedBio,
          avatarUri: localAvatarUri || null,
          profileCard: localProfileCard !== undefined ? localProfileCard : profile?.profileCard,
        },
      });
      setLocalAvatarUri(null);
      setLocalProfileCard(undefined);
      Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées avec succès.');
    } catch (error) {
      Alert.alert('Mise à jour impossible', error.message || 'Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Mot de passe trop court', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    try {
      setChangingPassword(true);
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès.');
    } catch (error) {
      const msg =
        error.code === 'auth/wrong-password'
          ? 'Le mot de passe actuel est incorrect.'
          : error.message || 'Impossible de changer le mot de passe.';
      Alert.alert('Erreur', msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Mot de passe requis', 'Veuillez entrer votre mot de passe pour confirmer.');
      return;
    }
    Alert.alert(
      'Confirmer la suppression',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const user = auth.currentUser;
              const credential = EmailAuthProvider.credential(user.email, deletePassword);
              await reauthenticateWithCredential(user, credential);
              if (profile?.uid) {
                await deleteDoc(doc(db, 'users', profile.uid)).catch(() => {});
              }
              await deleteUser(user);
            } catch (error) {
              const msg =
                error.code === 'auth/wrong-password'
                  ? 'Le mot de passe est incorrect.'
                  : error.message || 'Impossible de supprimer le compte.';
              Alert.alert('Erreur', msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Label for the photo/card button
  const pickerButtonLabel = useMemo(() => {
    if (pickingImage) return 'Chargement…';
    if (activeCard && localAvatarUri) return 'Photo + Carte prêtes — sauvegarder pour confirmer';
    if (activeCard && !localAvatarUri) return `Carte "${activeCard}" active — sauvegarder pour confirmer`;
    if (localAvatarUri) return 'Photo prête — sauvegarder pour confirmer';
    return profile?.avatar ? 'Changer la photo ou la carte animée' : 'Ajouter une photo ou une carte animée';
  }, [pickingImage, activeCard, localAvatarUri, profile?.avatar]);

  const hasChanges = Boolean(localAvatarUri) || localProfileCard !== undefined;

  return (
    <ScreenContainer withKeyboard contentStyle={styles.containerContent}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero banner */}
        <LinearGradient
          colors={[theme.colors.primaryStrong, theme.colors.primary, '#D4A97A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coverCard}
        >
          <View style={styles.coverTop}>
            <View>
              <Text style={styles.title}>Mon Profil</Text>
              <Text style={styles.headerSub}>Compte et paramètres</Text>
            </View>
            <Pressable style={styles.roundButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={21} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Avatar with animated card — tapping opens unified picker */}
          <Pressable onPress={handleOpenPicker} disabled={pickingImage} style={styles.avatarWrapOuter}>
            <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
              <Avatar
                uri={displayedAvatarUri}
                label={form.displayName || form.username}
                size={110}
                showOnline
                cardEffect={activeCard}
              />
              {/* Camera badge — positioned relative to avatar size */}
              <View style={[styles.avatarCameraBadge, activeCard && styles.avatarCameraBadgeWithCard]}>
                <Ionicons
                  name={pickingImage ? 'hourglass' : 'camera'}
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            </Animated.View>
          </Pressable>
        </LinearGradient>

        {/* Profile info */}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{form.displayName || form.username || '—'}</Text>
          <Text style={styles.usernameText}>
            {form.username ? `@${form.username.replace('@', '')}` : profile?.email || '—'}
          </Text>
          {form.bio ? <Text style={styles.bio}>{form.bio}</Text> : null}

          <View style={styles.metaPill}>
            <Ionicons
              name={profile?.isOnline ? 'ellipse' : 'time-outline'}
              size={11}
              color={profile?.isOnline ? theme.colors.success : theme.colors.textMuted}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.metaPillText}>{formatLastSeen(profile?.lastSeen, profile?.isOnline)}</Text>
          </View>

          {/* Unified photo + card picker button */}
          <Pressable
            style={[styles.photoButton, hasChanges && styles.photoButtonActive]}
            onPress={handleOpenPicker}
            disabled={pickingImage}
          >
            <Ionicons
              name={hasChanges ? 'checkmark-circle' : 'sparkles-outline'}
              size={16}
              color={hasChanges ? theme.colors.success : theme.colors.textSoft}
            />
            <Text style={[styles.photoButtonText, hasChanges && styles.photoButtonTextActive]}>
              {pickerButtonLabel}
            </Text>
          </Pressable>
        </View>

        {/* Certification */}
        {(() => {
          const cert = getCertificationStatus(profile || {});
          const certDate = cert.isCertified ? toDate(profile?.certifiedAt) : null;
          return (
            <View style={[styles.certCard, cert.isCertified && styles.certCardActive]}>
              <View style={styles.certHeader}>
                <View style={[styles.certIconWrap, cert.isCertified && styles.certIconWrapActive]}>
                  <Ionicons name="checkmark" size={18} color={cert.isCertified ? '#0D1117' : theme.colors.textMuted} />
                </View>
                <View style={styles.certTextWrap}>
                  <Text style={[styles.certTitle, cert.isCertified && styles.certTitleActive]}>
                    {cert.isCertified ? 'Compte certifié' : 'Certification en cours'}
                  </Text>
                  <Text style={styles.certSubtitle}>
                    {cert.isCertified
                      ? certDate
                        ? `Certifié le ${certDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                        : 'Votre compte est certifié'
                      : `${cert.daysElapsed} / 30 jours d'utilisation`}
                  </Text>
                </View>
              </View>
              {!cert.isCertified && (
                <View style={styles.certProgressWrap}>
                  <View style={styles.certProgressTrack}>
                    <View style={[styles.certProgressBar, { width: `${Math.round(cert.progress * 100)}%` }]} />
                  </View>
                  <Text style={styles.certProgressLabel}>
                    {cert.daysRemaining === 0 ? 'Vérification en cours…' : `${cert.daysRemaining} jour${cert.daysRemaining > 1 ? 's' : ''} restant${cert.daysRemaining > 1 ? 's' : ''}`}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Level */}
        {(() => {
          const level = getUserLevel(profile || {});
          return (
            <View style={[styles.certCard, { borderColor: level.color + '55', borderWidth: 1 }]}>
              <View style={styles.certHeader}>
                <View style={[styles.certIconWrap, { backgroundColor: level.color + '22' }]}>
                  <Text style={{ fontSize: 16 }}>{level.icon}</Text>
                </View>
                <View style={styles.certTextWrap}>
                  <Text style={[styles.certTitle, { color: level.color }]}>
                    Niveau {level.name}
                  </Text>
                  <Text style={styles.certSubtitle}>
                    {level.isMaxLevel
                      ? `${level.count} messages envoyés — Rang maximum !`
                      : `${level.count} message${level.count !== 1 ? 's' : ''} envoyé${level.count !== 1 ? 's' : ''} — ${level.messagesUntilNext} avant ${level.nextLevel?.name}`}
                  </Text>
                </View>
              </View>
              {!level.isMaxLevel && (
                <View style={styles.certProgressWrap}>
                  <View style={styles.certProgressTrack}>
                    <View style={[styles.certProgressBar, { width: `${Math.round(level.progress * 100)}%`, backgroundColor: level.color }]} />
                  </View>
                  <Text style={styles.certProgressLabel}>
                    {Math.round(level.progress * 100)}% vers {level.nextLevel?.name}
                  </Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <View style={[styles.profileTab, styles.activeTab]}>
            <Text style={styles.profileTabText}>Profil</Text>
          </View>
          <View style={styles.profileTab}>
            <Text style={styles.profileTabText}>Publications</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={17} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Informations publiques</Text>
          </View>
          <ThemedTextInput
            label="Nom d'utilisateur"
            placeholder="@username"
            autoCapitalize="none"
            value={form.username}
            onChangeText={(value) => setForm((prev) => ({ ...prev, username: value }))}
            error={form.username ? errors.username : ''}
            helperText="Unique et trouvable par tous les utilisateurs."
          />
          <ThemedTextInput
            label="Nom affiché"
            placeholder="Dark Mikey"
            value={form.displayName}
            onChangeText={(value) => setForm((prev) => ({ ...prev, displayName: value }))}
            error={form.displayName ? errors.displayName : ''}
            helperText={`${normalizedDisplayName.length}/40 caractères`}
          />
          <ThemedTextInput
            label="Bio"
            placeholder="Présentez-vous en 160 caractères maximum"
            value={form.bio}
            onChangeText={(value) => setForm((prev) => ({ ...prev, bio: value }))}
            helperText={`${normalizedBio.length}/160 caractères`}
            error={errors.bio}
            multiline
          />
          <PrimaryButton title="Enregistrer le profil" onPress={handleSave} loading={saving} disabled={!canSave} />
        </View>

        {/* Appearance */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={17} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Apparence</Text>
          </View>
          <Text style={styles.infoText}>
            Le thème suit automatiquement les réglages de votre appareil (sombre ou clair).
          </Text>
          {activeCard ? (
            <View style={styles.activeCardBadge}>
              <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
              <Text style={styles.activeCardBadgeText}>
                Carte animée active :{' '}
                <Text style={{ fontWeight: '900' }}>
                  {activeCard === 'fire' ? '🔥 Feu' :
                   activeCard === 'neon' ? '⚡ Néon' :
                   activeCard === 'galaxy' ? '🌌 Galaxy' :
                   activeCard === 'demonic' ? '😈 Démoniaque' : activeCard}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>

        {/* Security */}
        <Pressable style={styles.collapsibleButton} onPress={() => toggleSection(setSecurityOpen)}>
          <View style={styles.collapsibleHeader}>
            <View style={styles.collapsibleIconWrap}>
              <Ionicons name="lock-closed-outline" size={17} color={theme.colors.primary} />
            </View>
            <Text style={styles.collapsibleTitle}>Sécurité</Text>
          </View>
          <Ionicons name={securityOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
        </Pressable>
        {securityOpen && (
          <View style={styles.collapsibleContent}>
            <Text style={styles.infoText}>Modifiez votre mot de passe directement depuis l'application.</Text>
            <ThemedTextInput
              label="Mot de passe actuel"
              placeholder="Votre mot de passe actuel"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <ThemedTextInput
              label="Nouveau mot de passe"
              placeholder="Au moins 6 caractères"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              helperText="Utilisez un mot de passe fort et unique."
            />
            <ThemedTextInput
              label="Confirmer le nouveau mot de passe"
              placeholder="Répétez le nouveau mot de passe"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <PrimaryButton
              title="Modifier le mot de passe"
              onPress={handleChangePassword}
              loading={changingPassword}
              disabled={!currentPassword || !newPassword || !confirmNewPassword || changingPassword}
            />
          </View>
        )}

        {/* Danger zone */}
        <Pressable style={styles.collapsibleButton} onPress={() => toggleSection(setDangerOpen)}>
          <View style={styles.collapsibleHeader}>
            <View style={styles.collapsibleIconWrapDanger}>
              <Ionicons name="warning-outline" size={17} color={theme.colors.danger} />
            </View>
            <Text style={styles.collapsibleTitleDanger}>Zone dangereuse</Text>
          </View>
          <Ionicons name={dangerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
        </Pressable>
        {dangerOpen && (
          <View style={styles.collapsibleContentDanger}>
            <Text style={styles.dangerHint}>
              La suppression de votre compte est irréversible. Toutes vos données seront perdues définitivement.
            </Text>
            <ThemedTextInput
              label="Mot de passe"
              placeholder="Confirmez avec votre mot de passe"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <PrimaryButton
              title="Supprimer mon compte"
              onPress={handleDeleteAccount}
              loading={deleting}
              disabled={!deletePassword || deleting}
              destructive
            />
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Unified photo + card picker modal */}
      <ProfileCardPickerModal
        visible={cardPickerVisible}
        onClose={() => setCardPickerVisible(false)}
        onPickPhoto={handlePickPhoto}
        onSelectCard={handleSelectCard}
        selectedCard={activeCard}
        avatarUri={displayedAvatarUri}
        avatarLabel={form.displayName || form.username}
      />
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    containerContent: { flex: 1 },
    scrollContent: { paddingBottom: 32 },
    coverCard: {
      paddingTop: 54,
      paddingBottom: 60,
      paddingHorizontal: 20,
      marginBottom: -38,
    },
    coverTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: { color: '#FFFFFF', fontWeight: '900', fontSize: 24, letterSpacing: -0.4 },
    headerSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 3 },
    roundButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarWrapOuter: { alignSelf: 'center' },
    avatarWrap: { alignItems: 'center', justifyContent: 'center' },
    avatarCameraBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primaryStrong,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    avatarCameraBadgeWithCard: {
      bottom: 14,
      right: 14,
    },
    profileInfo: {
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    name: {
      color: theme.colors.text,
      fontWeight: '900',
      fontSize: 22,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    usernameText: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 6 },
    bio: {
      color: theme.colors.textSoft,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 10,
    },
    metaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginBottom: 14,
    },
    metaPillText: { color: theme.colors.textMuted, fontSize: 12 },
    photoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 99,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    photoButtonActive: {
      borderColor: theme.colors.success,
      backgroundColor: 'rgba(55,214,122,0.08)',
    },
    photoButtonText: { color: theme.colors.textSoft, fontSize: 13, fontWeight: '600' },
    photoButtonTextActive: { color: theme.colors.success },
    certCard: {
      marginHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    certCardActive: {
      borderColor: '#F5C518',
      backgroundColor: 'rgba(245,197,24,0.06)',
    },
    certHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    certIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    certIconWrapActive: {
      backgroundColor: '#F5C518',
      borderColor: '#F5C518',
    },
    certTextWrap: {
      flex: 1,
      gap: 3,
    },
    certTitle: {
      color: theme.colors.textSoft,
      fontWeight: '800',
      fontSize: 15,
    },
    certTitleActive: {
      color: '#F5C518',
    },
    certSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    certProgressWrap: {
      gap: 6,
    },
    certProgressTrack: {
      height: 5,
      borderRadius: 99,
      backgroundColor: theme.colors.surfaceMuted,
      overflow: 'hidden',
    },
    certProgressBar: {
      height: 5,
      borderRadius: 99,
      backgroundColor: '#F5C518',
    },
    certProgressLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    tabsRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceMuted,
      padding: 4,
    },
    profileTab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: theme.radius.md,
    },
    activeTab: { backgroundColor: theme.colors.surface },
    profileTabText: { color: theme.colors.textSoft, fontWeight: '700', fontSize: 14 },
    formCard: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 10,
      marginBottom: 12,
    },
    infoCard: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
      marginBottom: 12,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    sectionTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 16 },
    infoText: { color: theme.colors.textSoft, fontSize: 14, lineHeight: 20 },
    activeCardBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(201,149,107,0.1)',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'rgba(201,149,107,0.25)',
      marginTop: 4,
    },
    activeCardBadgeText: { color: theme.colors.textSoft, fontSize: 13 },
    collapsibleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      padding: 14,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 6,
    },
    collapsibleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    collapsibleIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(201,149,107,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    collapsibleIconWrapDanger: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(239,68,68,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    collapsibleTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 16 },
    collapsibleTitleDanger: { color: theme.colors.danger, fontWeight: '800', fontSize: 16 },
    collapsibleContent: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 10,
      marginBottom: 10,
    },
    collapsibleContentDanger: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
      backgroundColor: 'rgba(239,68,68,0.04)',
      gap: 10,
      marginBottom: 10,
    },
    dangerHint: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
  });
