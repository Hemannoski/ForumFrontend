import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as api from '../api';
import { PagedList } from '../components/PagedList';
import { QuestionCard } from '../components/QuestionCard';
import { usePaged } from '../hooks/usePaged';
import type { RootStackParamList } from '../navigation/types';
import { useRefresh } from '../state/RefreshContext';
import { colors, radius, spacing } from '../theme';
import type { Question } from '../types';

export default function QuestionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { version } = useRefresh();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  // On attend 400 ms après la dernière frappe avant de lancer la recherche.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 400);
    return () => clearTimeout(timer);
  }, [input]);

  const state = usePaged<Question>((page) => api.listQuestions({ search, page }), [search, version]);

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={input}
          onChangeText={setInput}
          placeholder="Rechercher une question…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <PagedList
        state={state}
        emptyText={search ? 'Aucune question ne correspond à cette recherche.' : "Aucune question pour l'instant. Soyez le premier à en publier une !"}
        renderItem={(q) => (
          <QuestionCard
            question={q}
            onPress={() => navigation.navigate('QuestionDetail', { id: q.id })}
            onAuthorPress={() => navigation.navigate('UserProfile', { userId: q.author_id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing.sm,
    margin: spacing.lg,
    marginBottom: 0,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, minHeight: 46, fontSize: 16, color: colors.ink },
});
