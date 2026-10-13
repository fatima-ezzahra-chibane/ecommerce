import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../services';
import PageHeader from '../components/PageHeader';
import OrderCard from '../components/OrderCard';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    orderService.get(id).then(({ data }) => setOrder(data.data)).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="card-vivid max-w-lg mx-auto p-10 text-center">
        <h1 className="text-xl font-bold">Commande introuvable</h1>
        <Link to="/orders" className="btn-vivid inline-block mt-6">← Mes commandes</Link>
      </div>
    );
  }

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
