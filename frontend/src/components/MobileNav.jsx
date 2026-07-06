import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const links = [
  { to: '/', label: 'Accueil', icon: 'home' },
  { to: '/shop', label: 'Shop', icon: 'storefront' },
  { to: '/wishlist', label: 'Favoris', icon: 'favorite', auth: true },
  { to: '/cart', label: 'Panier', icon: 'shopping_bag', auth: true },
  { to: '/profile', label: 'Profil', icon: 'person', auth: true },
  { to: '/login', label: 'Connexion', icon: 'login', guest: true },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { itemCount } = useCart();

  if (pathname.startsWith('/admin')) return null;

  const visible = links.filter((l) => {
    if (l.guest) return !user;
    if (l.auth) return !!user;
    return true;
  });

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 safe-area-pb shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div className="flex justify-around items-center h-16 px-2">
        {visible.map(({ to, label, icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 text-[10px] font-semibold transition-colors ${
                active ? 'text-[#ff4d8d]' : 'text-gray-400'
              }`}
            >
              {icon === 'shopping_bag' ? (
                <span className="relative">
                  <MaterialIcon name={icon} size={24} className={active ? '!text-[#ff4d8d]' : '!text-gray-400'} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 bg-[#ff4d8d] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </span>
              ) : (
                <MaterialIcon name={icon} size={24} className={active ? '!text-[#ff4d8d]' : '!text-gray-400'} filled={icon === 'favorite' && active} />
              )}
              <span className="mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
