import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useEffect } from 'react';
import MaterialIcon from '../components/MaterialIcon';
import MobileNav from '../components/MobileNav';
import SearchField from '../components/SearchField';

export default function MainLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLink = (to, label) => {
    const active =
      location.pathname === to ||
      (to === '/shop' && (location.pathname.startsWith('/products') || location.pathname === '/shop')) ||
      (to === '/wishlist' && location.pathname === '/wishlist') ||
      (to === '/orders' && location.pathname.startsWith('/orders')) ||
      (to === '/admin' && location.pathname.startsWith('/admin'));
    return (
      <Link
        to={to}
        className={`text-sm font-semibold transition-colors ${active ? 'text-[#ff4d8d]' : 'text-gray-600 hover:text-[#ff4d8d]'}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/80 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link to="/" className="shrink-0">
              <span className="text-2xl font-extrabold text-[#ff4d8d] tracking-tight">Vivid</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLink('/shop', 'Boutique')}
              {user && navLink('/wishlist', 'Favoris')}
              {user && navLink('/orders', 'Commandes')}
              {isAdmin && navLink('/admin', 'Admin')}
            </nav>

            <SearchField
              className="flex-1 max-w-xl hidden sm:block"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={handleSearch}
            />

            <div className="flex items-center gap-3 sm:gap-4 ml-auto">
              {user && (
                <>
                  <Link to="/wishlist" className="w-10 h-10 rounded-full hover:bg-[#fff0f5] text-gray-600 hover:text-[#ff4d8d] transition-colors hidden sm:flex items-center justify-center">
                    <MaterialIcon name="favorite" size={22} />
                  </Link>
                  <Link to="/cart" className="relative w-10 h-10 rounded-full hover:bg-[#fff0f5] text-gray-600 hover:text-[#ff4d8d] transition-colors flex items-center justify-center">
                    <MaterialIcon name="shopping_bag" size={22} />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-[#ff4d8d] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user ? (
                <>
                <Link to="/profile" className="md:hidden text-xs font-semibold text-gray-700 hover:text-[#ff4d8d] max-w-[72px] truncate">
                  {user.name}
                </Link>
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/profile" className="text-sm font-semibold text-gray-700 hover:text-[#ff4d8d] max-w-[120px] truncate">
                    {user.name}
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 font-medium">
                    Déconnexion
                  </button>
                </div>
                </>
              ) : (
                <Link to="/login" className="btn-vivid text-sm !py-2 !px-5">
                  Connexion
                </Link>
              )}
            </div>
          </div>

          <SearchField
            className="sm:hidden mt-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSubmit={handleSearch}
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 lg:py-10 pb-24 lg:pb-10">
        <Outlet />
      </main>

      <MobileNav />

      <footer className="bg-[#f3f3f5] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <Link to="/" className="inline-block mb-4">
                <span className="text-xl font-extrabold text-[#ff4d8d]">Vivid</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                La nouvelle façon de shopper. Qualité, style et livraison rapide.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Boutique</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/shop" className="hover:text-[#ff4d8d]">Nouveautés</Link></li>
                <li><Link to="/shop?sort=price_desc" className="hover:text-[#ff4d8d]">Best-sellers</Link></li>
                <li><Link to="/shop" className="hover:text-[#ff4d8d]">Promotions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Aide</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="cursor-default">Livraison</span></li>
                <li><span className="cursor-default">Retours</span></li>
                <li><span className="cursor-default">Contact</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Newsletter</h4>
              <p className="text-sm text-gray-500 mb-3">-10% sur votre première commande.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input type="email" placeholder="Votre email" className="input-vivid flex-1 !py-2.5 text-sm" />
                <button type="submit" className="btn-vivid !px-4 !py-2.5 text-sm shrink-0">OK</button>
              </form>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-12 pt-8 border-t border-gray-200">
            © {new Date().getFullYear()} Vivid. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
