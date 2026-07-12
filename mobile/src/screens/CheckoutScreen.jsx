import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { orderService } from '../services';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/formatPrice';
import TrustBadges from '../components/TrustBadges';
import { PINK } from '../config/api';

const PAYMENT_OPTIONS = [
  { value: 'card', label: 'Carte bancaire' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash', label: 'À la livraison' },
];

export default function CheckoutScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const { cart, refresh } = useCart();

  const total = cart?.items?.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0) ?? 0;

  const submit = async () => {
    if (!address.trim()) {
      Alert.alert('Erreur', 'Adresse de livraison requise');
      return;
    }
    setLoading(true);
    try {
      await orderService.create({
        shipping_address: address,
        payment_method: paymentMethod,
        coupon_code: coupon || undefined,
      });
      await refresh();
      Alert.alert('Succès', 'Commande confirmée !', [
        { text: 'OK', onPress: () => navigation.navigate('Orders') },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Commande impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Checkout</Text>

      {cart?.items?.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          {cart.items.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {item.product.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryPrice}>
                {formatPrice(Number(item.product.price) * item.quantity)}
              </Text>
            </View>
          ))}
          <Text style={styles.summaryTotal}>Total : {formatPrice(total)}</Text>
        </View>
      )}

      <Text style={styles.label}>Adresse de livraison</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        multiline
        numberOfLines={3}
        value={address}
        onChangeText={setAddress}
        placeholder="123 Avenue Hassan II, Casablanca"
      />

      <Text style={styles.label}>Paiement</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.paymentPill, paymentMethod === opt.value && styles.paymentPillActive]}
            onPress={() => setPaymentMethod(opt.value)}
          >
            <Text style={[styles.paymentText, paymentMethod === opt.value && styles.paymentTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Code promo (optionnel)</Text>
      <TextInput
        style={styles.input}
        value={coupon}
        onChangeText={setCoupon}
        placeholder="WELCOME10"
        autoCapitalize="characters"
      />

      <TrustBadges />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirmer la commande</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  summary: {
    backgroundColor: '#f8f9fb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: { fontWeight: '800', fontSize: 16, marginBottom: 12, color: '#111' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  summaryName: { flex: 1, color: '#374151', fontSize: 14 },
  summaryPrice: { fontWeight: '700', color: '#111' },
  summaryTotal: { fontWeight: '800', fontSize: 18, color: PINK, marginTop: 8 },
  label: { fontWeight: '600', marginBottom: 8, color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  paymentPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  paymentPillActive: { backgroundColor: PINK, borderColor: PINK },
  paymentText: { fontWeight: '600', color: '#6b7280', fontSize: 13 },
  paymentTextActive: { color: '#fff' },
  btn: {
    backgroundColor: PINK,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
