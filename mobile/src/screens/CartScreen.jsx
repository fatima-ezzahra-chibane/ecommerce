import { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { cartService } from '../services';
import { formatPrice } from '../utils/formatPrice';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { PINK } from '../config/api';
import GuestPrompt from '../components/GuestPrompt';

const FALLBACK = 'https://picsum.photos/seed/vivid-cart/100/100';

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const { cart, loading, refresh } = useCart();

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (!user) {
    return (
      <GuestPrompt
        navigation={navigation}
        title="Mon panier"
        message="Connectez-vous pour ajouter des produits au panier et passer commande."
      />
    );
  }

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    await cartService.update(itemId, qty);
    refresh();
  };

  const remove = async (itemId) => {
    await cartService.remove(itemId);
    refresh();
  };

  const total = cart?.items?.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0) ?? 0;

  if (loading && !cart) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PINK} />
      </View>
    );
  }

  if (!cart?.items?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Panier vide</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Boutique')}>
          <Text style={styles.btnText}>Continuer vos achats</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mon panier</Text>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const img = resolveMediaUrl(item.product?.image) || FALLBACK;
          return (
            <View style={styles.row}>
              <Image source={{ uri: img }} style={styles.thumb} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.product.name}</Text>
                <Text style={styles.price}>{formatPrice(item.product.price)}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => updateQty(item.id, item.quantity - 1)}>
                  <Text style={styles.qtyBtn}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQty(item.id, item.quantity + 1)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => remove(item.id)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total : {formatPrice(total)}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.btnText}>Commander</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 28, fontWeight: '800', padding: 16, color: '#111' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#f3f4f6' },
  info: { flex: 1 },
  name: { fontWeight: '700', color: '#111' },
  price: { color: PINK, fontWeight: '700', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { fontSize: 20, paddingHorizontal: 8, color: PINK },
  qty: { fontWeight: '700', minWidth: 24, textAlign: 'center' },
  remove: { color: '#9ca3af', fontSize: 18, padding: 8 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  total: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  btn: { backgroundColor: PINK, padding: 16, borderRadius: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  emptyTitle: { fontSize: 18, color: '#6b7280', marginBottom: 16 },
});
