import { get, post, put } from './index';

const getVersion = get(`/v1/version`, { 'cache-control': 'no-store' }).catch(
  () => ({}),
);

function getStores(version) {
  return get(`/v2/stores?v=${version || 1}`);
}

function getStoresVersion(currentVersion, nextVersion) {
  return get(`/v2/stores/versions/${currentVersion}..${nextVersion}`);
}

function getStore(id) {
  return get(`/v2/stores/${id}`);
}

function addStore(data, { jwt }) {
  return post('/v2/stores', data, { Authorization: `bearer ${jwt}` });
}

function editStore(id, data, { jwt }) {
  return put(`/v2/stores/${id}`, data, { Authorization: `bearer ${jwt}` });
}

function validateStore(id, data, { jwt }) {
  return post(`/v2/stores/${id}/validate`, data, {
    Authorization: `bearer ${jwt}`,
  });
}

function rateStore(id, data, { jwt }) {
  return post(`/v2/stores/${id}/rate`, data, {
    Authorization: `bearer ${jwt}`,
  });
}

export {
  getVersion,
  getStores,
  getStoresVersion,
  getStore,
  addStore,
  editStore,
  validateStore,
  rateStore,
};
