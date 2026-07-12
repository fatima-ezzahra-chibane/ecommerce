import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { PINK } from '../config/api';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await register(form);
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.message || 'Inscription impossible.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Vivid</Text>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput style={styles.input} placeholder="Nom" value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none"
        keyboardType="email-address" value={form.email}
        onChangeText={(v) => setForm({ ...form, email: v })} />
      <TextInput style={styles.input} placeholder="Téléphone (optionnel)" value={form.phone}
        onChangeText={(v) => setForm({ ...form, phone: v })} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry
        value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />
      <TextInput style={styles.input} placeholder="Confirmer le mot de passe" secureTextEntry
        value={form.password_confirmation}
        onChangeText={(v) => setForm({ ...form, password_confirmation: v })} />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Créer mon compte</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà inscrit ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: '800', color: PINK, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 24, color: '#111' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16,
    padding: 14, marginBottom: 12, fontSize: 16,
  },
  btn: { backgroundColor: PINK, padding: 16, borderRadius: 24, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: PINK, fontWeight: '600', marginTop: 20 },
});
