import { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { productService, reviewService, aiService } from '../services';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import { getPromo } from '../utils/productDisplay';
import Stars from '../components/Stars';
import ProductCard from '../components/ProductCard';
import { PINK } from '../config/api';
import { resolveMediaUrl } from '../utils/mediaUrl';

const FALLBACK = 'https://picsum.photos/seed/vivid-detail/600/600';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', imageAsset: null });
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const loadReviews = () => reviewService.list(id).then(({ data }) => setReviews(data.data || []));

  useEffect(() => {
    productService.get(id)
      .then(({ data }) => setProduct(data.data))
      .catch(() => Alert.alert('Erreur', 'Produit introuvable'))
      .finally(() => setLoading(false));
    loadReviews();
    aiService.productRecommendations(id).then(({ data }) => setRelated(data.data || []));
  }, [id]);

  const handleAdd = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart(product.id);
      Alert.alert('Panier', 'Produit ajouté');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Ajout impossible');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await toggle(product.id);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Favoris impossible');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Accès à la galerie requis pour ajouter une photo');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setReviewForm((f) => ({ ...f, imageAsset: result.assets[0] }));
    }
  };

  const submitReview = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.create(id, reviewForm);
      setReviewForm({ rating: 5, comment: '', imageAsset: null });
      await loadReviews();
      const { data } = await productService.get(id);
      setProduct(data.data);
      Alert.alert('Merci', 'Votre avis a été publié');
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.image?.[0]
        || err.message
        || 'Publication impossible';
      Alert.alert('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PINK} />
      </View>
    );
  }

  const imageUri = resolveMediaUrl(product.image) || FALLBACK;
  const promo = getPromo(product, product.id);
  const wishlisted = isWishlisted(product.id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        {promo && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>-{promo.percent}%</Text>
          </View>
        )}
        <TouchableOpacity style={styles.heartBtn} onPress={handleWishlist}>
          <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={24} color={wishlisted ? PINK : '#6b7280'} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {product.category?.name && (
          <Text style={styles.category}>{product.category.name}</Text>
        )}
        <Text style={styles.name}>{product.name}</Text>
        {product.average_rating > 0 && (
          <View style={styles.ratingRow}>
            <Stars rating={product.average_rating} size={18} />
            <Text style={styles.ratingText}>{product.average_rating}</Text>
          </View>
        )}
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        {promo && <Text style={styles.oldPrice}>{formatPrice(promo.original)}</Text>}
        <Text style={styles.desc}>{product.description || 'Aucune description.'}</Text>
        <Text style={styles.stock}>En stock : {product.stock} unités</Text>

        <TouchableOpacity style={styles.btn} onPress={handleAdd}>
          <Ionicons name="bag-handle-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Ajouter au panier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Main', { screen: 'Panier' })}>
          <Text style={styles.linkText}>Voir le panier</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>Avis clients ({reviews.length})</Text>

        {user && (
          <View style={styles.reviewForm}>
            <Text style={styles.formLabel}>Note</Text>
            <View style={styles.starsPicker}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setReviewForm((f) => ({ ...f, rating: n }))}>
                  <Ionicons
                    name={n <= reviewForm.rating ? 'star' : 'star-outline'}
                    size={28}
                    color={n <= reviewForm.rating ? PINK : '#e5e7eb'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Votre avis..."
              multiline
              numberOfLines={3}
              value={reviewForm.comment}
              onChangeText={(v) => setReviewForm((f) => ({ ...f, comment: v }))}
            />
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={18} color={PINK} />
              <Text style={styles.photoBtnText}>Photo (optionnel)</Text>
            </TouchableOpacity>
            {reviewForm.imageAsset?.uri && (
              <Image source={{ uri: reviewForm.imageAsset.uri }} style={styles.previewImg} />
            )}
            <TouchableOpacity style={styles.submitReviewBtn} onPress={submitReview} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitReviewText}>Publier l&apos;avis</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{r.user?.name || 'Client'}</Text>
              <Stars rating={r.rating} size={14} />
            </View>
            {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
            {r.image ? (
              <Image source={{ uri: resolveMediaUrl(r.image) }} style={styles.reviewImg} />
            ) : null}
          </View>
        ))}

        {!reviews.length && (
          <Text style={styles.noReviews}>Soyez le premier à donner votre avis.</Text>
        )}
      </View>

      {related.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Vous aimerez aussi</Text>
          <View style={styles.relatedGrid}>
            {related.map((item, index) => (
              <View key={item.id} style={styles.relatedItem}>
                <ProductCard
                  product={item}
                  index={index}
                  onPress={() => navigation.push('ProductDetail', { id: item.id })}
                  onAddCart={handleAdd}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 300, backgroundColor: '#f3f4f6' },
  promoBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: PINK,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  promoText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heartBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  body: { padding: 20 },
  category: { color: PINK, fontWeight: '600', fontSize: 14 },
  name: { fontSize: 24, fontWeight: '800', color: '#111', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingText: { color: '#6b7280', fontWeight: '600' },
  price: { fontSize: 22, fontWeight: '800', color: PINK, marginTop: 8 },
  oldPrice: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 2 },
  desc: { marginTop: 16, lineHeight: 22, color: '#374151' },
  stock: { marginTop: 12, color: '#6b7280' },
  btn: {
    backgroundColor: PINK,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 12 },
  linkText: { color: PINK, fontWeight: '600' },
  reviewsSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f9fb',
    borderRadius: 20,
    marginBottom: 32,
  },
  reviewsTitle: { fontSize: 18, fontWeight: '800', color: '#475569', marginBottom: 16 },
  reviewForm: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  formLabel: { fontWeight: '600', color: '#374151', marginBottom: 8 },
  starsPicker: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  photoBtnText: { color: PINK, fontWeight: '600' },
  previewImg: { width: 100, height: 100, borderRadius: 12, marginBottom: 12 },
  submitReviewBtn: {
    backgroundColor: PINK,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitReviewText: { color: '#fff', fontWeight: '700' },
  reviewCard: { borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 16, marginBottom: 16 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { fontWeight: '700', color: '#111' },
  reviewComment: { color: '#6b7280', marginTop: 8, lineHeight: 20 },
  reviewImg: { width: 100, height: 100, borderRadius: 12, marginTop: 8 },
  noReviews: { color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
  relatedSection: { padding: 16, paddingBottom: 32 },
  relatedTitle: { fontSize: 18, fontWeight: '800', color: '#475569', marginBottom: 12 },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  relatedItem: { width: '50%' },
});
