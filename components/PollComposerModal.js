import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { useAppTheme } from '../utils/theme';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const createEmptyOptions = () => ['', ''];

export default function PollComposerModal({ visible, onClose, onSubmit, disabled = false }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(createEmptyOptions());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuestion('');
      setOptions(createEmptyOptions());
      setSubmitting(false);
    }
  }, [visible]);

  const updateOption = (index, value) => {
    setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addOption = () => {
    setOptions((prev) => {
      if (prev.length >= MAX_OPTIONS) return prev;
      return [...prev, ''];
    });
  };

  const removeOption = (index) => {
    setOptions((prev) => {
      if (prev.length <= MIN_OPTIONS) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async () => {
    const trimmedQuestion = String(question || '').trim();
    const sanitizedOptions = options.map((item) => String(item || '').trim()).filter(Boolean);

    if (!trimmedQuestion) {
      Alert.alert('Question requise', 'Ajoutez la question du sondage.');
      return;
    }

    if (sanitizedOptions.length < MIN_OPTIONS) {
      Alert.alert('Options insuffisantes', 'Ajoutez au moins deux options au sondage.');
      return;
    }

    if (disabled) {
      Alert.alert('Action indisponible', 'Vous ne pouvez pas publier de sondage dans cette conversation.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit?.({ question: trimmedQuestion, options: sanitizedOptions });
      onClose?.();
    } catch (error) {
      Alert.alert('Sondage impossible', error.message || 'Le sondage n’a pas pu être envoyé.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Nouveau sondage</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Question</Text>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Quel créneau vous convient le mieux ?"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.questionInput}
                multiline
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Options</Text>
              <Text style={styles.limitText}>{options.length}/{MAX_OPTIONS}</Text>
            </View>

            <View style={styles.optionsWrap}>
              {options.map((option, index) => (
                <View key={`poll_option_${index}`} style={styles.optionRow}>
                  <View style={styles.optionBullet}><Text style={styles.optionBulletText}>{index + 1}</Text></View>
                  <TextInput
                    value={option}
                    onChangeText={(value) => updateOption(index, value)}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.optionInput}
                  />
                  <Pressable
                    onPress={() => removeOption(index)}
                    style={[styles.optionRemove, options.length <= MIN_OPTIONS && styles.optionRemoveDisabled]}
                    disabled={options.length <= MIN_OPTIONS}
                  >
                    <Ionicons name="trash-outline" size={16} color={options.length <= MIN_OPTIONS ? theme.colors.textMuted : theme.colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>

            <PrimaryButton title="Ajouter une option" onPress={addOption} ghost disabled={options.length >= MAX_OPTIONS} />
            <PrimaryButton title="Envoyer le sondage" onPress={handleSubmit} loading={submitting} disabled={disabled} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '86%',
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 28,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: '900',
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
    },
    content: {
      gap: 14,
      paddingBottom: 18,
    },
    fieldWrap: {
      gap: 8,
    },
    label: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: 14,
    },
    questionInput: {
      minHeight: 110,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      paddingHorizontal: 14,
      paddingVertical: 14,
      textAlignVertical: 'top',
      lineHeight: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    limitText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    optionsWrap: {
      gap: 10,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    optionBullet: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionBulletText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '800',
    },
    optionInput: {
      flex: 1,
      minHeight: 52,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    optionRemove: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionRemoveDisabled: {
      opacity: 0.55,
    },
  });
