import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wishlistService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import GuestPrompt from '../components/GuestPrompt';
import { PINK } from '../config/api';

export default function WishlistScreen({ navigation }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { remove, refresh: refreshIds } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await wishlistService.list();
      setItems((data.data || []).filter((i) => i.product));
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les favoris');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (!user) {
    return (
      <GuestPrompt
        navigation={navigation}
        title="Favoris"
        message="Connectez-vous pour sauvegarder vos produits préférés."
      />
    );
  }

  const handleRemove = async (productId) => {
    await remove(productId);
    await refreshIds();
    load();
  };

  const handleAddCart = async (productId) => {
    try {
      await addToCart(productId);
      Alert.alert('Panier', 'Produit ajouté au panier');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Ajout impossible');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PINK} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favoris</Text>
      <Text style={styles.sub}>{items.length} produit(s) sauvegardé(s)</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item.product}
            wishlisted
            onPress={() => navigation.navigate('ProductDetail', { id: item.product_id })}
            onAddCart={handleAddCart}
            onAddWishlist={() => handleRemove(item.product_id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart" size={32} color={PINK} />
            </View>
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyText}>
              Appuyez sur le cœur d&apos;un produit pour l&apos;ajouter ici.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', paddingHorizontal: 16, paddingTop: 16, color: '#111' },
  sub: { color: '#6b7280', paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 10, paddingBottom: 24 },
  empty: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff0f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, color: '#111' },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
