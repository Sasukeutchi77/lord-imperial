import React, { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../utils/theme';
import AnimatedProfileCard, { PROFILE_CARDS } from './AnimatedProfileCard';
import Avatar from './Avatar';

function CardOption({ card, selected, onSelect, avatarUri, avatarLabel }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={() => onSelect(card.id)}
      style={{
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        marginRight: 12,
        minWidth: 130,
        borderWidth: 2,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? 'rgba(201,149,107,0.12)' : theme.colors.surfaceMuted,
      }}
    >
      <AnimatedProfileCard effect={card.id} size={62}>
        <Avatar uri={avatarUri} label={avatarLabel} size={62} />
      </AnimatedProfileCard>
      <Text
        style={{
          color: selected ? theme.colors.primary : theme.colors.text,
          fontWeight: '800',
          fontSize: 13,
          marginTop: 10,
        }}
      >
        {card.icon} {card.name}
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' }}>
        {card.description}
      </Text>
      {selected ? (
        <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Ionicons name="checkmark-circle" size={13} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '700' }}>Active</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function ProfileCardPickerModal({
  visible,
  onClose,
  onPickPhoto,
  onSelectCard,
  selectedCard,
  avatarUri,
  avatarLabel,
}) {
  const theme = useAppTheme();

  const handlePickPhoto = () => {
    onClose();
    setTimeout(onPickPhoto, 250);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingBottom: 44,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.colors.border,
              alignSelf: 'center',
              marginTop: 12,
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 22,
              marginBottom: 22,
            }}
          >
            <View>
              <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 20 }}>
                Photo & Carte
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 2 }}>
                Personnalisez votre profil
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Change photo button */}
          <Pressable
            onPress={handlePickPhoto}
            style={{ marginHorizontal: 20, marginBottom: 26, borderRadius: 18, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={[theme.colors.primaryStrong, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="camera" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                  Changer la photo
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 2 }}>
                  Sélectionner depuis la galerie
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.75)" />
            </LinearGradient>
          </Pressable>

          {/* Animated cards section */}
          <View style={{ paddingLeft: 20, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="sparkles" size={15} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>
                Cartes animées
              </Text>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 99,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>NOUVEAU</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, paddingBottom: 6 }}
            >
              {/* "None" option */}
              <Pressable
                onPress={() => onSelectCard(null)}
                style={{
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 20,
                  marginRight: 12,
                  minWidth: 115,
                  borderWidth: 2,
                  borderColor: !selectedCard ? theme.colors.primary : theme.colors.border,
                  backgroundColor: !selectedCard
                    ? 'rgba(201,149,107,0.12)'
                    : theme.colors.surfaceMuted,
                }}
              >
                <View
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Avatar uri={avatarUri} label={avatarLabel} size={62} />
                </View>
                <Text
                  style={{
                    color: !selectedCard ? theme.colors.primary : theme.colors.textMuted,
                    fontWeight: '800',
                    fontSize: 13,
                    marginTop: 10,
                  }}
                >
                  Aucune
                </Text>
                <Text
                  style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' }}
                >
                  Standard
                </Text>
                {!selectedCard ? (
                  <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="checkmark-circle" size={13} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '700' }}>
                      Active
                    </Text>
                  </View>
                ) : null}
              </Pressable>

              {PROFILE_CARDS.map((card) => (
                <CardOption
                  key={card.id}
                  card={card}
                  selected={selectedCard === card.id}
                  onSelect={onSelectCard}
                  avatarUri={avatarUri}
                  avatarLabel={avatarLabel}
                />
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default memo(ProfileCardPickerModal);
