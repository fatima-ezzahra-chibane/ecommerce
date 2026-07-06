import { useEffect, useState } from 'react';
import { adminService } from '../../services';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);

  const load = () => adminService.categories().then(({ data }) => setCategories(data.data || []));

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (form.id) await adminService.updateCategory(form.id, { name: form.name, description: form.description });
    else await adminService.createCategory({ name: form.name, description: form.description });
    setForm(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await adminService.deleteCategory(id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <button onClick={() => setForm({ name: '', description: '' })} className="btn-vivid text-sm">
          + Nouvelle catégorie
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="bg-white p-5 rounded-xl shadow-sm mb-6 flex flex-col gap-3 max-w-md">
          <input placeholder="Nom" required className="border rounded-lg px-3 py-2" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Description" className="border rounded-lg px-3 py-2" value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" className="btn-vivid text-sm">Enregistrer</button>
            <button type="button" onClick={() => setForm(null)} className="border px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{c.products_count ?? 0} produit(s)</p>
            <p className="text-sm text-gray-400 mt-2">{c.description || '—'}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setForm(c)} className="text-sm text-[#ff4d8d]">Modifier</button>
              <button onClick={() => remove(c.id)} className="text-sm text-red-500">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
