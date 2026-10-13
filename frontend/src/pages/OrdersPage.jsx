import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services';
import PageHeader from '../components/PageHeader';
import OrderCard from '../components/OrderCard';
import Pagination from '../components/Pagination';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderService
      .list({ page })
      .then(({ data }) => {
        setOrders(data.data || []);
        setMeta(data.meta || null);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Mes commandes" subtitle={`${meta?.total ?? orders.length} commande(s)`} />

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

      <Pagination meta={meta} onPage={setPage} />

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
