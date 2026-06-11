import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { doc, onSnapshot } from 'firebase/firestore';
import ScreenContainer from '../components/ScreenContainer';
import ThemedTextInput from '../components/ThemedTextInput';
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import {
  addMemberToChat,
  generateInviteLink,
  getConversationCollectionName,
  removeMemberFromChat,
  searchUserByUsername,
  updateConversationSettings,
  updateMemberRole,
} from '../services/chat';
import { appTheme } from '../utils/theme';
import { pickImageFromLibrary } from '../services/imagePicker';

export default function ManageMembersScreen({ route }) {
  const { chatId } = route.params;
  const { profile } = useAuth();
  const [chat, setChat] = useState(null);
  const [memberQuery, setMemberQuery] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    description: '',
    avatarUri: null,
    sendMessages: 'members',
  });

  useEffect(() => {
    return onSnapshot(doc(db, getConversationCollectionName(), chatId), (snapshot) => {
      const nextChat = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      setChat(nextChat);
      setSettingsForm({
        title: nextChat?.title || '',
        description: nextChat?.description || '',
        avatarUri: nextChat?.avatar || null,
        sendMessages: nextChat?.permissions?.sendMessages || (nextChat?.type === 'channel' ? 'admins' : 'members'),
      });
    });
  }, [chatId]);

  const canManage = useMemo(() => Boolean(chat?.admins?.includes(profile.uid) || chat?.ownerId === profile.uid), [chat?.admins, chat?.ownerId, profile.uid]);

  const handleSearch = async () => {
    if (!canManage) {
      Alert.alert('Action non autorisée', 'Seuls les administrateurs peuvent ajouter des membres.');
      return;
    }

    try {
      setLoading(true);
      const user = await searchUserByUsername(memberQuery);
      if (!user) {
        Alert.alert('Introuvable', 'Aucun utilisateur trouvé pour ce pseudo exact.');
        setCandidate(null);
        return;
      }
      if (chat?.members?.includes(user.uid)) {
        Alert.alert('Déjà membre', 'Cet utilisateur fait déjà partie de cette conversation.');
        setCandidate(null);
        return;
      }
      setCandidate(user);
    } catch (error) {
      setCandidate(null);
      Alert.alert('Recherche impossible', error.message || 'Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!candidate) return;

    try {
      setAdding(true);
      await addMemberToChat({ chatId, member: candidate, actor: profile });
      Alert.alert('Membre ajouté', `${candidate.displayName || candidate.username} a bien été ajouté.`);
      setCandidate(null);
      setMemberQuery('');
    } catch (error) {
      Alert.alert('Ajout impossible', error.message || 'Le membre n’a pas pu être ajouté.');
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      setRoleLoadingId(memberId);
      await updateMemberRole({ chatId, memberId, role, actor: profile });
    } catch (error) {
      Alert.alert('Rôle inchangé', error.message || 'Impossible de modifier le rôle.');
    } finally {
      setRoleLoadingId(null);
    }
  };

  const handleRemove = async (memberId, label) => {
    try {
      setRemovingId(memberId);
      await removeMemberFromChat({ chatId, memberId, actor: profile });
      Alert.alert('Membre retiré', `${label} a été retiré de cette conversation.`);
    } catch (error) {
      Alert.alert('Suppression impossible', error.message || 'Le membre n’a pas pu être retiré.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      setInviteBusy(true);
      await generateInviteLink({ chatId, actor: profile });
      Alert.alert('Lien d’invitation généré', 'Le lien est prêt à être copié ou partagé.');
    } catch (error) {
      Alert.alert('Lien indisponible', error.message || 'Impossible de générer un lien.');
    } finally {
      setInviteBusy(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!chat?.invite?.url) return;
    await Clipboard.setStringAsync(chat.invite.url);
    Alert.alert('Lien copié', 'Le lien d’invitation a été copié dans le presse-papiers.');
  };

  const handleShareInvite = async () => {
    if (!chat?.invite?.url) return;
    try {
      await Share.share({
        message: chat.invite.url,
        url: chat.invite.url,
        title: 'Invitation Lord Imperial',
      });
    } catch (error) {
      Alert.alert('Partage impossible', error.message || 'Impossible de partager ce lien.');
    }
  };

  const handlePickAvatar = async () => {
    try {
      const uri = await pickImageFromLibrary();
      if (uri) {
        setSettingsForm((prev) => ({ ...prev, avatarUri: uri }));
      }
    } catch (error) {
      Alert.alert('Image indisponible', error.message || 'Impossible de choisir cette image.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await updateConversationSettings({
        chatId,
        actor: profile,
        ...settingsForm,
      });
      Alert.alert('Conversation mise à jour', 'Les nouvelles informations sont enregistrées.');
    } catch (error) {
      Alert.alert('Mise à jour impossible', error.message || 'Impossible de mettre à jour cette conversation.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{chat?.type === 'channel' ? 'Gérer le canal' : 'Gérer le groupe'}</Text>
        <Text style={styles.subtitle}>Rôles, photo, description, permissions et invitations sont centralisés ici.</Text>

        {!canManage ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>Lecture seule : seuls les administrateurs peuvent modifier les membres et les informations.</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <Avatar uri={settingsForm.avatarUri} label={settingsForm.title || chat?.title} size={72} />
            <View style={{ flex: 1 }}>
              <Text style={styles.avatarLabel}>Photo de la conversation</Text>
              <PrimaryButton title="Choisir une image" onPress={handlePickAvatar} ghost disabled={!canManage} />
            </View>
          </View>

          <ThemedTextInput
            label={chat?.type === 'channel' ? 'Nom du canal' : 'Nom du groupe'}
            value={settingsForm.title}
            onChangeText={(value) => setSettingsForm((prev) => ({ ...prev, title: value }))}
          />
          <ThemedTextInput
            label="Description"
            value={settingsForm.description}
            onChangeText={(value) => setSettingsForm((prev) => ({ ...prev, description: value }))}
            multiline
          />

          <View style={styles.permissionsRow}>
            <Text style={styles.permissionsLabel}>Publication</Text>
            <View style={styles.permissionChips}>
              {['members', 'admins'].map((value) => {
                const active = settingsForm.sendMessages === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setSettingsForm((prev) => ({ ...prev, sendMessages: value }))}
                    style={[styles.permissionChip, active && styles.permissionChipActive, !canManage && styles.permissionChipDisabled]}
                    disabled={!canManage}
                  >
                    <Text style={[styles.permissionChipText, active && styles.permissionChipTextActive]}>
                      {value === 'admins' ? 'Admins seulement' : 'Tous les membres'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <PrimaryButton title="Enregistrer les réglages" onPress={handleSaveSettings} loading={savingSettings} disabled={!canManage} />
        </View>

        <View style={styles.card}>
          <ThemedTextInput
            label={chat?.type === 'channel' ? 'Ajouter un abonné' : 'Ajouter un membre'}
            placeholder="@username"
            autoCapitalize="none"
            value={memberQuery}
            onChangeText={setMemberQuery}
          />
          <PrimaryButton title="Rechercher" onPress={handleSearch} loading={loading} disabled={!canManage} />
          <PrimaryButton title="Générer un lien d’invitation" onPress={handleGenerateInvite} loading={inviteBusy} disabled={!canManage} ghost />
        </View>

        {chat?.invite?.url ? (
          <View style={styles.inviteCard}>
            <Text style={styles.inviteLabel}>Lien actif</Text>
            <Text style={styles.inviteValue}>{chat.invite.url}</Text>
            <View style={styles.inviteActions}>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Copier le lien" onPress={handleCopyInvite} ghost />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton title="Partager" onPress={handleShareInvite} />
              </View>
            </View>
          </View>
        ) : null}

        {candidate ? (
          <View style={styles.candidateCard}>
            <Avatar uri={candidate.avatar} label={candidate.displayName || candidate.username} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={styles.candidateName}>{candidate.displayName || candidate.username}</Text>
              <Text style={styles.candidateEmail}>{candidate.username}</Text>
            </View>
            <View style={styles.actionWrap}>
              <PrimaryButton title="Ajouter" onPress={handleAdd} loading={adding} disabled={!canManage} />
            </View>
          </View>
        ) : null}

        <Text style={styles.section}>{chat?.type === 'channel' ? 'Abonnés actuels' : 'Membres actuels'}</Text>
        <View style={styles.membersGrid}>
          {(chat?.members || []).length ? (
            chat.members.map((uid) => {
              const member = chat?.memberDetails?.[uid];
              const role = chat?.ownerId === uid ? 'owner' : chat?.admins?.includes(uid) ? 'admin' : 'member';
              const label = uid === profile.uid ? 'Vous' : member?.displayName || member?.username || member?.email || uid;
              const canPromote = canManage && uid !== chat?.ownerId;
              const canRemove = canManage && uid !== chat?.ownerId && uid !== profile.uid;

              return (
                <View key={uid} style={styles.memberCard}>
                  <Avatar uri={member?.avatar} label={label} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{label}</Text>
                    <Text style={styles.memberMeta}>{role === 'owner' ? 'Propriétaire' : role === 'admin' ? 'Administrateur' : chat?.type === 'channel' ? 'Abonné' : 'Membre'}</Text>
                    {!!member?.bio ? <Text style={styles.memberBio} numberOfLines={1}>{member.bio}</Text> : null}
                  </View>
                  <View style={styles.sideActions}>
                    {canPromote ? (
                      <Pressable
                        onPress={() => handleRoleChange(uid, role === 'admin' ? 'member' : 'admin')}
                        style={[styles.roleChip, roleLoadingId === uid && styles.roleChipDisabled]}
                        disabled={roleLoadingId === uid}
                      >
                        <Text style={styles.roleChipText}>{role === 'admin' ? 'Rétrograder' : 'Promouvoir'}</Text>
                      </Pressable>
                    ) : null}
                    {canRemove ? (
                      <Pressable
                        onPress={() => handleRemove(uid, label)}
                        style={[styles.removeChip, removingId === uid && styles.roleChipDisabled]}
                        disabled={removingId === uid}
                      >
                        <Text style={styles.removeChipText}>Retirer</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Aucun autre membre pour le moment.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: appTheme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: appTheme.colors.textMuted,
    lineHeight: 22,
    marginTop: 12,
  },
  noticeCard: {
    marginTop: 20,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(22,242,209,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(22,242,209,0.18)',
  },
  noticeText: {
    color: appTheme.colors.text,
    lineHeight: 20,
  },
  card: {
    marginTop: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 20,
    gap: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLabel: {
    color: appTheme.colors.text,
    fontWeight: '700',
    marginBottom: 10,
  },
  permissionsRow: {
    marginTop: 4,
  },
  permissionsLabel: {
    color: appTheme.colors.text,
    fontWeight: '700',
    marginBottom: 10,
  },
  permissionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  permissionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  permissionChipActive: {
    backgroundColor: 'rgba(22,242,209,0.12)',
    borderColor: 'rgba(22,242,209,0.35)',
  },
  permissionChipDisabled: {
    opacity: 0.5,
  },
  permissionChipText: {
    color: appTheme.colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  permissionChipTextActive: {
    color: appTheme.colors.accent,
  },
  inviteCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(124,77,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.28)',
  },
  inviteLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inviteValue: {
    color: appTheme.colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  candidateCard: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateName: {
    color: appTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  candidateEmail: {
    color: appTheme.colors.textMuted,
    marginTop: 4,
  },
  actionWrap: {
    width: 110,
  },
  section: {
    color: appTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 12,
  },
  membersGrid: {
    gap: 12,
    paddingBottom: 30,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 14,
  },
  memberName: {
    color: appTheme.colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  memberMeta: {
    color: appTheme.colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  memberBio: {
    color: appTheme.colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  sideActions: {
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(22,242,209,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(22,242,209,0.3)',
  },
  removeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,87,87,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,87,87,0.3)',
  },
  roleChipDisabled: {
    opacity: 0.5,
  },
  roleChipText: {
    color: appTheme.colors.text,
    fontWeight: '700',
    fontSize: 11,
  },
  removeChipText: {
    color: appTheme.colors.danger,
    fontWeight: '700',
    fontSize: 11,
  },
  emptyText: {
    color: appTheme.colors.textMuted,
  },
});
