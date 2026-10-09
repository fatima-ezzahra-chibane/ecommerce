import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div>graphique-statuts</div>,
  Bar: () => <div>graphique-ventes</div>,
}));
vi.mock('../../services', () => ({
  adminService: {
    dashboard: vi.fn(),
    coupons: vi.fn(), createCoupon: vi.fn(() => Promise.resolve()), deleteCoupon: vi.fn(() => Promise.resolve()),
    categories: vi.fn(), createCategory: vi.fn(() => Promise.resolve()),
    updateCategory: vi.fn(() => Promise.resolve()), deleteCategory: vi.fn(() => Promise.resolve()),
    orders: vi.fn(), updateOrderStatus: vi.fn(() => Promise.resolve()),
    users: vi.fn(), toggleUser: vi.fn(() => Promise.resolve()),
    products: vi.fn(), createProduct: vi.fn(), updateProduct: vi.fn(() => Promise.resolve()),
    uploadProductImage: vi.fn(() => Promise.resolve()), deleteProduct: vi.fn(() => Promise.resolve()),
  },
  categoryService: { list: vi.fn() },
}));

import { adminService, categoryService } from '../../services';
import AdminDashboardPage from './AdminDashboardPage';
import AdminCouponsPage from './AdminCouponsPage';
import AdminCategoriesPage from './AdminCategoriesPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminUsersPage from './AdminUsersPage';
import AdminProductsPage from './AdminProductsPage';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('AdminDashboardPage', () => {
  it('affiche les compteurs et les graphiques', async () => {
    adminService.dashboard.mockResolvedValue({ data: { data: {
      products_count: 12, users_count: 3, orders_count: 7, revenue: 1500,
      orders_by_status: { pending: 2, delivered: 5 }, monthly_sales: [{ month: 10, total: 1500 }],
    } } });
    render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>);

    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(screen.getByText('1500.00 DH')).toBeInTheDocument();
    expect(screen.getByText('graphique-statuts')).toBeInTheDocument();
    expect(screen.getByText('graphique-ventes')).toBeInTheDocument();
  });
});

describe('AdminCouponsPage', () => {
  it('affiche utilisations et minimum, adapte le champ réduction et envoie les règles', async () => {
    adminService.coupons.mockResolvedValue({ data: { data: [
      { id: 1, code: 'WELCOME10', discount: 10, type: 'percent', used_count: 2, usage_limit: 5, min_order_amount: '200.00', expiration_date: null },
    ] } });
    const user = userEvent.setup();
    render(<AdminCouponsPage />);

    expect(await screen.findByText('WELCOME10')).toBeInTheDocument();
    expect(screen.getByText(/Utilisations : 2 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText(/Minimum : 200.00 DH/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /nouveau coupon/i }));
    expect(screen.getByPlaceholderText('Réduction en % (1 à 100)')).toHaveAttribute('max', '100');

    await user.selectOptions(screen.getByRole('combobox'), 'fixed');
    const discount = screen.getByPlaceholderText('Réduction en DH');
    expect(discount).not.toHaveAttribute('max');

    await user.type(screen.getByPlaceholderText(/Code/), 'vip');
    await user.type(discount, '50');
    await user.type(screen.getByPlaceholderText(/Limite d'utilisation/), '100');
    await user.type(screen.getByPlaceholderText(/Montant minimum/), '300');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() => expect(adminService.createCoupon).toHaveBeenCalledWith({
      code: 'VIP', discount: 50, type: 'fixed', usage_limit: 100, min_order_amount: 300, expiration_date: null,
    }));
  });

  it('supprime un coupon après confirmation', async () => {
    adminService.coupons.mockResolvedValue({ data: { data: [
      { id: 4, code: 'OLD', discount: 5, type: 'fixed', used_count: 0, usage_limit: null, min_order_amount: '0.00' },
    ] } });
    const user = userEvent.setup();
    render(<AdminCouponsPage />);

    expect(await screen.findByText(/Utilisations : 0 \/ ∞/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Suppr.' }));
    expect(adminService.deleteCoupon).toHaveBeenCalledWith(4);
  });
});

describe('AdminCategoriesPage', () => {
  it('crée, modifie et supprime une catégorie', async () => {
    adminService.categories.mockResolvedValue({ data: { data: [
      { id: 2, name: 'Mode', description: 'Vêtements', products_count: 4 },
    ] } });
    const user = userEvent.setup();
    render(<AdminCategoriesPage />);

    expect(await screen.findByText('4 produit(s)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /nouvelle catégorie/i }));
    await user.type(screen.getByPlaceholderText('Nom'), 'Maison');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(adminService.createCategory).toHaveBeenCalledWith({ name: 'Maison', description: '' });

    await user.click(await screen.findByRole('button', { name: 'Modifier' }));
    await user.clear(screen.getByPlaceholderText('Nom'));
    await user.type(screen.getByPlaceholderText('Nom'), 'Mode Femme');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(adminService.updateCategory).toHaveBeenCalledWith(2, { name: 'Mode Femme', description: 'Vêtements' });

    await user.click(await screen.findByRole('button', { name: 'Supprimer' }));
    expect(adminService.deleteCategory).toHaveBeenCalledWith(2);
  });
});

describe('AdminOrdersPage', () => {
  it('liste les commandes avec le nom figé du produit et change le statut', async () => {
    adminService.orders.mockResolvedValue({ data: { data: [{
      id: 3, status: 'pending', total_price: 100, created_at: '2026-10-09T10:00:00Z', shipping_address: 'Rabat',
      items: [{ id: 1, quantity: 2, price: 50, product_name: 'Robe', product: { name: 'Robe renommée' } }],
    }], meta: { current_page: 1, last_page: 1 } } });
    const user = userEvent.setup();
    render(<AdminOrdersPage />);

    expect(await screen.findByText('Commande #3')).toBeInTheDocument();
    expect(screen.getByText(/×2 Robe —/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), 'shipped');
    expect(adminService.updateOrderStatus).toHaveBeenCalledWith(3, 'shipped');
  });
});

describe('AdminUsersPage', () => {
  it('active/désactive un client mais pas un admin', async () => {
    adminService.users.mockResolvedValue({ data: { data: [
      { id: 1, name: 'Admin', email: 'a@shop.com', role: 'admin', is_active: true },
      { id: 2, name: 'Client', email: 'c@shop.com', role: 'user', is_active: true },
    ], meta: null } });
    const user = userEvent.setup();
    render(<AdminUsersPage />);

    const clientRow = (await screen.findByText('c@shop.com')).closest('tr');
    const adminRow = screen.getByText('a@shop.com').closest('tr');
    expect(within(adminRow).queryByRole('button')).not.toBeInTheDocument();

    await user.click(within(clientRow).getByRole('button', { name: 'Désactiver' }));
    expect(adminService.toggleUser).toHaveBeenCalledWith(2);
  });
});

describe('AdminProductsPage', () => {
  const p = { id: 7, name: 'Lampe', price: 250, original_price: null, stock: 3, status: 'active', image: null, category: { id: 1 } };

  beforeEach(() => {
    adminService.products.mockResolvedValue({ data: { data: [p], meta: null } });
    categoryService.list.mockResolvedValue({ data: { data: [{ id: 1, name: 'Maison' }] } });
  });

  it('crée un produit puis téléverse son image', async () => {
    adminService.createProduct.mockResolvedValue({ data: { data: { id: 99 } } });
    const user = userEvent.setup();
    const { container } = render(<AdminProductsPage />);

    await screen.findByText('Lampe');
    await user.click(screen.getByRole('button', { name: /nouveau produit/i }));
    await user.type(screen.getByPlaceholderText('Nom'), 'Chaise');
    await user.type(screen.getByPlaceholderText('Prix (DH)'), '120');
    await user.clear(screen.getByPlaceholderText('Stock'));
    await user.type(screen.getByPlaceholderText('Stock'), '5');
    const file = new File(['x'], 'chaise.png', { type: 'image/png' });
    await user.upload(container.querySelector('input[type="file"]'), file);
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    await waitFor(() => expect(adminService.uploadProductImage).toHaveBeenCalledWith(99, file));
    expect(adminService.createProduct).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Chaise', price: 120, stock: 5, category_id: 1, status: 'active', original_price: null,
    }));
  });

  it('modifie et supprime (ou désactive) un produit', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPage />);

    await user.click(await screen.findByRole('button', { name: 'Modifier' }));
    await user.clear(screen.getByPlaceholderText('Prix (DH)'));
    await user.type(screen.getByPlaceholderText('Prix (DH)'), '199');
    await user.click(screen.getByRole('button', { name: 'Mettre à jour' }));
    await waitFor(() => expect(adminService.updateProduct).toHaveBeenCalledWith(7, expect.objectContaining({ price: 199 })));

    await user.click(screen.getByRole('button', { name: 'Suppr.' }));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('désactivé'));
    expect(adminService.deleteProduct).toHaveBeenCalledWith(7);
  });
});
