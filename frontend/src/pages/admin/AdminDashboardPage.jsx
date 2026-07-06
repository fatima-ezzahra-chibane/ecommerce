import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { adminService } from '../../services';
import { formatPrice } from '../../utils/formatPrice';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_LABELS = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_COLORS = ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#f87171'];

const MONTHS = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.dashboard().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <div className="text-center py-20">Chargement...</div>;

  const cards = [
    { label: 'Produits', value: stats.products_count, link: '/admin/products', color: 'bg-blue-50 text-blue-700' },
    { label: 'Clients', value: stats.users_count, link: '/admin/users', color: 'bg-green-50 text-green-700' },
    { label: 'Commandes', value: stats.orders_count, link: '/admin/orders', color: 'bg-purple-50 text-purple-700' },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), link: '/admin/orders', color: 'bg-amber-50 text-amber-700' },
  ];

  const statusEntries = Object.entries(stats.orders_by_status || {});
  const doughnutData = {
    labels: statusEntries.map(([s]) => STATUS_LABELS[s] || s),
    datasets: [{
      data: statusEntries.map(([, c]) => c),
      backgroundColor: STATUS_COLORS,
      borderWidth: 0,
    }],
  };

  const monthly = stats.monthly_sales || [];
  const barData = {
    labels: monthly.map((m) => MONTHS[m.month] || `M${m.month}`),
    datasets: [{
      label: 'Ventes (DH)',
      data: monthly.map((m) => Number(m.total)),
      backgroundColor: '#ff4d8d',
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.link} className={`p-5 rounded-xl ${c.color} hover:opacity-90 transition`}>
            <p className="text-sm opacity-80">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-vivid p-5">
          <h2 className="font-semibold mb-4">Commandes par statut</h2>
          {statusEntries.length ? (
            <div className="h-64">
              <Doughnut data={doughnutData} options={{ ...chartOptions, plugins: { legend: { position: 'right' } } }} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-12 text-center">Aucune commande</p>
          )}
        </div>
        <div className="card-vivid p-5">
          <h2 className="font-semibold mb-4">Ventes mensuelles ({new Date().getFullYear()})</h2>
          {monthly.length ? (
            <div className="h-64">
              <Bar data={barData} options={chartOptions} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-12 text-center">Pas encore de ventes</p>
          )}
        </div>
      </div>
    </div>
  );
}
