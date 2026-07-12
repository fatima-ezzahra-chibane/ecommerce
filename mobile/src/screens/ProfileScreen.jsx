import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services';
import { PINK } from '../config/api';
import GuestPrompt from '../components/GuestPrompt';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [password, setPassword] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  if (!user) {
    return (
      <GuestPrompt
        navigation={navigation}
        title="Mon compte"
        message="Connectez-vous pour accéder à votre profil, vos commandes et votre panier."
      />
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      const { data } = await profileService.update(profile);
      await refreshUser();
      setMsg(data.message || 'Profil mis à jour');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur mise à jour profil');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setSaving(true);
    setMsg('');
    try {
      const { data } = await profileService.updatePassword(password);
      setMsg(data.message || 'Mot de passe modifié');
      setPassword({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Profil</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={PINK} />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>Rôle : {user.role}</Text>
      </View>

      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Orders')}>
        <Ionicons name="receipt-outline" size={22} color="#111" />
        <Text style={styles.menuBtnText}>Mes commandes</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Main', { screen: 'Favoris' })}>
        <Ionicons name="heart-outline" size={22} color="#111" />
        <Text style={styles.menuBtnText}>Mes favoris</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Informations</Text>
        <Text style={styles.readOnly}>Email : {user.email}</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={profile.name}
          onChangeText={(v) => setProfile({ ...profile, name: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Téléphone"
          value={profile.phone}
          onChangeText={(v) => setProfile({ ...profile, phone: v })}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Mot de passe actuel"
          secureTextEntry
          value={password.current_password}
          onChangeText={(v) => setPassword({ ...password, current_password: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          secureTextEntry
          value={password.password}
          onChangeText={(v) => setPassword({ ...password, password: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer"
          secureTextEntry
          value={password.password_confirmation}
          onChangeText={(v) => setPassword({ ...password, password_confirmation: v })}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={savePassword} disabled={saving}>
          <Text style={styles.saveBtnText}>Modifier le mot de passe</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: '#111' },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff0f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#111' },
  email: { color: '#6b7280', marginTop: 4 },
  role: { color: PINK, fontWeight: '600', marginTop: 8 },
  menuBtn: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtnText: { flex: 1, color: '#111', fontWeight: '700', fontSize: 16 },
  msg: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  formTitle: { fontWeight: '800', fontSize: 16, marginBottom: 12, color: '#111' },
  readOnly: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: PINK,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: PINK,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: PINK, fontWeight: '700' },
});
