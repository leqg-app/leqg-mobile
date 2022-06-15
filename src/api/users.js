import { post, put, get } from './index';

function signUp(data) {
  return post('/v2/auth/local/register', data);
}

function signUpProvider(provider, data) {
  return post(`/v2/auth/${provider}/register`, data);
}

function signIn(data) {
  return post('/v2/auth/local', data);
}

function signInProvider(provider, auth_token) {
  return get(`/v2/auth/${provider}/callback?auth_token=${auth_token}`);
}

function resetPassword(data) {
  return post('/v2/auth/forgot-password', data);
}

function getProfile(jwt) {
  return get('/v2/users/me', { Authorization: `Bearer ${jwt}` });
}

function getContributions(jwt) {
  return get('/v2/users/me/contributions', { Authorization: `Bearer ${jwt}` });
}

function updateProfile(jwt, data) {
  return put('/v2/users/me', data, { Authorization: `Bearer ${jwt}` });
}

export {
  signUp,
  signIn,
  getProfile,
  updateProfile,
  resetPassword,
  getContributions,
  signInProvider,
  signUpProvider,
};
