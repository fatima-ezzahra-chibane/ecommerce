import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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
      .catch(() => Alert.alert('Erreur', 'Commande introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !order) {
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
});
