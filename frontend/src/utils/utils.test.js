import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';
import { getPromo } from './productDisplay';
import { resolveMediaUrl } from './mediaUrl';

describe('formatPrice', () => {
  it('formate en DH avec 2 décimales', () => {
    expect(formatPrice(12)).toBe('12.00 DH');
    expect(formatPrice('99.5')).toBe('99.50 DH');
  });

  it('retourne 0.00 DH pour une valeur invalide', () => {
    expect(formatPrice('abc')).toBe('0.00 DH');
  });
});

describe('getPromo', () => {
  it('calcule le pourcentage de réduction', () => {
    expect(getPromo({ price: 80, original_price: 100 })).toEqual({ original: 100, percent: 20 });
  });

  it('pas de promo sans ancien prix ou si ancien prix <= prix', () => {
    expect(getPromo({ price: 80, original_price: null })).toBeNull();
    expect(getPromo({ price: 100, original_price: 90 })).toBeNull();
  });
});

describe('resolveMediaUrl', () => {
  it('préfixe les chemins /storage avec l’URL de l’API', () => {
    expect(resolveMediaUrl('/storage/products/a.png')).toBe('http://localhost:8080/storage/products/a.png');
    expect(resolveMediaUrl('storage/a.png')).toBe('http://localhost:8080/storage/a.png');
  });

  it('remplace localhost:xxxx par l’URL de l’API', () => {
    expect(resolveMediaUrl('http://localhost/storage/a.png')).toBe('http://localhost:8080/storage/a.png');
  });

  it('garde les URL externes et data:image', () => {
    expect(resolveMediaUrl('https://cdn.test/a.png')).toBe('https://cdn.test/a.png');
    expect(resolveMediaUrl('data:image/png;base64,xx')).toBe('data:image/png;base64,xx');
  });

  it('retourne null pour une valeur vide', () => {
    expect(resolveMediaUrl('')).toBeNull();
    expect(resolveMediaUrl(null)).toBeNull();
  });
});
