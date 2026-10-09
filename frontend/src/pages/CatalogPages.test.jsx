import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockAddToCart = vi.fn();
const mockShowToast = vi.fn();
let mockUser = null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../contexts/CartContext', () => ({ useCart: () => ({ addToCart: mockAddToCart }) }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: mockUser }) }));
vi.mock('../contexts/ToastContext', () => ({ useToast: () => ({ showToast: mockShowToast }) }));
vi.mock('../services', () => ({
  productService: { get: vi.fn(), list: vi.fn() },
  reviewService: { list: vi.fn(), create: vi.fn(() => Promise.resolve()) },
  aiService: { productRecommendations: vi.fn(), searchImage: vi.fn() },
  categoryService: { list: vi.fn() },
  wishlistService: { add: vi.fn(() => Promise.resolve()) },
}));

import { productService, reviewService, aiService, categoryService, wishlistService } from '../services';
import ProductDetailPage from './ProductDetailPage';
import ShopPage from './ShopPage';
import ImageSearch from '../components/ImageSearch';
import OrderCard from '../components/OrderCard';

const product = {
  id: 5, name: 'Robe Été', price: 80, original_price: 100, stock: 4,
  description: 'Légère', average_rating: 4, image: null, category: { name: 'Mode' },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
  productService.get.mockResolvedValue({ data: { data: product } });
  reviewService.list.mockResolvedValue({ data: { data: [
    { id: 1, rating: 5, comment: 'Superbe', user: { name: 'Sara' }, image: null },
  ] } });
  aiService.productRecommendations.mockResolvedValue({ data: { data: [
    { id: 6, name: 'Sac Plage', price: 120, image: null },
  ] } });
  productService.list.mockResolvedValue({ data: { data: [product], meta: { current_page: 1, last_page: 1 } } });
  categoryService.list.mockResolvedValue({ data: { data: [{ id: 3, name: 'Mode' }] } });
});

const renderDetail = () => render(
  <MemoryRouter initialEntries={['/products/5']}>
    <Routes><Route path="/products/:id" element={<ProductDetailPage />} /></Routes>
  </MemoryRouter>
);

describe('ProductDetailPage', () => {
  it('affiche produit, promo, avis et recommandations', async () => {
    renderDetail();

    expect(await screen.findByRole('heading', { name: 'Robe Été' })).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
    expect(screen.getByText('100.00 DH')).toBeInTheDocument();
    expect(screen.getByText('Avis clients (1)')).toBeInTheDocument();
    expect(screen.getByText('Superbe')).toBeInTheDocument();
    expect(await screen.findByText('Sac Plage')).toBeInTheDocument();
    expect(aiService.productRecommendations).toHaveBeenCalledWith('5');
  });

  it('ajoute au panier', async () => {
    const user = userEvent.setup();
    renderDetail();
    await screen.findByRole('heading', { name: 'Robe Été' });
    const [mainButton, relatedButton] = await screen.findAllByRole('button', { name: /^ajouter au panier$/i });
    await user.click(mainButton);
    expect(mockAddToCart).toHaveBeenCalledWith(5);
    await user.click(relatedButton);
    expect(mockAddToCart).toHaveBeenCalledWith(6);
  });

  it('cache le formulaire d’avis pour un visiteur', async () => {
    renderDetail();
    await screen.findByRole('heading', { name: 'Robe Été' });
    expect(screen.queryByPlaceholderText('Votre avis...')).not.toBeInTheDocument();
  });

  it('publie un avis quand l’utilisateur est connecté', async () => {
    mockUser = { id: 1 };
    const user = userEvent.setup();
    renderDetail();

    await user.selectOptions(await screen.findByRole('combobox'), '4');
    await user.type(screen.getByPlaceholderText('Votre avis...'), 'Très bien');
    await user.click(screen.getByRole('button', { name: /publier l'avis/i }));

    await waitFor(() => expect(reviewService.create).toHaveBeenCalledWith('5', {
      rating: 4, comment: 'Très bien', imageFile: null,
    }));
    await waitFor(() => expect(reviewService.list).toHaveBeenCalledTimes(2));
  });
});

describe('ShopPage', () => {
  it('charge les produits avec les filtres de l’URL', async () => {
    render(
      <MemoryRouter initialEntries={['/shop?search=robe&category_id=3&sort=price_asc']}>
        <Routes><Route path="/shop" element={<ShopPage />} /></Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Robe Été')).toBeInTheDocument();
    expect(screen.getByText('Résultats : « robe »')).toBeInTheDocument();
    expect(productService.list).toHaveBeenCalledWith({
      search: 'robe', category_id: '3', sort: 'price_asc', page: 1, per_page: 12,
    });
  });

  it('change de tri et de catégorie', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <Routes><Route path="/shop" element={<ShopPage />} /></Routes>
      </MemoryRouter>
    );

    await screen.findByText('Robe Été');
    await user.selectOptions(screen.getByRole('combobox'), 'price_desc');
    await waitFor(() => expect(productService.list).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'price_desc' })));

    await user.click(await screen.findByRole('button', { name: 'Mode' }));
    await waitFor(() => expect(productService.list).toHaveBeenLastCalledWith(expect.objectContaining({ category_id: '3' })));
  });

  it('demande la connexion pour les favoris, sinon ajoute', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<MemoryRouter><ShopPage /></MemoryRouter>);
    await user.click(await screen.findByRole('button', { name: 'Ajouter aux favoris' }));
    expect(mockShowToast).toHaveBeenCalledWith('Connectez-vous pour ajouter aux favoris', 'error');
    expect(wishlistService.add).not.toHaveBeenCalled();
    unmount();

    mockUser = { id: 1 };
    render(<MemoryRouter><ShopPage /></MemoryRouter>);
    await user.click(await screen.findByRole('button', { name: 'Ajouter aux favoris' }));
    expect(wishlistService.add).toHaveBeenCalledWith(5);
  });
});

describe('ImageSearch (computer vision)', () => {
  const pick = async () => {
    const user = userEvent.setup();
    const { container } = render(<MemoryRouter><ImageSearch /></MemoryRouter>);
    await user.upload(container.querySelector('input[type="file"]'), new File(['x'], 'p.png', { type: 'image/png' }));
  };

  it('ouvre le produit identique trouvé', async () => {
    aiService.searchImage.mockResolvedValue({ data: { data: { products: [{ id: 9 }], confidence: 0.93 } } });
    await pick();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/products/9'));
    expect(mockShowToast).toHaveBeenCalledWith('Produit identique trouvé (confiance 93 %)', 'success');
  });

  it('signale l’absence de produit identique', async () => {
    aiService.searchImage.mockResolvedValue({ data: { data: { products: [] } } });
    await pick();
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith(
      'Aucun produit identique à cette photo dans notre catalogue.', 'error'
    ));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('signale un service indisponible', async () => {
    aiService.searchImage.mockRejectedValue({});
    await pick();
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('Service computer vision indisponible.', 'error'));
  });
});

describe('OrderCard', () => {
  it('affiche le nom du produit au moment de l’achat et le coupon', () => {
    render(
      <MemoryRouter>
        <OrderCard order={{
          id: 1, status: 'shipped', total_price: 90, created_at: '2026-10-09T10:00:00Z',
          shipping_address: '12 rue Test', coupon_code: 'WELCOME10', discount: 10,
          items: [{ id: 1, quantity: 1, price: 100, product_name: 'Ancien nom', product: { name: 'Nouveau nom' } }],
          payment: { payment_method: 'card', status: 'completed' },
        }} showDetailLink />
      </MemoryRouter>
    );

    expect(screen.getByText('Ancien nom')).toBeInTheDocument();
    expect(screen.queryByText('Nouveau nom')).not.toBeInTheDocument();
    expect(screen.getByText('Expédiée')).toBeInTheDocument();
    expect(screen.getByText(/WELCOME10/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ouvrir en pleine page/i })).toHaveAttribute('href', '/orders/1');
  });
});
