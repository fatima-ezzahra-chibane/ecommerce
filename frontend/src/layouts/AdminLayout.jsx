import { Link, Outlet, useLocation } from 'react-router-dom';
import { IconSparkle } from '../components/Icons';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Produits' },
  { to: '/admin/categories', label: 'Catégories' },
  { to: '/admin/orders', label: 'Commandes' },
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/coupons', label: 'Coupons' },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh]">
      <aside className="lg:w-56 shrink-0">
        <div className="card-vivid p-4 sm:p-5 lg:sticky lg:top-28">
          <div className="flex items-center gap-2 mb-4 lg:mb-6">
            <IconSparkle className="w-5 h-5 text-[#ff4d8d]" />
            <span className="font-extrabold text-[#ff4d8d]">Admin</span>
          </div>
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:space-y-1 scrollbar-hide">
            {links.map(({ to, label, end }) => {
              const active = end ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    active ? 'bg-[#ff4d8d] text-white shadow-md shadow-[#ff4d8d]/20' : 'text-gray-600 hover:bg-[#fff0f5] hover:text-[#ff4d8d]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link to="/" className="block mt-6 text-sm text-gray-400 hover:text-[#ff4d8d]">← Boutique</Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
