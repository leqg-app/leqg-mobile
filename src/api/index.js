import { api as apiEndpoint } from '../../app.json';

function get(path, headers = {}) {
  return fetch(`${apiEndpoint}${path}`, {
    headers,
  }).then(res => res.json());
}

function post(path, data, headers = {}) {
  return fetch(`${apiEndpoint}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
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
    },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

export { get, post, put };
