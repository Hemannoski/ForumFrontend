import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as api from '../api';
import { errorMessage } from '../api/client';
import { useCurrentUser } from '../auth/AuthContext';
import { QuestionForm } from '../components/QuestionForm';
import { ErrorView, LoadingView } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { useRefresh } from '../state/RefreshContext';
import type { Question } from '../types';

export default function EditQuestionScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EditQuestion'>) {
  const { id } = route.params;
  const user = useCurrentUser();
  const { bump } = useRefresh();
  const [question, setQuestion] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getQuestion(id)
      .then(setQuestion)
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error) {
    return <ErrorView message={error} />;
  }
  if (!question) {
    return <LoadingView />;
  }
  if (question.author_id !== user.id) {
    return <ErrorView message="Vous n'êtes pas l'auteur de cette question." />;
  }

  return (
    <QuestionForm
      initial={{ title: question.title, description: question.description, content: question.content }}
      submitLabel="Enregistrer les modifications"
      onSubmit={async (input) => {
        await api.updateQuestion(id, input);
        bump();
        navigation.goBack();
      }}
    />
  );
}
