import { get } from './index';

function getRates(version) {
  return get(`/v1/currencies?v=${version || 1}`);
}

export { getRates };
