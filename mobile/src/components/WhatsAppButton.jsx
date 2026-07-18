import { Linking, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWhatsAppUrl } from '../config/whatsapp';

export default function WhatsAppButton() {
  const openWhatsApp = async () => {
    try {
      await Linking.openURL(getWhatsAppUrl());
    } catch {
      // ignore
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={openWhatsApp}
      activeOpacity={0.85}
      accessibilityLabel="WhatsApp — Plus d'infos"
    >
      <Ionicons name="logo-whatsapp" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 100 : 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#25D366',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
});
