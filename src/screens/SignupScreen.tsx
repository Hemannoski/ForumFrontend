import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Banner, Button, TextField } from '../components/ui';
import type { AuthStackParamList } from '../navigation/types';
import { spacing } from '../theme';
import AuthLayout from './AuthLayout';

export default function SignupScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Signup'>) {
  const { register } = useAuth();
  const [pseudo, setPseudo] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!pseudo.trim() || !lastname.trim() || !firstname.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne sont pas identiques.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ pseudo: pseudo.trim(), lastname: lastname.trim(), firstname: firstname.trim(), password });
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Posez vos questions et répondez à celles des autres.">
      {error ? <Banner message={error} /> : null}
      <TextField
        label="Pseudo"
        value={pseudo}
        onChangeText={setPseudo}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={30}
      />
      <TextField label="Nom" value={lastname} onChangeText={setLastname} autoCapitalize="words" maxLength={50} />
      <TextField label="Prénom" value={firstname} onChangeText={setFirstname} autoCapitalize="words" maxLength={50} />
      <TextField
        label="Mot de passe (6 caractères minimum)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <TextField
        label="Confirmer le mot de passe"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        onSubmitEditing={submit}
      />
      <Button title="S'inscrire" onPress={submit} loading={loading} />
      <View style={styles.link}>
        <Button title="J'ai déjà un compte, je me connecte" variant="secondary" onPress={() => navigation.navigate('Login')} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { marginTop: spacing.md },
});
