import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as api from '../api';
import { QuestionForm } from '../components/QuestionForm';
import type { RootStackParamList } from '../navigation/types';
import { useRefresh } from '../state/RefreshContext';

export default function PublishScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { bump } = useRefresh();

  return (
    <QuestionForm
      submitLabel="Publier la question"
      clearAfterSubmit
      onSubmit={async (input) => {
        const question = await api.createQuestion(input);
        bump();
        navigation.navigate('QuestionDetail', { id: question.id });
      }}
    />
  );
}
