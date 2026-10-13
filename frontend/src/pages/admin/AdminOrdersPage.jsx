import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { formatPrice } from '../../utils/formatPrice';
import Pagination from '../../components/Pagination';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const LABELS = { pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
// Statuts définitifs côté API : une commande livrée ou annulée ne change plus
const FINAL = ['delivered', 'cancelled'];
const PAYMENT_METHODS = { card: 'Carte', paypal: 'PayPal', cash: 'Espèces à la livraison' };
const PAYMENT_STATUS = { pending: 'En attente', completed: 'Encaissé', failed: 'Non abouti', refunded: 'Remboursé' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const load = (p = page) => {
    adminService.orders({ page: p }).then(({ data }) => {
      setOrders(data.data || []);
      setMeta(data.meta || null);
    });
  };

  useEffect(() => { load(page); }, [page]);

  const changeStatus = async (id, status) => {
    if (status === 'cancelled'
      && !confirm('Annuler cette commande ?\nLe stock sera restitué et le paiement remboursé. Action définitive.')) return;
    try {
      await adminService.updateOrderStatus(id, status);
    } finally {
      load(page);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commandes</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex flex-wrap justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold">Commande #{order.id}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <p className="text-lg font-bold text-[#ff4d8d]">{formatPrice(order.total_price)}</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">{order.shipping_address}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm">Statut :</span>
              <select value={order.status} onChange={(e) => changeStatus(order.id, e.target.value)}
                disabled={FINAL.includes(order.status)}
                className="border rounded-lg px-2 py-1 text-sm disabled:bg-gray-50 disabled:text-gray-500">
                {STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
              </select>
              {order.payment && (
                <span className="text-xs text-gray-500">
                  Paiement : {PAYMENT_METHODS[order.payment.payment_method] || order.payment.payment_method}
                  {' — '}{PAYMENT_STATUS[order.payment.status] || order.payment.status}
                </span>
              )}
            </div>
            {order.items?.length > 0 && (
              <ul className="mt-3 text-sm text-gray-600 border-t pt-3">
                {order.items.map((item) => (
                  <li key={item.id}>×{item.quantity} {item.product_name || item.product?.name} — {formatPrice(item.price)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {!orders.length && <p className="text-gray-500">Aucune commande.</p>}
      </div>
      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
