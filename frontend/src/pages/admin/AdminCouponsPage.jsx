import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(null);

  const load = () => adminService.coupons().then(({ data }) => setCoupons(data.data || []));

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCoupon({
        ...form,
        discount: parseFloat(form.discount),
        usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
        expiration_date: form.expiration_date || null,
      });
      setForm(null);
      load();
    } catch {
      /* toast via interceptor */
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    try {
      await adminService.deleteCoupon(id);
      load();
    } catch {
      /* toast via interceptor */
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons & Promotions</h1>
        <button onClick={() => setForm({
          code: '', discount: '', type: 'percent', usage_limit: '', min_order_amount: '', expiration_date: '',
        })}
          className="btn-vivid text-sm">+ Nouveau coupon</button>
      </div>

      {form && (
        <form onSubmit={save} className="bg-white p-5 rounded-xl shadow-sm mb-6 grid md:grid-cols-2 gap-4 max-w-2xl">
          <input placeholder="Code (ex: SUMMER20)" required className="border rounded-lg px-3 py-2"
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input placeholder={form.type === 'percent' ? 'Réduction en % (1 à 100)' : 'Réduction en DH'}
            type="number" step="0.01" min="0.01"
            max={form.type === 'percent' ? 100 : undefined} required className="border rounded-lg px-3 py-2"
            value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <select className="border rounded-lg px-3 py-2" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percent">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (DH)</option>
          </select>
          <input placeholder="Limite d'utilisation (vide = illimitée)" type="number" min="1" step="1"
            className="border rounded-lg px-3 py-2"
            value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
          <input placeholder="Montant minimum de commande (DH)" type="number" min="0" step="0.01"
            className="border rounded-lg px-3 py-2"
            value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
          <input type="date" className="border rounded-lg px-3 py-2" value={form.expiration_date}
            onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="btn-vivid text-sm">Créer</button>
            <button type="button" onClick={() => setForm(null)} className="border px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#ff4d8d]">
            <div className="flex justify-between">
              <span className="font-mono font-bold text-lg">{c.code}</span>
              <button onClick={() => remove(c.id)} className="text-red-500 text-sm">Suppr.</button>
            </div>
            <p className="text-[#ff4d8d] mt-1">
              -{c.discount}{c.type === 'percent' ? '%' : ' DH'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Utilisations : {c.used_count ?? 0} / {c.usage_limit ?? '∞'}
              {Number(c.min_order_amount) > 0 && <> — Minimum : {formatPrice(c.min_order_amount)}</>}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Expire : {c.expiration_date ? new Date(c.expiration_date).toLocaleDateString('fr-FR') : 'Jamais'}
              {c.expiration_date && new Date(c.expiration_date) < new Date() && (
                <span className="ml-2 font-semibold text-red-500">Expiré</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
