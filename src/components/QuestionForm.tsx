import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { errorMessage } from '../api/client';
import type { QuestionInput } from '../types';
import { Banner, Button, TextField } from './ui';
import { colors, spacing } from '../theme';

interface Props {
  initial?: QuestionInput;
  submitLabel: string;
  clearAfterSubmit?: boolean;
  onSubmit: (input: QuestionInput) => Promise<void>;
}

// Formulaire partagé entre "Publier" et "Modifier une question".
export function QuestionForm({ initial, submitLabel, clearAfterSubmit, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim() || !description.trim() || !content.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), content: content.trim() });
      if (clearAfterSubmit) {
        setTitle('');
        setDescription('');
        setContent('');
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Banner message={error} /> : null}
        <TextField label="Titre" value={title} onChangeText={setTitle} maxLength={150} returnKeyType="next" />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={1000}
          placeholder="Résumez votre question en quelques lignes"
        />
        <TextField
          label="Contenu"
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.tall}
          placeholder="Donnez tous les détails utiles pour vous répondre"
        />
        <Button title={submitLabel} onPress={submit} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  tall: { minHeight: 180 },
});
