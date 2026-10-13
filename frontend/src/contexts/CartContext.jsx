import { createContext, useContext, useState, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import { notifyToast } from '../utils/toastBus';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const { data } = await cartService.get();
      setCart(data.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Retourne true si l'article a été ajouté ; les erreurs API (stock, produit indisponible) sont affichées en toast. */
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      notifyToast('Connectez-vous pour ajouter au panier', 'error');
      return false;
    }
    try {
      await cartService.add(productId, quantity);
    } catch {
      return false;
    }
    await refresh();
    return true;
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addToCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
