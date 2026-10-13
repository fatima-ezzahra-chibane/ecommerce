import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { orderService } from '../services';
import OrderCard from '../components/OrderCard';
import { PINK } from '../config/api';

export default function OrderDetailScreen({ route }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.get(id)
      .then(({ data }) => setOrder(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (!loading && !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Commande introuvable</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PINK} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <OrderCard order={order} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 18, fontWeight: '700', color: '#6b7280' },
});
