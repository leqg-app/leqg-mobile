import { api as apiEndpoint } from '../../app.json';

function request(method) {
  return function (path, data = {}, headers = {}) {
    return fetch(`${apiEndpoint}${path}`, {
      method,
      headers: {
        ...(method === 'GET' ? data : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(method !== 'GET' && { body: JSON.stringify(data) }),
    }).then(res => res.json());
  };
}

export const get = request('get');
export const post = request('post');
export const put = request('put');
export const del = request('delete');
