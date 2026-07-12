import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { wishlistService } from '../services';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    try {
      const { data } = await wishlistService.list();
      setIds(new Set((data.data || []).map((i) => i.product_id)));
    } catch {
      setIds(new Set());
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (productId) => {
    await wishlistService.add(productId);
    setIds((prev) => new Set([...prev, productId]));
  };

  const remove = async (productId) => {
    await wishlistService.remove(productId);
    setIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const toggle = async (productId) => {
    if (ids.has(productId)) await remove(productId);
    else await add(productId);
  };

  const isWishlisted = (productId) => ids.has(productId);

  return (
    <WishlistContext.Provider value={{ refresh, add, remove, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
