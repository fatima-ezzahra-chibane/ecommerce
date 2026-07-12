import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PINK } from '../config/api';

export default function GuestPrompt({ title, message, navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Vivid</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.btnText}>Se connecter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.btnOutlineText}>Créer un compte</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Accueil' })}>
        <Text style={styles.link}>Continuer en invité</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9fafb' },
  logo: { fontSize: 32, fontWeight: '800', color: PINK, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: '#111', marginBottom: 8 },
  message: { textAlign: 'center', color: '#6b7280', marginBottom: 28, lineHeight: 22 },
  btn: {
    backgroundColor: PINK,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutline: {
    borderWidth: 1,
    borderColor: PINK,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnOutlineText: { color: PINK, fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#9ca3af', fontSize: 14 },
});
