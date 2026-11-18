import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Banner, Button, TextField } from '../components/ui';
import type { AuthStackParamList } from '../navigation/types';
import { spacing } from '../theme';
import AuthLayout from './AuthLayout';

export default function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { login } = useAuth();
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!pseudo.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(pseudo.trim(), password);
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Se connecter" subtitle="Retrouvez vos questions et les réponses de la communauté.">
      {error ? <Banner message={error} /> : null}
      <TextField
        label="Pseudo"
        value={pseudo}
        onChangeText={setPseudo}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />
      <TextField
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Button title="Se connecter" onPress={submit} loading={loading} />
      <View style={styles.link}>
        <Button title="Je n'ai pas de compte, je m'inscris" variant="secondary" onPress={() => navigation.navigate('Signup')} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { marginTop: spacing.md },
});
