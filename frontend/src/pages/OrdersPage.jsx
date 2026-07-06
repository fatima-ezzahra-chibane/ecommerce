import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services';
import PageHeader from '../components/PageHeader';
import OrderCard from '../components/OrderCard';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .list()
      .then(({ data }) => setOrders(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Mes commandes" subtitle={`${orders.length} commande(s)`} />

      {loading && (
        <div className="text-center py-20 text-gray-400">Chargement...</div>
      )}

      {!loading && (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} showDetailLink />
          ))}
        </div>
      )}

      {!loading && !orders.length && (
        <div className="card-vivid p-12 text-center text-gray-500">
          Aucune commande.{' '}
          <Link to="/shop" className="text-[#ff4d8d] font-semibold">
            Acheter maintenant
          </Link>
        </div>
      )}
    </div>
  );
}
