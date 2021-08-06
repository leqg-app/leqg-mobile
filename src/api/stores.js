import { get, post } from './index';

function getStores() {
  return get('/stores');
}

function addStore(data, { jwt }) {
  return post('/stores', data, { Authorization: `bearer ${jwt}` });
}

export { getStores, addStore };
