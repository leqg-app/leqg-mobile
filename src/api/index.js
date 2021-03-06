import { api as apiEndpoint } from '../../app.json';
import { getUniqueId } from 'react-native-device-info';

const defaultHeaders = {
  'x-uniq-id': getUniqueId(),
};

function get(path, headers = {}) {
  return fetch(`${apiEndpoint}${path}`, {
    headers: {
      ...headers,
      ...defaultHeaders,
    },
  }).then(res => res.json());
}

function post(path, data, headers = {}) {
  return fetch(`${apiEndpoint}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...defaultHeaders,
    },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

function put(path, data, headers = {}) {
  return fetch(`${apiEndpoint}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...defaultHeaders,
    },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

export { get, post, put };
