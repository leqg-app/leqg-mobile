import { get } from './index';

function getProducts() {
  return get('/products');
}

export { getProducts };
