import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('affiche le chargement', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenu protege</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('redirige vers /login si non connecte', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<ProtectedRoute><div>Panier</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Page login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Page login')).toBeInTheDocument();
  });

  it('affiche le contenu si connecte', () => {
    useAuth.mockReturnValue({
      user: { id: 1, role: 'user' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenu protege</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenu protege')).toBeInTheDocument();
  });

  it('refuse l acces admin a un client', () => {
    useAuth.mockReturnValue({
      user: { id: 1, role: 'user' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Accueil</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Admin</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Accueil')).toBeInTheDocument();
  });
});
