import { post, put, get } from './index';

function signUp(data) {
  return post('/auth/local/register', data);
}

function signIn(data) {
  return post('/auth/local', data);
}

function getProfile(jwt) {
  return get('/users/me', { Authorization: `Bearer ${jwt}` });
}

function updateProfile(jwt, data) {
  return put('/users/me', data, { Authorization: `Bearer ${jwt}` });
}

export { signUp, signIn, getProfile, updateProfile };
