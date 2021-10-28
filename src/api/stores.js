import { get, post } from './index';

function getStores() {
  return get(`/v1/stores`);
}

function getStore(id) {
  return get(`/v1/stores/${id}`);
}

function getVersion() {
  return get(`/v1/version`);
}

function addStore(data, { jwt }) {
  return post('/v1/stores', data, { Authorization: `bearer ${jwt}` });
}

export { getVersion, getStores, getStore, addStore };
