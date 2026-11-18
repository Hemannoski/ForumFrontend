import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as api from '../api';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { PagedList } from '../components/PagedList';
import { QuestionCard } from '../components/QuestionCard';
import { Avatar, Button, ErrorView } from '../components/ui';
import { usePaged } from '../hooks/usePaged';
import type { RootStackParamList } from '../navigation/types';
import { useRefresh } from '../state/RefreshContext';
import { colors, radius, spacing } from '../theme';
import type { Profile, Question } from '../types';

interface Props {
  userId: number;
  isSelf?: boolean;
}

// Profil d'un utilisateur avec ses publications. Sert pour "Mon profil" et pour le profil des autres.
export default function ProfileView({ userId, isSelf }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { version } = useRefresh();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = usePaged<Question>((page) => api.listUserQuestions(userId, page), [userId, version]);

  // Les compteurs sont rechargés à chaque fois que l'écran reprend le focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      api
        .getProfile(userId)
        .then((p) => active && (setProfile(p), setError(null)))
        .catch((e) => active && setError(errorMessage(e)));
      return () => {
        active = false;
      };
    }, [userId, version]),
  );

  function confirmLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => void logout() },
    ]);
  }

  if (error && !profile) {
    return <ErrorView message={error} />;
  }

  const header = profile ? (
    <View style={styles.header}>
      <View style={styles.card}>
        <Avatar name={profile.pseudo} size={72} />
        <Text style={styles.pseudo}>{profile.pseudo}</Text>
        <Text style={styles.fullName}>
          {profile.firstname} {profile.lastname}
        </Text>
        <View style={styles.stats}>
          <Stat value={profile.questions_count} label={profile.questions_count > 1 ? 'questions' : 'question'} />
          <View style={styles.divider} />
          <Stat value={profile.likes_received} label="j'aime reçus" />
          <View style={styles.divider} />
          <Stat value={profile.answers_count} label={profile.answers_count > 1 ? 'réponses' : 'réponse'} />
        </View>
        {isSelf ? (
          <View style={styles.logout}>
            <Button title="Se déconnecter" variant="danger" onPress={confirmLogout} />
          </View>
        ) : null}
      </View>
      <Text style={styles.sectionTitle}>Publications</Text>
    </View>
  ) : null;

  return (
    <View style={styles.screen}>
      <PagedList
        state={state}
        header={header}
        emptyText={isSelf ? "Vous n'avez rien publié pour l'instant." : "Cet utilisateur n'a rien publié pour l'instant."}
        renderItem={(q) => (
          <QuestionCard question={q} onPress={() => navigation.navigate('QuestionDetail', { id: q.id })} />
        )}
      />
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: { marginBottom: spacing.md },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pseudo: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: spacing.md },
  fullName: { fontSize: 15, color: colors.muted, marginTop: 2 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, columnGap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 13, color: colors.muted },
  divider: { width: 1, height: 28, backgroundColor: colors.line },
  logout: { alignSelf: 'stretch', marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: spacing.xl },
});
