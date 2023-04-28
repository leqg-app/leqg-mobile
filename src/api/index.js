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

export const get = request('GET');
export const post = request('POST');
export const put = request('PUT');
export const del = request('DELETE');
