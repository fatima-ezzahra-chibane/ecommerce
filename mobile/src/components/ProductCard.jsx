import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PINK } from '../config/api';
import { formatPrice } from '../utils/formatPrice';
import { getPromo } from '../utils/productDisplay';
import { resolveMediaUrl } from '../utils/mediaUrl';
import Stars from './Stars';

const FALLBACK = 'https://picsum.photos/seed/vivid/400/400';

export default function ProductCard({ product, onPress, onAddCart, onAddWishlist, wishlisted = false }) {
  const imageUri = resolveMediaUrl(product.image) || FALLBACK;
  const rating = product.average_rating ? Number(product.average_rating) : null;
  const promo = getPromo(product);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        {promo && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>-{promo.percent}%</Text>
          </View>
        )}
        {onAddWishlist && (
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={(e) => {
              e?.stopPropagation?.();
              onAddWishlist(product.id);
            }}
          >
            <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={20} color={wishlisted ? PINK : '#6b7280'} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {rating > 0 && (
          <View style={styles.ratingRow}>
            <Stars rating={rating} size={14} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        {promo && <Text style={styles.oldPrice}>{formatPrice(promo.original)}</Text>}
        {onAddCart && (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={(e) => {
              e?.stopPropagation?.();
              onAddCart(product.id);
            }}
          >
            <Ionicons name="bag-handle-outline" size={16} color="#fff" />
            <Text style={styles.cartBtnText}>Panier</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 140, backgroundColor: '#f3f4f6' },
  promoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: PINK,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promoText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  body: { padding: 12 },
  name: { fontSize: 14, fontWeight: '700', color: '#1e293b', minHeight: 36 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '800', color: PINK, marginTop: 4 },
  oldPrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  cartBtn: {
    marginTop: 8,
    backgroundColor: PINK,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
