import { get, post } from './index';

function getStores() {
  return get('/stores');
}

function addStore(data, { token }) {
  return post('/stores', data, { Authorization: `bearer ${token}` });
}

export default { getStores, addStore };
