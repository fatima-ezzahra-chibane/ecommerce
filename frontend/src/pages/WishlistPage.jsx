import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../services';
import ProductCard from '../components/ProductCard';
import PageHeader from '../components/PageHeader';
import { useCart } from '../contexts/CartContext';
import MaterialIcon from '../components/MaterialIcon';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const load = () => {
    setLoading(true);
    wishlistService
      .list()
      .then(({ data }) => setItems((data.data || []).filter((i) => i.product)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (productId) => {
    await wishlistService.remove(productId);
    load();
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Favoris" subtitle="Chargement..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card-vivid h-80 animate-pulse bg-gray-100 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Favoris" subtitle={`${items.length} produit(s) sauvegardé(s)`} />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {items.map((item, i) => (
            <ProductCard
              key={item.id}
              product={item.product}
              onAddCart={addToCart}
              onAddWishlist={() => remove(item.product_id)}
            />
          ))}
        </div>
      ) : (
        <div className="card-vivid p-10 sm:p-16 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#fff0f5] flex items-center justify-center">
            <MaterialIcon name="favorite" size={32} className="!text-[#ff4d8d]" />
          </div>
          <h2 className="text-xl font-bold mt-6 text-gray-900">Aucun favori</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter ici.
          </p>
          <Link to="/shop" className="btn-vivid inline-block mt-6">
            Parcourir la boutique
          </Link>
        </div>
      )}
    </div>
  );
}
