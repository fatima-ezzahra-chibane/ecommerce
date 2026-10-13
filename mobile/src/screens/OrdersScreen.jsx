import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { orderService } from '../services';
import OrderCard from '../components/OrderCard';
import { PINK } from '../config/api';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (page = 1) => {
    try {
      const { data } = await orderService.list({ page });
      setOrders((prev) => (page === 1 ? data.data || [] : [...prev, ...(data.data || [])]));
      setMeta(data.meta || null);
    } catch {
      /* liste conservée ; tirer pour réessayer */
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadMore = () => {
    if (loadingMore || !meta || meta.current_page >= meta.last_page) return;
    setLoadingMore(true);
    load(meta.current_page + 1);
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
      <Text style={styles.header}>Mes commandes</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
          >
            <OrderCard order={item} />
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={PINK} style={styles.more} /> : null}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucune commande</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', padding: 16, color: '#111' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  more: { marginVertical: 16 },
});
