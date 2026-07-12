import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { authService } from '../services';
import { PINK } from '../config/api';

export default function ResetPasswordScreen({ route, navigation }) {
  const { token = '', email: initialEmail = '' } = route.params || {};
  const [form, setForm] = useState({
    email: initialEmail,
    token,
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email || !form.token || !form.password) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.resetPassword(form);
      Alert.alert('Succès', data.message || 'Mot de passe mis à jour', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Réinitialisation impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Vivid</Text>
      <Text style={styles.title}>Nouveau mot de passe</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(v) => setForm({ ...form, email: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Nouveau mot de passe (min. 8)"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => setForm({ ...form, password: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        secureTextEntry
        value={form.password_confirmation}
        onChangeText={(v) => setForm({ ...form, password_confirmation: v })}
      />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Réinitialiser</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Connexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: '800', color: PINK, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: PINK,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: PINK, fontWeight: '600', marginTop: 24 },
});
