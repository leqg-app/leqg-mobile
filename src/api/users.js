import { post, put } from './index';

function signUp(data) {
  return post('/auth/local/register', data);
}

function signIn(data) {
  return post('/auth/local', data);
}

function updateProfile(user, jwt) {
  return put('/users/me', user, { Authorization: `Bearer ${jwt}` });
}

export { signUp, signIn, updateProfile };
