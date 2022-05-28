import { get } from './index';

function getProducts(version) {
  return get(`/v1/products?v=${version || 1}`);
}

export { getProducts };
