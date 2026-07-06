import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { cartService } from '../services';
import MaterialIcon from '../components/MaterialIcon';
import ProductImage from '../components/ProductImage';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {
  const { cart, refresh } = useCart();

  useEffect(() => { refresh(); }, [refresh]);

  const updateQty = async (itemId, qty) => {
    await cartService.update(itemId, qty);
    refresh();
  };

  const remove = async (itemId) => {
    await cartService.remove(itemId);
    refresh();
  };

  const total = cart?.items?.reduce((s, i) => s + i.product.price * i.quantity, 0) ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Mon panier</h1>

      {!cart?.items?.length ? (
        <div className="card-vivid p-12 text-center">
          <div className="w-16 h-16 bg-[#fff0f5] rounded-full flex items-center justify-center mx-auto">
            <MaterialIcon name="shopping_bag" size={32} className="!text-[#ff4d8d]" />
          </div>
          <p className="text-gray-500 mt-4">Votre panier est vide.</p>
          <Link to="/shop" className="btn-vivid inline-block mt-6">Continuer vos achats</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item, i) => (
              <div key={item.id} className="card-vivid p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0 p-2 bg-white">
                  <ProductImage src={item.product.image} alt={item.product.name} imgClassName="max-h-full max-w-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{item.product.name}</h3>
                  <p className="text-[#ff4d8d] font-bold mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <input type="number" min="1" value={item.quantity}
                  onChange={(e) => updateQty(item.id, +e.target.value)}
                  className="w-14 text-center border-0 bg-[#f5f5f7] rounded-full py-2 text-sm" />
                <button type="button" onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-500 p-2">✕</button>
              </div>
            ))}
          </div>
          <div className="card-vivid p-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-2xl font-extrabold">Total : {formatPrice(total)}</p>
            <Link to="/checkout" className="btn-vivid !px-8">Commander</Link>
          </div>
        </>
      )}
    </div>
  );
}
