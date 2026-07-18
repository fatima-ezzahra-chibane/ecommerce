import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert,
  TextInput, TouchableOpacity, ScrollView,
} from 'react-native';
import { productService, categoryService, aiService } from '../services';
import * as ImagePicker from 'expo-image-picker';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { PINK, API_URL } from '../config/api';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Nouveautés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

export default function ShopScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [imageSearching, setImageSearching] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const load = useCallback(async () => {
    try {
      const { data } = await productService.list({
        search: search || undefined,
        category_id: categoryId || undefined,
        sort,
        page,
        per_page: 12,
      });
      setProducts(data.data || []);
      setMeta(data.meta || null);
    } catch {
      Alert.alert(
        'Erreur API',
        `Impossible de charger les produits.\n\nURL : ${API_URL}\n\nLancez : API_HOST_IP=VOTRE_IP ./start.sh`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, categoryId, sort, page]);

  useEffect(() => {
    categoryService.list().then(({ data }) => setCategories(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddCart = async (productId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart(productId);
      Alert.alert('Panier', 'Produit ajouté au panier');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Ajout impossible');
    }
  };

  const handleWishlist = async (productId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await toggle(productId);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Favoris impossible');
    }
  };

  const submitSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const searchByImage = async () => {
    // Un seul clic : ouvre directement la galerie (permission demandée si besoin)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setImageSearching(true);
    try {
      const { data } = await aiService.searchImage(result.assets[0]);
      const products = data.data?.products || [];
      if (products.length === 1) {
        navigation.navigate('ProductDetail', { id: products[0].id });
      } else {
        Alert.alert(
          'Recherche photo',
          'Aucun produit identique à cette photo dans notre catalogue.\n\nAstuce : utilisez la même image que celle du produit (enregistrée depuis la fiche produit).'
        );
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.image?.[0]
        || err.response?.data?.message
        || err.message
        || 'Service CV indisponible';
      Alert.alert('Recherche photo', msg);
    } finally {
      setImageSearching(false);
    }
  };

  const ListHeader = () => (
    <View>
      <Text style={styles.header}>{search ? `Résultats : « ${search} »` : 'Boutique'}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={submitSearch}>
          <Text style={styles.searchBtnText}>OK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={searchByImage} disabled={imageSearching}>
          <Text style={styles.photoBtnText}>{imageSearching ? '…' : '📷'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <TouchableOpacity
          style={[styles.catPill, !categoryId && styles.catPillActive]}
          onPress={() => { setCategoryId(''); setPage(1); }}
        >
          <Text style={[styles.catText, !categoryId && styles.catTextActive]}>Tout</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catPill, categoryId === String(c.id) && styles.catPillActive]}
            onPress={() => { setCategoryId(String(c.id)); setPage(1); }}
          >
            <Text style={[styles.catText, categoryId === String(c.id) && styles.catTextActive]}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortPill, sort === opt.value && styles.sortPillActive]}
            onPress={() => { setSort(opt.value); setPage(1); }}
          >
            <Text style={[styles.sortText, sort === opt.value && styles.sortTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ListFooter = () => {
    if (!meta || meta.last_page <= 1) return null;
    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          disabled={page <= 1}
          onPress={() => setPage((p) => p - 1)}
        >
          <Text style={styles.pageBtnText}>← Préc.</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>{page} / {meta.last_page}</Text>
        <TouchableOpacity
          style={[styles.pageBtn, page >= meta.last_page && styles.pageBtnDisabled]}
          disabled={page >= meta.last_page}
          onPress={() => setPage((p) => p + 1)}
        >
          <Text style={styles.pageBtnText}>Suiv. →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PINK} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            wishlisted={isWishlisted(item.id)}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            onAddCart={handleAddCart}
            onAddWishlist={handleWishlist}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucun produit trouvé</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', padding: 16, paddingBottom: 8, color: '#111' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: PINK,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700' },
  photoBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: PINK,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
  },
  photoBtnText: { fontSize: 18 },
  catScroll: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 44 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  catPillActive: { backgroundColor: PINK, borderColor: PINK },
  catText: { fontWeight: '600', color: '#6b7280', fontSize: 13 },
  catTextActive: { color: '#fff' },
  sortScroll: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 40 },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
  },
  sortPillActive: { backgroundColor: '#fff0f5' },
  sortText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  sortTextActive: { color: PINK },
  list: { paddingHorizontal: 10, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontWeight: '600', color: PINK },
  pageInfo: { fontWeight: '700', color: '#374151' },
});
