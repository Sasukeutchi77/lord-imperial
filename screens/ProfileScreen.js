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
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../utils/theme';
import { logoutUser, updateUserProfile } from '../services/auth';
import { auth, db } from '../services/firebase';
import { formatLastSeen, normalizeBio, normalizeDisplayName, validateUsername } from '../utils/helpers';
import { pickImageFromLibrary } from '../services/imagePicker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useAuth();

  const [form, setForm] = useState({ username: '', displayName: '', bio: '' });

  // localAvatarUri: URI locale choisie dans la galerie, pas encore uploadée
  // On l'affiche immédiatement, et elle est envoyée à updateUserProfile lors de la sauvegarde
  const [localAvatarUri, setLocalAvatarUri] = useState(null);

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

  // Sync le form depuis le profile Firebase — mais NE PAS écraser localAvatarUri
  useEffect(() => {
    setForm({
      username: profile?.username || '',
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
    });
    // Ne pas toucher à localAvatarUri ici — il est géré séparément
  }, [profile?.username, profile?.displayName, profile?.bio]);

  // L'URI à afficher: priorité à l'aperçu local, puis l'URL Cloudinary persistée
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
      Boolean(localAvatarUri),
    [form, profile, localAvatarUri]
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

  const handlePickImage = async () => {
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(avatarScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    try {
      setPickingImage(true);
      const uri = await pickImageFromLibrary();
      if (uri) {
        // Afficher immédiatement l'aperçu local — l'upload se fait à la sauvegarde
        setLocalAvatarUri(uri);
      }
    } catch (error) {
      Alert.alert('Image indisponible', error.message || 'Impossible de sélectionner cette image.');
    } finally {
      setPickingImage(false);
    }
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
          // Passer l'URI locale — updateUserProfile l'uploade sur Cloudinary
          avatarUri: localAvatarUri || null,
        },
      });
      // Succès : effacer l'aperçu local (Firebase va synchroniser l'URL Cloudinary)
      setLocalAvatarUri(null);
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

  return (
    <ScreenContainer withKeyboard contentStyle={styles.containerContent}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Bandeau hero */}
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

          {/* Avatar pressable avec animation */}
          <Pressable onPress={handlePickImage} disabled={pickingImage} style={styles.avatarWrapOuter}>
            <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
              <Avatar uri={displayedAvatarUri} label={form.displayName || form.username} size={110} showOnline />
              <View style={styles.avatarCameraBadge}>
                {pickingImage ? (
                  <Ionicons name="hourglass" size={14} color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                )}
              </View>
            </Animated.View>
          </Pressable>
        </LinearGradient>

        {/* Informations profil */}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{form.displayName || form.username || '—'}</Text>
          <Text style={styles.usernameText}>
            {form.username ? `@${form.username.replace('@', '')}` : profile?.email || '—'}
          </Text>
          {form.bio ? <Text style={styles.bio}>{form.bio}</Text> : null}

          <View style={styles.metaPill}>
            <Ionicons name={profile?.isOnline ? 'ellipse' : 'time-outline'} size={11}
              color={profile?.isOnline ? theme.colors.success : theme.colors.textMuted}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.metaPillText}>{formatLastSeen(profile?.lastSeen, profile?.isOnline)}</Text>
          </View>

          {/* Bouton choix photo */}
          <Pressable
            style={[styles.photoButton, localAvatarUri && styles.photoButtonActive]}
            onPress={handlePickImage}
            disabled={pickingImage}
          >
            <Ionicons
              name={localAvatarUri ? 'checkmark-circle' : 'camera-outline'}
              size={16}
              color={localAvatarUri ? theme.colors.success : theme.colors.textSoft}
            />
            <Text style={[styles.photoButtonText, localAvatarUri && styles.photoButtonTextActive]}>
              {pickingImage
                ? 'Chargement…'
                : localAvatarUri
                ? 'Photo prête — sauvegarder pour confirmer'
                : profile?.avatar
                ? 'Changer la photo de profil'
                : 'Ajouter une photo de profil'}
            </Text>
          </Pressable>
        </View>

        {/* Onglets */}
        <View style={styles.tabsRow}>
          <View style={[styles.profileTab, styles.activeTab]}>
            <Text style={styles.profileTabText}>Profil</Text>
          </View>
          <View style={styles.profileTab}>
            <Text style={styles.profileTabText}>Publications</Text>
          </View>
        </View>

        {/* Formulaire */}
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

        {/* Apparence */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={17} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Apparence</Text>
          </View>
          <Text style={styles.infoText}>
            Le thème suit automatiquement les réglages de votre appareil (sombre ou clair).
          </Text>
        </View>

        {/* Sécurité */}
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
              title="Changer le mot de passe"
              onPress={handleChangePassword}
              loading={changingPassword}
              disabled={!currentPassword || !newPassword || !confirmNewPassword}
            />
          </View>
        )}

        {/* Zone dangereuse */}
        <Pressable style={styles.collapsibleButtonDanger} onPress={() => toggleSection(setDangerOpen)}>
          <View style={styles.collapsibleHeader}>
            <View style={styles.collapsibleIconWrapDanger}>
              <Ionicons name="trash-outline" size={17} color={theme.colors.danger} />
            </View>
            <Text style={styles.collapsibleTitleDanger}>Zone dangereuse</Text>
          </View>
          <Ionicons name={dangerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.danger} />
        </Pressable>
        {dangerOpen && (
          <View style={styles.collapsibleContentDanger}>
            <Text style={styles.infoText}>
              Supprimez définitivement votre compte, vos données et votre authentification Firebase.
            </Text>
            <ThemedTextInput
              label="Confirmez avec votre mot de passe"
              placeholder="Mot de passe actuel"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <Text style={styles.dangerHint}>⚠ Action irréversible — aucun retour possible.</Text>
            <PrimaryButton
              title="Supprimer définitivement le compte"
              onPress={handleDeleteAccount}
              loading={deleting}
              disabled={!deletePassword}
              danger
            />
          </View>
        )}

        {/* Infos compte */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={17} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Compte</Text>
          </View>
          <View style={styles.metaInfoRow}>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>{profile?.email || auth.currentUser?.email || '—'}</Text>
          </View>
          <View style={styles.metaInfoRow}>
            <Text style={styles.metaLabel}>Identifiant</Text>
            <Text style={styles.metaValue} numberOfLines={2}>{profile?.uid || '—'}</Text>
          </View>
          <View style={[styles.metaInfoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.metaLabel}>Dernière sync</Text>
            <Text style={styles.metaValue}>
              {profile?.updatedAtMs ? new Date(profile.updatedAtMs).toLocaleString('fr-FR') : '—'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    containerContent: { paddingHorizontal: 0, paddingVertical: 0 },
    scrollContent: { paddingBottom: 140 },
    coverCard: {
      height: 255,
      paddingHorizontal: 18,
      paddingTop: 20,
      justifyContent: 'space-between',
      paddingBottom: 72,
    },
    coverTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
    headerSub: { color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: '600', marginTop: 2 },
    roundButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    avatarWrapOuter: { alignSelf: 'center', marginBottom: -72 },
    avatarWrap: {
      padding: 5,
      borderRadius: 65,
      backgroundColor: theme.colors.background,
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
    avatarCameraBadge: {
      position: 'absolute',
      right: 4,
      bottom: 4,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: theme.colors.background,
    },
    profileInfo: {
      paddingHorizontal: 20,
      paddingTop: 82,
      alignItems: 'center',
      gap: 8,
    },
    name: { color: theme.colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
    usernameText: { color: theme.colors.primary, fontWeight: '800', fontSize: 15 },
    bio: {
      color: theme.colors.textSoft,
      textAlign: 'center',
      lineHeight: 21,
      fontWeight: '500',
      paddingHorizontal: 20,
    },
    metaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.chip,
    },
    metaPillText: { color: theme.colors.text, fontWeight: '700', fontSize: 12 },
    photoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: theme.radius.pill,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      marginTop: 4,
    },
    photoButtonActive: {
      borderColor: theme.colors.success,
      backgroundColor: 'rgba(55,214,122,0.08)',
    },
    photoButtonText: { color: theme.colors.textSoft, fontWeight: '600', fontSize: 13 },
    photoButtonTextActive: { color: theme.colors.success, fontWeight: '700' },
    tabsRow: {
      flexDirection: 'row',
      marginHorizontal: 18,
      marginTop: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 4,
    },
    profileTab: {
      flex: 1,
      minHeight: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeTab: { backgroundColor: 'rgba(201,149,107,0.22)' },
    profileTabText: { color: theme.colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
    formCard: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 18,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 2,
    },
    infoCard: {
      marginHorizontal: 16,
      marginTop: 14,
      padding: 18,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: 10,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '900' },
    infoText: { color: theme.colors.textSoft, lineHeight: 20, fontSize: 14 },
    metaInfoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 7,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    metaLabel: { color: theme.colors.textMuted, fontWeight: '700', fontSize: 13, minWidth: 90 },
    metaValue: { color: theme.colors.text, fontWeight: '600', fontSize: 13, flex: 1, textAlign: 'right' },
    collapsibleButton: {
      marginHorizontal: 16,
      marginTop: 14,
      padding: 16,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    collapsibleButtonDanger: {
      marginHorizontal: 16,
      marginTop: 14,
      padding: 16,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.3)',
      backgroundColor: 'rgba(239,68,68,0.06)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      marginTop: 2,
    },
    collapsibleContentDanger: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
      backgroundColor: 'rgba(239,68,68,0.04)',
      gap: 10,
      marginTop: 2,
    },
    dangerHint: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
  });
