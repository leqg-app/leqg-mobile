import { get, post, put } from './index';

function getVersion() {
  return get(`/v1/version`);
}

function getStores(version) {
  return get(`/v1/stores?v=${version || 1}`);
}

function getStore(id) {
  return get(`/v1/stores/${id}`);
}

function addStore(data, { jwt }) {
  return post('/v1/stores', data, { Authorization: `bearer ${jwt}` });
}

function editStore(id, data, { jwt }) {
  return put(`/v1/stores/${id}`, data, { Authorization: `bearer ${jwt}` });
}

export { getVersion, getStores, getStore, addStore, editStore };
