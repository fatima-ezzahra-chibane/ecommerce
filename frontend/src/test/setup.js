import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom ne fournit pas createObjectURL (aperçu des images uploadées)
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:apercu');
}
