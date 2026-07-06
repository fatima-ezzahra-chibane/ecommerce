import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatPrice } from '../utils/formatPrice';

const STATUS = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800' },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export default function OrderCard({ order, showDetailLink = false }) {
  const st = STATUS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <article className="card-vivid p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <p className="font-bold text-gray-900">Commande</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.created_at).toLocaleString('fr-FR', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="text-xl sm:text-2xl font-extrabold text-[#ff4d8d]">
            {formatPrice(order.total_price)}
          </p>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>
            {st.label}
          </span>
        </div>
      </div>

      {order.shipping_address && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Adresse de livraison</h3>
          <p className="text-sm text-gray-600">{order.shipping_address}</p>
        </div>
      )}

      {order.coupon_code && (
        <p className="text-sm text-green-600">
          Coupon : {order.coupon_code} (−{formatPrice(order.discount)})
        </p>
      )}

      {order.items?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Articles</h3>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 sm:gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0 p-1 bg-white">
                  <ProductImage
                    src={item.product?.image}
                    alt={item.product?.name}
                    imgClassName="w-12 h-12 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">Qté : {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 shrink-0">{formatPrice(item.price)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {order.payment && (
        <p className="text-sm text-gray-500 border-t border-gray-100 pt-4">
          Paiement : {order.payment.payment_method} — {order.payment.status}
        </p>
      )}

      {showDetailLink && (
        <Link
          to={`/orders/${order.id}`}
          className="inline-block text-sm font-semibold text-[#ff4d8d] hover:underline"
        >
          Ouvrir en pleine page →
        </Link>
      )}
    </article>
  );
}
