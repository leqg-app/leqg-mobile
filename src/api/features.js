import { get } from './index';

function getFeatures(version) {
  return get(`/v1/features?v=${version || 1}`);
}

export { getFeatures };
