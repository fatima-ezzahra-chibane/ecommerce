import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { productService, categoryService, wishlistService } from '../services';
import ImageSearch from '../components/ImageSearch';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const load = () => {
    productService.list({ search, category_id: categoryId, sort, page, per_page: 12 }).then(({ data }) => {
      setProducts(data.data || []);
      setMeta(data.meta || null);
    });
  };

  useEffect(() => { categoryService.list().then(({ data }) => setCategories(data.data)); }, []);
  useEffect(() => { load(); }, [search, categoryId, sort, page]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addWishlist = async (id) => {
    if (!user) {
      showToast('Connectez-vous pour ajouter aux favoris', 'error');
      return;
    }
    await wishlistService.add(id);
  };

  const title = search ? `Résultats : « ${search} »` : 'Boutique';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#475569] tracking-tight">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">Tous nos produits</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setFilter('sort', e.target.value)}
          className="bg-white border border-gray-100 rounded-full px-5 py-2.5 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[#ff4d8d]/25 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <option value="latest">Nouveautés</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="name">Nom A-Z</option>
        </select>
        <ImageSearch />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <button
          type="button"
          onClick={() => setFilter('category_id', '')}
          className={`pill-vivid ${!categoryId ? 'pill-vivid-active' : 'pill-vivid-inactive'}`}
        >
          Tout
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter('category_id', String(c.id))}
            className={`pill-vivid ${categoryId === String(c.id) ? 'pill-vivid-active' : 'pill-vivid-inactive'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAddCart={addToCart} onAddWishlist={addWishlist} />
        ))}
      </div>

      {!products.length && (
        <div className="text-center py-20 bg-white rounded-[1.75rem] border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">Aucun produit trouvé.</p>
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
