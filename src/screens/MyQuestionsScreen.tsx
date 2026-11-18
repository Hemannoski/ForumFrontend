import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as api from '../api';
import { errorMessage } from '../api/client';
import { useCurrentUser } from '../auth/AuthContext';
import { PagedList } from '../components/PagedList';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/ui';
import { usePaged } from '../hooks/usePaged';
import type { RootStackParamList } from '../navigation/types';
import { useRefresh } from '../state/RefreshContext';
import { colors } from '../theme';
import type { Question } from '../types';

export default function MyQuestionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useCurrentUser();
  const { version, bump } = useRefresh();
  const state = usePaged<Question>((page) => api.listUserQuestions(user.id, page), [user.id, version]);

  function confirmDelete(question: Question) {
    Alert.alert('Supprimer la question', `« ${question.title} » et ses réponses seront supprimées définitivement.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteQuestion(question.id);
            bump();
          } catch (e) {
            Alert.alert('Suppression impossible', errorMessage(e));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <PagedList
        state={state}
        emptyText="Vous n'avez publié aucune question. Utilisez l'onglet « Publier » pour poser la première."
        renderItem={(q) => (
          <QuestionCard
            question={q}
            onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
            footer={
              <>
                <Button compact variant="secondary" title="Modifier" onPress={() => navigation.navigate('EditQuestion', { id: q.id })} />
                <Button compact variant="danger" title="Supprimer" onPress={() => confirmDelete(q)} />
              </>
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
});
