import { View, Text, Image, StyleSheet } from 'react-native';
import { formatPrice } from '../utils/formatPrice';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { PINK } from '../config/api';

const STATUS = {
  pending: { label: 'En attente', bg: '#fef3c7', color: '#92400e' },
  processing: { label: 'En cours', bg: '#dbeafe', color: '#1e40af' },
  shipped: { label: 'Expédiée', bg: '#ede9fe', color: '#5b21b6' },
  delivered: { label: 'Livrée', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'Annulée', bg: '#fee2e2', color: '#991b1b' },
};

const FALLBACK = 'https://picsum.photos/seed/vivid-order/100/100';

export default function OrderCard({ order }) {
  const st = STATUS[order.status] || { label: order.status, bg: '#f3f4f6', color: '#374151' };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderLabel}>Commande #{order.id}</Text>
          <Text style={styles.date}>
            {new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.total}>{formatPrice(order.total_price)}</Text>
          <View style={[styles.badge, { backgroundColor: st.bg }]}>
            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
      </View>

      {order.shipping_address ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <Text style={styles.sectionText}>{order.shipping_address}</Text>
        </View>
      ) : null}

      {order.coupon_code ? (
        <Text style={styles.coupon}>
          Coupon : {order.coupon_code} (−{formatPrice(order.discount)})
        </Text>
      ) : null}

      {order.items?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles</Text>
          {order.items.map((item) => {
            const img = resolveMediaUrl(item.product?.image) || FALLBACK;
            return (
              <View key={item.id} style={styles.itemRow}>
                <Image source={{ uri: img }} style={styles.itemImg} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.product?.name}</Text>
                  <Text style={styles.itemQty}>Qté : {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {order.payment ? (
        <Text style={styles.payment}>
          Paiement : {order.payment.payment_method} — {order.payment.status}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  orderLabel: { fontWeight: '700', fontSize: 16, color: '#111' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  total: { fontSize: 20, fontWeight: '800', color: PINK },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 6 },
  sectionText: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  coupon: { marginTop: 12, fontSize: 13, color: '#16a34a', fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  itemImg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6' },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: '600', color: '#111' },
  itemQty: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  itemPrice: { fontWeight: '700', color: '#111' },
  payment: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: '#f3f4f6', fontSize: 12, color: '#6b7280' },
});
