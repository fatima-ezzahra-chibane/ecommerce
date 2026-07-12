import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { authService } from '../services';
import { PINK } from '../config/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Email requis');
      return;
    }
    setLoading(true);
    setResetUrl('');
    try {
      const { data } = await authService.forgotPassword({ email });
      if (data.reset_url) {
        setResetUrl(data.reset_url);
      } else {
        Alert.alert('Succès', data.message || 'Si le compte existe, un email a été envoyé.');
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Envoi impossible');
    } finally {
      setLoading(false);
    }
  };

  const openReset = () => {
    const tokenMatch = resetUrl.match(/[?&]token=([^&]+)/);
    const emailMatch = resetUrl.match(/[?&]email=([^&]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
    const emailParam = emailMatch ? decodeURIComponent(emailMatch[1]) : email;
    if (token) {
      navigation.navigate('ResetPassword', { token, email: emailParam });
    } else {
      Linking.openURL(resetUrl);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Vivid</Text>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.sub}>
        Entrez votre email pour recevoir un lien de réinitialisation.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Envoyer le lien</Text>}
      </TouchableOpacity>

      {resetUrl ? (
        <View style={styles.devBox}>
          <Text style={styles.devTitle}>Mode dev — lien direct :</Text>
          <TouchableOpacity onPress={openReset}>
            <Text style={styles.devLink}>{resetUrl}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>← Retour connexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: '800', color: PINK, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111' },
  sub: { textAlign: 'center', color: '#6b7280', marginBottom: 24, lineHeight: 20 },
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
  devBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
  },
  devTitle: { fontSize: 12, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  devLink: { fontSize: 11, color: PINK, textDecorationLine: 'underline' },
  link: { textAlign: 'center', color: PINK, fontWeight: '600', marginTop: 24 },
});
