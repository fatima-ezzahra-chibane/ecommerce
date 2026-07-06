import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../services';
import PageHeader from '../components/PageHeader';
import OrderCard from '../components/OrderCard';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderService.get(id).then(({ data }) => setOrder(data.data));
  }, [id]);

  if (!order) {
    return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Ma commande"
        subtitle={new Date(order.created_at).toLocaleString('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
        })}
      >
        <Link to="/orders" className="btn-vivid-outline text-sm !py-2">
          ← Mes commandes
        </Link>
      </PageHeader>

      <OrderCard order={order} />
    </div>
  );
}
