import { useEffect, useState, useRef } from 'react';
import { adminService, categoryService } from '../../services';
import Pagination from '../../components/Pagination';
import ProductImage from '../../components/ProductImage';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const load = (p = page) => {
    adminService.products({ page: p }).then(({ data }) => {
      setProducts(data.data || []);
      setMeta(data.meta || null);
    });
  };

  useEffect(() => {
    load(page);
    categoryService.list().then(({ data }) => setCategories(data.data));
  }, [page]);

  const emptyForm = () => ({
    category_id: categories[0]?.id || '',
    name: '', description: '', price: '', original_price: '', stock: 0, status: 'active',
    imageFile: null,
  });

  const openForm = (product = null) => {
    if (product) {
      setForm({ ...product, category_id: product.category?.id || product.category_id, original_price: product.original_price || '', imageFile: null });
      setPreview(product.image || '');
    } else {
      setForm(emptyForm());
      setPreview('');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file }));
    setPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { imageFile, image, ...rest } = form;
      const payload = {
        ...rest,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock, 10),
      };
      let productId = form.id;

      if (form.id) {
        await adminService.updateProduct(form.id, payload);
      } else {
        const { data } = await adminService.createProduct(payload);
        productId = data.data.id;
      }

      if (imageFile && productId) {
        await adminService.uploadProductImage(productId, imageFile);
      }

      setForm(null);
      setPreview('');
      load();
    } catch {
      /* toast via interceptor */
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await adminService.deleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Produits</h1>
        <button type="button" onClick={() => openForm()} className="btn-vivid text-sm">
          + Nouveau produit
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="card-vivid p-5 mb-6 grid md:grid-cols-2 gap-4">
          <input placeholder="Nom" required className="input-vivid !rounded-xl" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select required className="input-vivid !rounded-xl" value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Prix (DH)" type="number" step="0.01" required className="input-vivid !rounded-xl"
            value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Ancien prix (DH) — promo" type="number" step="0.01" className="input-vivid !rounded-xl"
            value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
          <input placeholder="Stock" type="number" required className="input-vivid !rounded-xl"
            value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-gray-600 block mb-2">Image produit</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange} className="text-sm w-full" />
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG ou WebP — max 2 Mo. Même rendu que les autres produits.</p>
            </div>
            {preview && (
              <div className="w-28 h-28 rounded-2xl border border-gray-100 flex items-center justify-center p-3 shrink-0 bg-white">
                <ProductImage src={preview} alt="Aperçu" imgClassName="max-h-full max-w-full" />
              </div>
            )}
          </div>
          <textarea placeholder="Description" rows={2} className="input-vivid !rounded-xl md:col-span-2"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="input-vivid !rounded-xl" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-vivid text-sm">
              {loading ? 'Enregistrement...' : form.id ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setForm(null); setPreview(''); }} className="btn-vivid-outline text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden min-w-[640px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Produit</th>
                <th className="text-left p-3">Prix</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Statut</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 flex items-center gap-2">
                    <div className="w-11 h-11 rounded-xl border border-gray-100 flex items-center justify-center p-1 shrink-0 bg-white">
                      <ProductImage src={p.image} alt="" imgClassName="max-h-full max-w-full" />
                    </div>
                    {p.name}
                  </td>
                  <td className="p-3">{formatPrice(p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.status}</span></td>
                  <td className="p-3 text-right space-x-2">
                    <button type="button" onClick={() => openForm(p)} className="text-[#ff4d8d]">Modifier</button>
                    <button type="button" onClick={() => remove(p.id)} className="text-red-500">Suppr.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
