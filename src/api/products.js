import { get } from './index';

function getProducts() {
  return get('/products?_limit=-1');
}

export { getProducts };
