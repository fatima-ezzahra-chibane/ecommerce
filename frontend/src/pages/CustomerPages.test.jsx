import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockRefresh = vi.fn();
const mockAddToCart = vi.fn();
const mockRegister = vi.fn();
const mockRefreshUser = vi.fn();
const mockShowToast = vi.fn();
let mockCart = null;
let mockUser = null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('../contexts/CartContext', () => ({
  useCart: () => ({ cart: mockCart, refresh: mockRefresh, addToCart: mockAddToCart }),
}));
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, register: mockRegister, refreshUser: mockRefreshUser }),
}));
vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
vi.mock('../services', () => ({
  cartService: { update: vi.fn(() => Promise.resolve()), remove: vi.fn(() => Promise.resolve()) },
  orderService: { create: vi.fn(() => Promise.resolve({ data: {} })) },
  authService: { forgotPassword: vi.fn(), resetPassword: vi.fn(() => Promise.resolve()) },
  profileService: { update: vi.fn(), updatePassword: vi.fn() },
  wishlistService: { list: vi.fn(), remove: vi.fn(() => Promise.resolve()) },
}));

import { cartService, orderService, authService, profileService, wishlistService } from '../services';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import ProfilePage from './ProfilePage';
import WishlistPage from './WishlistPage';

const product = (id, name, price) => ({ id, name, price, image: null, category: { name: 'Mode' } });

beforeEach(() => {
  vi.clearAllMocks();
  mockCart = null;
  mockUser = { id: 1, name: 'Fatima', email: 'f@test.com', phone: '' };
});

describe('CartPage', () => {
  it('affiche le panier vide', () => {
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    expect(screen.getByText('Votre panier est vide.')).toBeInTheDocument();
  });

  it('affiche les articles et le total, modifie et supprime une ligne', async () => {
    mockCart = { items: [
      { id: 10, quantity: 2, product: product(1, 'Robe', 100) },
      { id: 11, quantity: 1, product: product(2, 'Sac', 50) },
    ] };
    const user = userEvent.setup();
    render(<MemoryRouter><CartPage /></MemoryRouter>);

    expect(screen.getByText('Robe')).toBeInTheDocument();
    expect(screen.getByText('Total : 250.00 DH')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Commander' })).toHaveAttribute('href', '/checkout');

    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '3' } });
    await waitFor(() => expect(cartService.update).toHaveBeenCalledWith(10, 3));

    await user.click(screen.getAllByRole('button', { name: '✕' })[1]);
    expect(cartService.remove).toHaveBeenCalledWith(11);
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });
});

describe('CheckoutPage', () => {
  it('envoie adresse, paiement et code promo, rafraîchit le panier puis redirige', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    await user.type(screen.getAllByRole('textbox')[0], '12 rue Test');
    await user.selectOptions(screen.getByRole('combobox'), 'cash');
    await user.type(screen.getByPlaceholderText('WELCOME10'), 'WELCOME10');
    await user.click(screen.getByRole('button', { name: /confirmer la commande/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/orders'));
    expect(orderService.create).toHaveBeenCalledWith({
      shipping_address: '12 rue Test', payment_method: 'cash', coupon_code: 'WELCOME10',
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('reste sur la page si la commande est refusée', async () => {
    orderService.create.mockRejectedValueOnce({ response: { data: { message: 'Ce code promo a expiré.' } } });
    const user = userEvent.setup();
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    await user.type(screen.getAllByRole('textbox')[0], '12 rue Test');
    await user.click(screen.getByRole('button', { name: /confirmer la commande/i }));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('Ce code promo a expiré.', 'error'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('RegisterPage', () => {
  it('crée le compte puis redirige vers /shop', async () => {
    mockRegister.mockResolvedValue({});
    const user = userEvent.setup();
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    await user.type(screen.getByPlaceholderText('Nom'), 'Fatima');
    await user.type(screen.getByPlaceholderText('Email'), 'f@test.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'password1');
    await user.type(screen.getByPlaceholderText('Confirmer'), 'password1');
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/shop'));
    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Fatima', email: 'f@test.com', password: 'password1', password_confirmation: 'password1',
    });
  });

  it('ne redirige pas si l’inscription échoue', async () => {
    mockRegister.mockRejectedValue(new Error('422'));
    const user = userEvent.setup();
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    await user.type(screen.getByPlaceholderText('Nom'), 'F');
    await user.type(screen.getByPlaceholderText('Email'), 'f@test.com');
    await user.type(screen.getByPlaceholderText('Mot de passe'), 'x');
    await user.type(screen.getByPlaceholderText('Confirmer'), 'x');
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('Mot de passe oublié / réinitialisation', () => {
  it('affiche le lien de réinitialisation renvoyé en mode dev', async () => {
    authService.forgotPassword.mockResolvedValue({ data: { reset_url: 'http://localhost:5173/reset-password?token=abc' } });
    const user = userEvent.setup();
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);

    await user.type(screen.getByPlaceholderText('Email'), 'f@test.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    expect(await screen.findByText('http://localhost:5173/reset-password?token=abc')).toBeInTheDocument();
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'f@test.com' });
  });

  it('pré-remplit email/token depuis l’URL et réinitialise', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc&email=f%40test.com']}>
        <Routes><Route path="/reset-password" element={<ResetPasswordPage />} /></Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toHaveValue('f@test.com');
    await user.type(screen.getByPlaceholderText(/nouveau mot de passe/i), 'nouveauMDP1');
    await user.type(screen.getByPlaceholderText(/confirmer le mot de passe/i), 'nouveauMDP1');
    await user.click(screen.getByRole('button', { name: /réinitialiser/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    expect(authService.resetPassword).toHaveBeenCalledWith({
      email: 'f@test.com', token: 'abc', password: 'nouveauMDP1', password_confirmation: 'nouveauMDP1',
    });
  });
});

describe('ProfilePage', () => {
  it('met à jour le profil', async () => {
    profileService.update.mockResolvedValue({ data: { message: 'Profil mis à jour.' } });
    const user = userEvent.setup();
    render(<ProfilePage />);

    expect(screen.getByText('f@test.com')).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText('Nom'));
    await user.type(screen.getByPlaceholderText('Nom'), 'Fatima C');
    await user.type(screen.getByPlaceholderText('Téléphone'), '0600');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Profil mis à jour.')).toBeInTheDocument();
    expect(profileService.update).toHaveBeenCalledWith({ name: 'Fatima C', phone: '0600' });
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('affiche l’erreur si le mot de passe actuel est faux', async () => {
    profileService.updatePassword.mockRejectedValue({ response: { data: { message: 'Mot de passe actuel incorrect.' } } });
    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.type(screen.getByPlaceholderText('Actuel'), 'faux');
    await user.type(screen.getByPlaceholderText('Nouveau'), 'nouveauMDP1');
    await user.type(screen.getAllByPlaceholderText('Confirmer')[0], 'nouveauMDP1');
    await user.click(screen.getByRole('button', { name: /modifier le mot de passe/i }));

    expect(await screen.findByText('Mot de passe actuel incorrect.')).toBeInTheDocument();
  });
});

describe('WishlistPage', () => {
  it('liste les favoris et retire un produit', async () => {
    wishlistService.list.mockResolvedValue({ data: { data: [
      { id: 1, product_id: 7, product: product(7, 'Montre', 300) },
      { id: 2, product_id: 8, product: null },
    ] } });
    const user = userEvent.setup();
    render(<MemoryRouter><WishlistPage /></MemoryRouter>);

    expect(await screen.findByText('Montre')).toBeInTheDocument();
    expect(screen.getByText('1 produit(s) sauvegardé(s)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retirer des favoris|favoris/i }));
    expect(wishlistService.remove).toHaveBeenCalledWith(7);
  });

  it('affiche l’état vide', async () => {
    wishlistService.list.mockResolvedValue({ data: { data: [] } });
    render(<MemoryRouter><WishlistPage /></MemoryRouter>);
    expect(await screen.findByText('Aucun favori')).toBeInTheDocument();
  });
});
