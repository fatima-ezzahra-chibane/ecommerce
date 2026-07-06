import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services';
import { useToast } from '../contexts/ToastContext';

export default function CheckoutPage() {
  const [form, setForm] = useState({ shipping_address: '', payment_method: 'card', coupon_code: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.create(form);
      navigate('/orders');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la commande.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Checkout</h1>
      <form onSubmit={submit} className="card-vivid p-8 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse de livraison</label>
          <textarea required rows={3} className="input-vivid !rounded-2xl"
            value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Paiement</label>
          <select className="input-vivid !rounded-2xl" value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
            <option value="card">Carte bancaire</option>
            <option value="paypal">PayPal</option>
            <option value="cash">À la livraison</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Code promo</label>
          <input className="input-vivid !rounded-2xl" placeholder="WELCOME10"
            value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="btn-vivid w-full !py-4">
          {loading ? 'Traitement...' : 'Confirmer la commande'}
        </button>
      </form>
    </div>
  );
}
