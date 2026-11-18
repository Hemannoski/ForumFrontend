import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as api from '../api';
import { errorMessage } from '../api/client';
import { useCurrentUser } from '../auth/AuthContext';
import { LikeButton } from '../components/LikeButton';
import { Button, EmptyView, ErrorView, LoadingView } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { useRefresh } from '../state/RefreshContext';
import { colors, radius, spacing } from '../theme';
import type { Answer, Question } from '../types';

export default function QuestionDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'QuestionDetail'>) {
  const { id } = route.params;
  const user = useCurrentUser();
  const { bump } = useRefresh();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // Recharge à chaque retour sur l'écran (ex. après avoir modifié la question).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([api.getQuestion(id), api.listAnswers(id)])
        .then(([q, a]) => {
          if (active) {
            setQuestion(q);
            setAnswers(a);
            setError(null);
          }
        })
        .catch((e) => active && setError(errorMessage(e)))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [id]),
  );

  async function sendAnswer() {
    const content = draft.trim();
    if (!content || !question) {
      return;
    }
    setSending(true);
    try {
      const answer = await api.postAnswer(id, content);
      setAnswers((current) => [answer, ...current]);
      setQuestion({ ...question, answers_count: question.answers_count + 1 });
      setDraft('');
      bump();
    } catch (e) {
      Alert.alert('Réponse non envoyée', errorMessage(e));
    } finally {
      setSending(false);
    }
  }


  async function toggleLike() {
    if (!question || likeBusy) {
      return;
    }
    setLikeBusy(true);
    try {
      const res = question.liked_by_me ? await api.unlikeQuestion(id) : await api.likeQuestion(id);
      setQuestion({ ...question, liked_by_me: res.liked, likes_count: res.likes_count });
      bump();
    } catch (e) {
      Alert.alert('Action impossible', errorMessage(e));
    } finally {
      setLikeBusy(false);
    }
  }

  function confirmDeleteAnswer(answer: Answer) {
    Alert.alert('Supprimer la réponse', 'Cette réponse sera supprimée définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteAnswer(answer.id);
            setAnswers((current) => current.filter((a) => a.id !== answer.id));
            setQuestion((q) => (q ? { ...q, answers_count: Math.max(0, q.answers_count - 1) } : q));
            bump();
          } catch (e) {
            Alert.alert('Suppression impossible', errorMessage(e));
          }
        },
      },
    ]);
  }

  function confirmDeleteQuestion() {
    Alert.alert('Supprimer la question', 'La question et ses réponses seront supprimées définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteQuestion(id);
            bump();
            navigation.goBack();
          } catch (e) {
            Alert.alert('Suppression impossible', errorMessage(e));
          }
        },
      },
    ]);
  }

  if (loading) {
    return <LoadingView />;
  }
  if (error || !question) {
    return <ErrorView message={error ?? 'Aucune question trouvée.'} />;
  }

  const isAuthor = question.author_id === user.id;

  const header = (
    <View>
      <View style={styles.card}>
        <Text style={styles.title}>{question.title}</Text>
        <View style={styles.meta}>
          <Pressable onPress={() => navigation.navigate('UserProfile', { userId: question.author_id })} hitSlop={8}>
            <Text style={styles.author}>{question.author_pseudo}</Text>
          </Pressable>
          <Text style={styles.metaText}>{question.date}</Text>
        </View>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.body}>{question.description}</Text>
        <Text style={styles.sectionLabel}>Contenu</Text>
        <Text style={styles.body}>{question.content}</Text>
        <View style={styles.likeRow}>
          <LikeButton
            liked={question.liked_by_me}
            count={question.likes_count}
            onPress={isAuthor ? undefined : () => void toggleLike()}
            disabled={likeBusy}
          />
        </View>
        {isAuthor ? (
          <View style={styles.actions}>
            <Button compact variant="secondary" title="Modifier" onPress={() => navigation.navigate('EditQuestion', { id })} />
            <Button compact variant="danger" title="Supprimer" onPress={confirmDeleteQuestion} />
          </View>
        ) : null}
      </View>
      <Text style={styles.answersTitle}>
        {answers.length} {answers.length > 1 ? 'réponses' : 'réponse'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={answers}
        keyExtractor={(a) => String(a.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyView text="Pas encore de réponse. Écrivez la première ci-dessous." />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <View style={styles.answer}>
            <View style={styles.answerHeader}>
              <Pressable onPress={() => navigation.navigate('UserProfile', { userId: item.author_id })} hitSlop={8}>
                <Text style={styles.author}>{item.author_pseudo}</Text>
              </Pressable>
              <Text style={styles.metaText}>{item.date}</Text>
              {item.author_id === user.id ? (
                <Pressable
                  onPress={() => confirmDeleteAnswer(item)}
                  accessibilityLabel="Supprimer ma réponse"
                  hitSlop={10}
                  style={styles.trash}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.body}>{item.content}</Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          value={draft}
          onChangeText={setDraft}
          placeholder="Écrire une réponse…"
          placeholderTextColor={colors.muted}
          multiline
          maxLength={5000}
        />
        <Button title="Envoyer" compact onPress={sendAnswer} loading={sending} disabled={!draft.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { padding: spacing.lg, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, lineHeight: 28 },
  meta: { flexDirection: 'row', columnGap: spacing.md, marginTop: spacing.sm, alignItems: 'center' },
  metaText: { fontSize: 13, color: colors.muted },
  author: { fontSize: 14, fontWeight: '600', color: colors.primary },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.xs },
  likeRow: { marginTop: spacing.lg },
  body: { fontSize: 16, color: colors.ink, lineHeight: 23 },
  actions: { flexDirection: 'row', columnGap: spacing.sm, marginTop: spacing.lg },
  answersTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.md },
  answer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  answerHeader: { flexDirection: 'row', alignItems: 'center', columnGap: spacing.md, marginBottom: spacing.xs },
  trash: { marginLeft: 'auto' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  composerInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
});
