import { get } from './index';

function getProducts() {
  return get('/v1/products?_limit=-1');
}

export { getProducts };
