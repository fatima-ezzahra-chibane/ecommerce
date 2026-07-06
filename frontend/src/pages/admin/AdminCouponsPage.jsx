import { useEffect, useState } from 'react';
import { adminService } from '../../services';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(null);

  const load = () => adminService.coupons().then(({ data }) => setCoupons(data.data || []));

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await adminService.createCoupon({
      ...form,
      discount: parseFloat(form.discount),
      expiration_date: form.expiration_date || null,
    });
    setForm(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    await adminService.deleteCoupon(id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons & Promotions</h1>
        <button onClick={() => setForm({ code: '', discount: '', type: 'percent', expiration_date: '' })}
          className="btn-vivid text-sm">+ Nouveau coupon</button>
      </div>

      {form && (
        <form onSubmit={save} className="bg-white p-5 rounded-xl shadow-sm mb-6 grid md:grid-cols-2 gap-4 max-w-2xl">
          <input placeholder="Code (ex: SUMMER20)" required className="border rounded-lg px-3 py-2"
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <input placeholder="Réduction" type="number" step="0.01" required className="border rounded-lg px-3 py-2"
            value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <select className="border rounded-lg px-3 py-2" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percent">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (DH)</option>
          </select>
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
            <p className="text-xs text-gray-400 mt-2">
              Expire : {c.expiration_date ? new Date(c.expiration_date).toLocaleDateString('fr-FR') : 'Jamais'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
