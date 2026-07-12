import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { productService, aiService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import { PINK } from '../config/api';

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    productService.list({ per_page: 4, sort: 'latest' })
      .then(({ data }) => setFeatured(data.data || []))
      .finally(() => setLoading(false));
    aiService.recommendations({ limit: 4 }).then(({ data }) => setForYou(data.data || []));
  }, [user]);

  const handleAddCart = async (productId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart(productId);
      Alert.alert('Panier', 'Produit ajouté au panier');
    } catch {
      Alert.alert('Erreur', 'Ajout impossible');
    }
  };

  const handleWishlist = async (productId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await toggle(productId);
    } catch {
      Alert.alert('Erreur', 'Favoris impossible');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.badge}>NOUVELLE COLLECTION</Text>
        <Text style={styles.heroTitle}>Shoppez avec style sur Vivid</Text>
        <Text style={styles.heroSub}>
          Mode, tech, maison — des produits sélectionnés pour vous.
        </Text>
        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Boutique')}>
          <Text style={styles.heroBtnText}>Découvrir la boutique</Text>
        </TouchableOpacity>
      </View>

      {!user && (
        <View style={styles.authBanner}>
          <Text style={styles.authText}>Parcourez librement ou connectez-vous pour commander</Text>
          <View style={styles.authRow}>
            <TouchableOpacity style={styles.authBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.authBtnText}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.authBtnOutline} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.authBtnOutlineText}>Inscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TrustBadges />

      <Text style={styles.sectionTitle}>Sélection de la rédaction</Text>
      <Text style={styles.sectionSub}>Nos coups de cœur cette semaine</Text>

      {loading ? (
        <ActivityIndicator size="large" color={PINK} style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.grid}>
          {featured.map((product, index) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                index={index}
                wishlisted={isWishlisted(product.id)}
                onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
                onAddCart={handleAddCart}
                onAddWishlist={handleWishlist}
              />
            </View>
          ))}
        </View>
      )}

      {forYou.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{user ? 'Recommandé pour vous' : 'Populaires'}</Text>
          <Text style={styles.sectionSub}>Suggestions intelligentes</Text>
          <View style={styles.grid}>
            {forYou.map((product, index) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  product={product}
                  index={index}
                  wishlisted={isWishlisted(product.id)}
                  onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
                  onAddCart={handleAddCart}
                  onAddWishlist={handleWishlist}
                />
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.seeAll} onPress={() => navigation.navigate('Boutique')}>
        <Text style={styles.seeAllText}>Voir toute la boutique →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  content: { paddingBottom: 32 },
  hero: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    backgroundColor: PINK,
  },
  badge: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 8, lineHeight: 34 },
  heroSub: { color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 22 },
  heroBtn: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  heroBtnText: { color: PINK, fontWeight: '800', fontSize: 15 },
  authBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  authText: { color: '#6b7280', textAlign: 'center', marginBottom: 12 },
  authRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  authBtn: {
    backgroundColor: PINK,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  authBtnText: { color: '#fff', fontWeight: '700' },
  authBtnOutline: {
    borderWidth: 1,
    borderColor: PINK,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  authBtnOutlineText: { color: PINK, fontWeight: '700' },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginHorizontal: 16, marginTop: 24, color: '#111' },
  sectionSub: { color: '#6b7280', marginHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  gridItem: { width: '50%' },
  seeAll: { alignItems: 'center', marginTop: 16 },
  seeAllText: { color: PINK, fontWeight: '700', fontSize: 16 },
});
