import { get, post, put } from './index';

function getVersion() {
  return get(`/v1/version`, { 'cache-control': 'no-store' });
}

function getStores(version) {
  return get(`/v2/stores?v=${version || 1}`);
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

export { getVersion, getStores, getStore, addStore, editStore };
