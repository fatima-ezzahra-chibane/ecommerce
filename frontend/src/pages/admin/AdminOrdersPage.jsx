import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { formatPrice } from '../../utils/formatPrice';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const LABELS = { pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  const load = () => adminService.orders().then(({ data }) => setOrders(data.data || []));

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    await adminService.updateOrderStatus(id, status);
    load();
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
                className="border rounded-lg px-2 py-1 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
              </select>
            </div>
            {order.items?.length > 0 && (
              <ul className="mt-3 text-sm text-gray-600 border-t pt-3">
                {order.items.map((item) => (
                  <li key={item.id}>×{item.quantity} {item.product?.name} — {formatPrice(item.price)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {!orders.length && <p className="text-gray-500">Aucune commande.</p>}
      </div>
    </div>
  );
}
