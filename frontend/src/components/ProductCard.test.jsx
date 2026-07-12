import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

const product = {
  id: 1,
  name: 'Casque Bluetooth',
  price: 299.99,
  image: 'https://picsum.photos/seed/test/400/400',
  average_rating: 4.5,
};

describe('ProductCard', () => {
  it('affiche le nom et le prix du produit', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );

    expect(screen.getByText('Casque Bluetooth')).toBeInTheDocument();
    expect(screen.getByText('299.99 DH')).toBeInTheDocument();
  });

  it('appelle onAddCart au clic sur le bouton panier', async () => {
    const onAddCart = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductCard product={product} onAddCart={onAddCart} />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText('Ajouter au panier'));
    expect(onAddCart).toHaveBeenCalledWith(1);
  });

  it('appelle onAddWishlist au clic sur favoris', async () => {
    const onAddWishlist = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductCard product={product} onAddWishlist={onAddWishlist} />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText('Ajouter aux favoris'));
    expect(onAddWishlist).toHaveBeenCalledWith(1);
  });
});
