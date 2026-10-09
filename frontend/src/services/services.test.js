import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({})),
    post: vi.fn(() => Promise.resolve({})),
    put: vi.fn(() => Promise.resolve({})),
    patch: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

import api from './api';
import {
  authService, profileService, productService, reviewService, categoryService,
  cartService, wishlistService, orderService, aiService, adminService,
} from './index';

// Contrat : chaque fonction appelle une route existante de backend/routes/api.php
describe('services — contrat avec l’API Laravel', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    [() => authService.register({ a: 1 }), 'post', '/register', { a: 1 }],
    [() => authService.login({ a: 1 }), 'post', '/login', { a: 1 }],
    [() => authService.logout(), 'post', '/logout'],
    [() => authService.me(), 'get', '/me'],
    [() => authService.forgotPassword({ email: 'x' }), 'post', '/forgot-password', { email: 'x' }],
    [() => authService.resetPassword({ token: 't' }), 'post', '/reset-password', { token: 't' }],
    [() => profileService.update({ name: 'n' }), 'put', '/profile', { name: 'n' }],
    [() => profileService.updatePassword({ p: 1 }), 'put', '/profile/password', { p: 1 }],
    [() => productService.get(5), 'get', '/products/5'],
    [() => reviewService.list(5), 'get', '/products/5/reviews'],
    [() => categoryService.list(), 'get', '/categories'],
    [() => cartService.get(), 'get', '/cart'],
    [() => cartService.add(3, 2), 'post', '/cart', { product_id: 3, quantity: 2 }],
    [() => cartService.update(9, 4), 'put', '/cart/9', { quantity: 4 }],
    [() => cartService.remove(9), 'delete', '/cart/9'],
    [() => wishlistService.list(), 'get', '/wishlist'],
    [() => wishlistService.add(3), 'post', '/wishlist', { product_id: 3 }],
    [() => wishlistService.remove(3), 'delete', '/wishlist/3'],
    [() => orderService.list(), 'get', '/orders'],
    [() => orderService.create({ s: 1 }), 'post', '/orders', { s: 1 }],
    [() => orderService.get(7), 'get', '/orders/7'],
    [() => aiService.productRecommendations(5), 'get', '/products/5/recommendations'],
    [() => adminService.dashboard(), 'get', '/admin/dashboard'],
    [() => adminService.createProduct({ n: 1 }), 'post', '/admin/products', { n: 1 }],
    [() => adminService.updateProduct(2, { n: 1 }), 'put', '/admin/products/2', { n: 1 }],
    [() => adminService.deleteProduct(2), 'delete', '/admin/products/2'],
    [() => adminService.categories(), 'get', '/admin/categories'],
    [() => adminService.createCategory({ n: 1 }), 'post', '/admin/categories', { n: 1 }],
    [() => adminService.updateCategory(2, { n: 1 }), 'put', '/admin/categories/2', { n: 1 }],
    [() => adminService.deleteCategory(2), 'delete', '/admin/categories/2'],
    [() => adminService.updateOrderStatus(2, 'shipped'), 'patch', '/admin/orders/2/status', { status: 'shipped' }],
    [() => adminService.toggleUser(2), 'patch', '/admin/users/2/toggle'],
    [() => adminService.coupons(), 'get', '/admin/coupons'],
    [() => adminService.createCoupon({ c: 1 }), 'post', '/admin/coupons', { c: 1 }],
    [() => adminService.deleteCoupon(2), 'delete', '/admin/coupons/2'],
  ])('appel %#', async (call, method, url, body) => {
    await call();
    expect(api[method]).toHaveBeenCalledTimes(1);
    expect(api[method].mock.calls[0][0]).toBe(url);
    if (body !== undefined) expect(api[method].mock.calls[0][1]).toEqual(body);
  });

  it('passe les filtres en query string', async () => {
    await productService.list({ search: 'robe', page: 2 });
    expect(api.get).toHaveBeenCalledWith('/products', { params: { search: 'robe', page: 2 } });

    await aiService.recommendations({ limit: 4 });
    expect(api.get).toHaveBeenCalledWith('/ai/recommendations', { params: { limit: 4 } });

    await adminService.products({ page: 3 });
    await adminService.orders({ page: 3 });
    await adminService.users({ page: 3 });
    expect(api.get).toHaveBeenCalledWith('/admin/products', { params: { page: 3 } });
    expect(api.get).toHaveBeenCalledWith('/admin/orders', { params: { page: 3 } });
    expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { page: 3 } });
  });

  it('envoie les fichiers en FormData (avis, image produit, recherche photo)', async () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    await reviewService.create(5, { rating: 4, comment: 'Top', imageFile: file });
    const reviewFd = api.post.mock.calls[0][1];
    expect(api.post.mock.calls[0][0]).toBe('/products/5/reviews');
    expect(reviewFd.get('rating')).toBe('4');
    expect(reviewFd.get('comment')).toBe('Top');
    expect(reviewFd.get('image')).toBe(file);

    await adminService.uploadProductImage(2, file);
    expect(api.post.mock.calls[1][0]).toBe('/admin/products/2/image');
    expect(api.post.mock.calls[1][1].get('image')).toBe(file);

    await aiService.searchImage(file);
    expect(api.post.mock.calls[2][0]).toBe('/ai/search-image');
    expect(api.post.mock.calls[2][1].get('image')).toBe(file);
  });
});
