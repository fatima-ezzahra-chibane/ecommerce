import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PINK } from '../config/api';

const BADGES = [
  { icon: 'rocket-outline', title: 'Livraison rapide', desc: 'Expédition sous 48h', color: '#fff0f5', iconColor: PINK },
  { icon: 'lock-closed-outline', title: 'Paiement sécurisé', desc: '100% protégé', color: '#fffbeb', iconColor: '#d97706' },
  { icon: 'refresh-outline', title: 'Retours faciles', desc: "30 jours pour changer d'avis", color: '#f0f9ff', iconColor: '#0284c7' },
];

export default function TrustBadges() {
  return (
    <View style={styles.row}>
      {BADGES.map((item) => (
        <View key={item.title} style={styles.card}>
          <View style={[styles.iconRing, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={26} color={item.iconColor} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', color: '#1e293b', marginTop: 12, fontSize: 15 },
  desc: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});
